"""Configuration for the Site Validations Web UI."""

import os

# Base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SITE_VALIDATIONS_DIR = os.path.dirname(BASE_DIR)
VALIDATOR_SCRIPT = os.path.join(SITE_VALIDATIONS_DIR, "validator.sh")
OUTPUT_DIR = os.path.join(SITE_VALIDATIONS_DIR, "output")
CONFIG_FILE = os.path.join(SITE_VALIDATIONS_DIR, "config", "thresholds.conf")

# Flask settings
SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "site-validator-secret-key-change-me")
HOST = os.environ.get("FLASK_HOST", "0.0.0.0")
PORT = int(os.environ.get("FLASK_PORT", 15001))
DEBUG = os.environ.get("FLASK_DEBUG", "false").lower() == "true"

# Auth credentials (env vars override defaults)
AUTH_USERNAME = os.environ.get("VALIDATOR_USERNAME", "admin")
AUTH_PASSWORD = os.environ.get("VALIDATOR_PASSWORD", "validator2026")

# Valid commands the UI can execute
VALID_COMMANDS = ["crawl", "analytics", "performance", "html", "robots", "all"]

# Map commands to their expected output files
COMMAND_OUTPUT_FILES = {
    "crawl": "sitemap.json",
    "analytics": "analytics_report.json",
    "performance": "performance_report.json",
    "html": None,  # dynamic filename
    "robots": None,  # stdout only
    "all": ["sitemap.json", "analytics_report.json", "performance_report.json"],
}
