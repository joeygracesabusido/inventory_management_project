from app.db.database import get_database
import re

async def get_categories(name: str = None):
    db = await get_database()
    query = {}
    if name:
        query["name"] = re.compile(name, re.IGNORECASE)
    categories = await db.categories.find(query).to_list(length=100)
    return categories

async def create_category(category_data):
    db = await get_database()
    # Check if category already exists (case-insensitive)
    existing_category = await db.categories.find_one({"name": {"$regex": f"^{re.escape(category_data.name)}$", "$options": "i"}})
    if existing_category:
        return None
    result = await db.categories.insert_one({"name": category_data.name})
    new_category = await db.categories.find_one({"_id": result.inserted_id})
    return new_category
