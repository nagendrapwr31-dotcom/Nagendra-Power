import asyncio
import json
import logging
import pandas as pd
import ta
from collections import deque

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

class DerivLiveBackend:
    def __init__(self, symbol="R_100", app_id=1089, max_window=100):
        """
        Initializes the Deriv backend client.
        :param symbol: The asset symbol (e.g., 'R_100' for Volatility 100 Index, 'frxEURUSD' for Forex)
        :param app_id: Your Deriv App ID (Default 1089 is for testing/public data)
        :param max_window: Number of recent ticks to keep in memory for analysis
        """
        self.symbol = symbol
        self.uri = f"wss://ws.derivws.com/websockets/v3?app_id={app_id}"
        self.tick_history = deque(maxlen=max_window)
        self.df = pd.DataFrame()

    async def connect_and_stream(self):
        """Establishes websocket connection and maintains the live stream loop."""
        import websockets

        logging.info(f"Connecting to Deriv API at {self.uri}")
        async with websockets.connect(self.uri) as websocket:
            # Subscribe to the live tick stream
            subscribe_msg = {"ticks": self.symbol}
            await websocket.send(json.dumps(subscribe_msg))
            logging.info(f"Subscribed successfully to live ticks for {self.symbol}")

            # Keep listening for incoming data
            async for message in websocket:
                data = json.loads(message)

                # Check for errors
                if "error" in data:
                    logging.error(f"API Error: {data['error']['message']}")
                    continue

                # Process tick data
                if data.get("msg_type") == "tick":
                    tick = data.get("tick")
                    if tick:
                        self._process_incoming_tick(tick)

    def _process_incoming_tick(self, tick):
        """Parses the raw tick and pushes it to the analytics pipeline."""
        tick_data = {
            "timestamp": pd.to_datetime(tick.get("epoch"), unit="s"),
            "price": float(tick.get("quote")),
        }

        # Append to fixed-size deque
        self.tick_history.append(tick_data)

        # Convert deque to DataFrame for vector calculations
        self.df = pd.DataFrame(list(self.tick_history))

        # Run Analytics
        self.analyze_data()

    def analyze_data(self):
        """Performs real-time math and indicators on the streaming data frame."""
        if len(self.df) < 14:  # Minimum rows needed for stable indicator calculations
            logging.info(f"Gathering data... Ticks cached: {len(self.df)}")
            return

        # 1. Compute Relative Strength Index (RSI)
        self.df["RSI"] = ta.momentum.rsi(close=self.df["price"], window=14)

        # 2. Compute Simple Moving Average (SMA)
        self.df["SMA_20"] = ta.trend.sma_indicator(close=self.df["price"], window=20)

        # Extract the latest calculated row
        latest_row = self.df.iloc[-1]

        # 3. Simple live logic execution
        signal = "HOLD"
        if latest_row["RSI"] < 30:
            signal = "OVERSOLD (Potential BUY)"
        elif latest_row["RSI"] > 70:
            signal = "OVERBOUGHT (Potential SELL)"

        # Output the live calculations
        print(
            f" Time: {latest_row['timestamp'].strftime('%H:%M:%S')} | "
            f"Price: {latest_row['price']:.2f} | "
            f"RSI: {latest_row['RSI']:.2f} | "
            f"SMA(20): {latest_row['SMA_20']:.2f} | "
            f"Signal: **{signal}**"
        )

# --- Execution Block ---
if __name__ == "__main__":
    # Choose your Deriv market asset (e.g., 'R_10', 'R_50', 'R_100', 'frxAUDUSD')
    backend = DerivLiveBackend(symbol="R_100", max_window=150)

    try:
        asyncio.run(backend.connect_and_stream())
    except KeyboardInterrupt:
        logging.info("Backend streaming stopped by user.")
