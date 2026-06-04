import os
from datetime import timedelta


class Config:
    SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "change-me-in-production")
    ALLOWED_CORS_DOMAINS = os.environ.get("ALLOWED_CORS_DOMAINS", "")
    BACKEND_HOST = os.environ.get("BACKEND_HOST", "127.0.0.1")
    BACKEND_PORT = int(os.environ.get("BACKEND_PORT", 5001))

    # Session — cookie scoped to all subdomains; SameSite=None+Secure for cross-subdomain AJAX
    SESSION_COOKIE_DOMAIN = os.environ.get("SESSION_COOKIE_DOMAIN") or None
    SESSION_COOKIE_SAMESITE = "None"
    SESSION_COOKIE_SECURE = True
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)

    # OTP
    OTP_DEV_MODE = os.environ.get("OTP_DEV_MODE", "true").lower() == "true"
    OTP_EXPIRY_SECONDS = 300   # 5 minutes
    OTP_RATE_LIMIT_MAX = 3     # requests per window
    OTP_RATE_LIMIT_WINDOW = 60 # seconds

    # MongoDB
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27028/myapp")

    # SMTP (basic — no queues, no retries)
    SMTP_HOST = os.environ.get("SMTP_HOST", "")
    SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
    SMTP_USER = os.environ.get("SMTP_USER", "")
    SMTP_PASS = os.environ.get("SMTP_PASS", "")
    # Contact form notifications — defaults to SMTP_USER if not set
    NOTIFICATION_EMAIL = os.environ.get("NOTIFICATION_EMAIL") or os.environ.get("SMTP_USER", "")

    # flask-restx
    RESTX_MASK_SWAGGER = False
    SWAGGER_UI_DOC_EXPANSION = "list"

    # Super admin (env-based, always exists)
    ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@platform-template.com")
    ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")

    # Contact
    CONTACT_RATE_LIMIT_MAX = 3
    CONTACT_RATE_LIMIT_WINDOW = 60

    APP_NAME = os.environ.get("APP_NAME", "App")
    VERSION_MAJOR        = os.environ.get("VERSION_MAJOR", "2")
    VERSION_MINOR        = os.environ.get("VERSION_MINOR", "0")
    VERSION_BUILD_NUMBER = os.environ.get("VERSION_BUILD_NUMBER", "0")

    # Site gate
    SITE_ACCESS_MODE       = os.environ.get("SITE_ACCESS_MODE", "open")
    SITE_PASSWORD          = os.environ.get("SITE_PASSWORD", "")
    MAINTENANCE_TARGET_UTC = os.environ.get("MAINTENANCE_TARGET_UTC", "")

    # Frontend URL (shown in admin nav → Frontend link)
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "")
