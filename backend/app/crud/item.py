
from app.schemas.item import ItemCreate
from app.db.database import get_database
from pymongo.collation import Collation


# Case-insensitive uniqueness (e.g., "ABC" == "abc")
CASE_INSENSITIVE = Collation(locale="en", strength=2)

async def create_item(item: ItemCreate):
    db = await get_database()

    await db.items.create_index(
        [("code", 1)],
        name="uniq_code_ci",
        unique=True,
        collation=CASE_INSENSITIVE,
    )
    await db.items.create_index(
        [("name", 1)],
        name="uniq_name_ci",
        unique=True,
        collation=CASE_INSENSITIVE,
    )

    item_dict = {
        "code": item.code,
        "name": item.name,
        "category": item.category,
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
        "user_id": item.userId,
    }
    result = await db.items.insert_one(item_dict)
    return {**item_dict, "_id": str(result.inserted_id)}
