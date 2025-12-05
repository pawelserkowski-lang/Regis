import os
import time
import json
import threading
from flask import Flask, jsonify, request
from flask_cors import CORS
import psutil
from datetime import datetime
from gemini_client import GeminiGuard
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPORT_PATH = os.path.join(BASE_DIR, "status_report.json")


def system_monitor_loop():
    print(f"\u1d48B  [MONITOR] Started. Writing to: {REPORT_PATH}")
    while True:
        try:
            battery = psutil.sensors_battery()
            plugged = battery.power_plugged if battery else False
            percent = battery.percent if battery else 100

            stats = {
                "timestamp": datetime.now().isoformat(),
                "cpu": psutil.cpu_percent(interval=None),
                "ram": psutil.virtual_memory().percent,
                "battery": percent,
                "plugged": plugged,
                "net_io": psutil.net_io_counters().bytes_recv // 1024,
                "status": "ONLINE",
                "progress": {
                    "phase": "IDLE",
                    "task": "System Monitoring"
                }
            }

            with open(REPORT_PATH + ".tmp", "w") as f:
                json.dump(stats, f)
            os.replace(REPORT_PATH + ".tmp", REPORT_PATH)

            time.sleep(1)
        except Exception as e:
            print(f"\u26a0 Monitor Error: {e}")
            time.sleep(2)


@app.route("/api/status")
def get_status():
    if os.path.exists(REPORT_PATH):
        with open(REPORT_PATH, "r") as f:
            return jsonify(json.load(f))
    return jsonify({"status": "OFFLINE", "message": "No data yet"})


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    user_message = data.get("message", "")
    logger.info(f"Received chat message: {user_message}")

    try:
        guard = GeminiGuard()
        response_text = guard.generate_content(user_message)
        logger.info("Generated response from Gemini")
        return jsonify({"response": response_text})
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return jsonify(
            {"response": f"Jules v2.0: Acknowledged. Processing input: '{user_message}'. (Offline Mode or Error: {str(e)})"}
        )


if __name__ == "__main__":
    monitor_thread = threading.Thread(target=system_monitor_loop, daemon=True)
    monitor_thread.start()

    print("\u1f680 [BACKEND] Regis Core online on port 5000...")
    app.run(port=5000, host="0.0.0.0", debug=False)
