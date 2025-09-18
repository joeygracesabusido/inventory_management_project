import motor.motor_asyncio
from app.core.config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DATABASE_URI)
db = client[settings.MONGO_DATABASE_NAME]

async def create_unique_indexes():
    await db.categories.create_index("name", unique=True)

# Call this function during application startup
# For now, we'll just define it here. It should be called in main.py on startup.

async def get_database():
    return db