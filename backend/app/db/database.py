from pymongo import MongoClient
from app.core.config import settings

client = MongoClient(settings.MONGO_DATABASE_URI)
db = client[settings.MONGO_DATABASE_NAME]

def get_db():
    return db
