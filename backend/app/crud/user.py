from app.db.database import db
from bson import ObjectId

async def get_user_by_email(email: str):
    user = await db.users.find_one({"email": email})
    if user:
        user["id"] = str(user["_id"])
    return user

async def create_user(user_data: dict):
    user = await db.users.insert_one(user_data)
    new_user = await db.users.find_one({"_id": user.inserted_id})
    if new_user:
        new_user["id"] = str(new_user["_id"])
    return new_user
