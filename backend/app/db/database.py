import motor.motor_asyncio
from app.core.config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DATABASE_URI)
db = client[settings.MONGO_DATABASE_NAME]

async def get_database():
    return db