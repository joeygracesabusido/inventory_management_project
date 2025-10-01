
from app.schemas.item import ItemCreate, ItemUpdate
from app.db.database import get_database
from pymongo.collation import Collation
from bson import ObjectId


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

async def get_items(search_term: str = None, page: int = 1, page_size: int = 20):
    db = await get_database()
    
    pipeline = []

    # Match stage for searching
    if search_term:
        pipeline.append({
            "$match": {
                "$or": [
                    {"name": {"$regex": search_term, "$options": "i"}},
                    {"code": {"$regex": search_term, "$options": "i"}},
                    {"category": {"$regex": search_term, "$options": "i"}},
                ]
            }
        })

    # Add a field to convert _id to string
    pipeline.append({
        "$addFields": {
            "item_id_str": {"$toString": "$_id"}
        }
    })

    # Lookup stage to join with stock
    pipeline.extend([
        {
            "$lookup": {
                "from": "stock",
                "localField": "item_id_str",
                "foreignField": "item_id",
                "as": "stock_info"
            }
        },
        {
            "$unwind": {
                "path": "$stock_info",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$addFields": {
                "quantity": "$stock_info.quantity",
                "cost_price": "$stock_info.purchase_price"
            }
        }
    ])

    # Count total items
    count_pipeline = pipeline.copy()
    count_pipeline.append({"$count": "total_items"})
    count_result = await db.items.aggregate(count_pipeline).to_list(length=1)
    total_items = count_result[0]["total_items"] if count_result else 0

    # Pagination stages
    pipeline.extend([
        {"$skip": (page - 1) * page_size},
        {"$limit": page_size}
    ])

    items_cursor = db.items.aggregate(pipeline)
    
    items = []
    async for item in items_cursor:
        items.append(item)
        
    return {"items": items, "total_items": total_items}


async def itemAutocomplete(search_term: str = None, limit: int = 20):
    db = await get_database()
    
    query = {}
    if search_term:
        query = {
            "$or": [
                {"name": {"$regex": search_term, "$options": "i"}},
               
            ]
        }

    total_items = await db.items.count_documents(query)
    items_cursor = db.items.find(query).limit(limit)
    
    items = []
    async for item in items_cursor:
        items.append(item)
        
    return {"items": items, "total_items": total_items}

async def get_item(item_id: str):
    db = await get_database()
    item = await db.items.find_one({"_id": ObjectId(item_id)})
    return item

async def update_item(item_id: str, item_data: ItemUpdate):
    db = await get_database()
    
    item_dict = {
        "code": item_data.code,
        "name": item_data.name,
        "category": item_data.category,
        "measurement": item_data.measurement,
        "barcode": item_data.barcode,
        "supplier": item_data.supplier,
        "track_inventory": item_data.trackInventory,
        "purchase": item_data.purchase,
        "cost_price": item_data.costPrice,
        "purchase_account": item_data.purchaseAccount,
        "purchase_tax_rate": item_data.purchaseTaxRate,
        "purchase_description": item_data.purchaseDescription,
        "sell": item_data.sell,
        "sale_price": item_data.salePrice,
        "sales_account": item_data.salesAccount,
        "sales_tax_rate": item_data.salesTaxRate,
        "sales_description": item_data.salesDescription,
        "updated_at": item_data.updated_at
    }

    await db.items.update_one({"_id": ObjectId(item_id)}, {"$set": item_dict})
    
    return {**item_dict, "_id": item_id}