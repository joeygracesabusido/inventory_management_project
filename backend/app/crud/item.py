
from app.schemas.item import ItemCreate
from app.db.database import get_database

async def create_item(item: ItemCreate):
    db = await get_database()
    item_dict = {
        "code": item.code,
        "name": item.name,
        "track_inventory": item.track_inventory,
        "purchase": item.purchase,
        "cost_price": item.cost_price,
        "purchase_account": item.purchase_account,
        "purchase_tax_rate": item.purchase_tax_rate,
        "purchase_description": item.purchase_description,
        "sell": item.sell,
        "sale_price": item.sale_price,
        "sales_account": item.sales_account,
        "sales_tax_rate": item.sales_tax_rate,
        "sales_description": item.sales_description,
    }
    result = await db.items.insert_one(item_dict)
    return {**item_dict, "_id": str(result.inserted_id)}
