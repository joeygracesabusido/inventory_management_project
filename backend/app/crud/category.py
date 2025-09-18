from app.db.database import get_database

async def create_category(category_data):
    db = await get_database()
    result = await db.categories.insert_one({"name": category_data.name})
    new_category = await db.categories.find_one({"_id": result.inserted_id})
    return new_category
