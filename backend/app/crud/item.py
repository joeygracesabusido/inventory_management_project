
from app.schemas.item import ItemCreate
from app.db.database import get_database
from pymongo.collation import Collation


# Case-insensitive uniqueness (e.g., "ABC" == "abc")
CASE_INSENSITIVE = Collation(locale="en", strength=2)

async def create_item(item: ItemCreate):
    db = await get_database()

    # Check if item with the same code already exists
    # if await db.items.find_one({"code": item.code}, collation=CASE_INSENSITIVE):
    #     raise Exception(f"Item with code '{item.code}' already exists")
    
    # if await db.items.find_one({"name": item.name}, collation=CASE_INSENSITIVE):
    #     raise Exception(f"Item with Name '{item.name}' already exists")

    item_collection = db['item']
    item_collection.create_index("code", unique=True)
    item_collection.create_index("name", unique=True)

    try:

        item_dict = {
            "code": item.code,
            "name": item.name,
            "category": item.category,
            "measurement": item.measurement,
            "barcode": item.barcode,
            "supplier": item.supplier,
            "track_inventory": item.trackInventory,
            "purchase": item.purchase,
            "cost_price": item.costPrice,
            "purchase_account": item.purchaseAccount,
            "purchase_tax_rate": item.purchaseTaxRate,
            "purchase_description": item.purchaseDescription,
            "sell": item.sell,
            "sale_price": item.salePrice,
            "sales_account": item.salesAccount,
            "sales_tax_rate": item.salesTaxRate,
            "sales_description": item.salesDescription,
            "user": item.user,
            "created_at": item.created_at,
            "updated_at": item.updated_at
        }
        result = await db.items.insert_one(item_dict)
        return {**item_dict, "_id": str(result.inserted_id)}
    except:
        raise Exception(f"Item with Name '{item.name}' or Code'{item.code}'already exists")

async def get_items():
    db = await get_database()
    items_cursor = db.items.find({})
    items = []
    async for item in items_cursor:
        items.append(item)
    return items