import os

class Settings:
    # App settings
    APP_TITLE: str = os.getenv("APP_TITLE", "Inventory Management System")
    APP_VERSION: str = os.getenv("APP_VERSION", "0.1.0")

    # Database
    MONGO_DATABASE_URI: str = os.getenv("MONGO_DATABASE_URI")
    MONGO_DATABASE_NAME: str = os.getenv("MONGO_DATABASE_NAME")

    # JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 120))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

settings = Settings()
