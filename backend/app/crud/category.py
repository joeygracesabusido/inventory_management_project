from app.db.database import get_database
import re
from pymongo.collation import Collation
from pymongo.errors import DuplicateKeyError

# Case-insensitive uniqueness (e.g., "ABC" == "abc")
CASE_INSENSITIVE = Collation(locale="en", strength=2)

async def get_categories(name: str = None):
    db = await get_database()
    query = {}
    if name:
        query["name"] = re.compile(name, re.IGNORECASE)
    categories = await db.categories.find(query).to_list(length=100)
    return categories




# async def create_category(category_data):
#     db = await get_database()

#     await db.items.create_index(
#         [("code", 1)],
#         name="uniq_code_ci",
#         unique=True,
#         collation=CASE_INSENSITIVE,
#     )
#     # Check if category already exists (case-insensitive)

#     try:
    
#         result = await db.categories.insert_one({"name": category_data.name, "user": category_data.user})

#     except DuplicateKeyError:
#         # Already exists (for that user, case-insensitive)
#         # Optionally fetch existing if you want to return it instead of raising:
#         # existing = await db.categories.find_one(
#         #     {"userId": doc["userId"], "name": doc["name"]},
#         #     collation=CASE_INSENSITIVE,
#         # )
#         raise Exception("Category with this name already exists.")

  
    
#     new_category = await db.categories.find_one({"_id": result.inserted_id})
#     return new_category

async def create_category(category_data):
    db = await get_database()

    # Ensure unique index on (userId, name), case-insensitive
    await db.categories.create_index(
        [ ("name", 1)],
        name="uniq_name_ci",
        unique=True,
        collation=CASE_INSENSITIVE,
    )

    doc = {
        "name": category_data.name.strip(),
        "user": str(category_data.user),
    }

    try:
        result = await db.categories.insert_one(doc)
        
    except DuplicateKeyError:
        raise Exception("Category with this name already exists.")

    new_category = await db.categories.find_one({"_id": result.inserted_id})
    return new_category
