from app.db.database import db
from app.schemas.purchase import PurchaseCreate
from app.schemas.stock import StockCreate
from app.crud.stock import create_stock
from datetime import datetime

purchase_collection = db.purchases

async def create_purchase(purchase: PurchaseCreate):
    purchase_data = {
        "supplier_name": purchase.supplierName,
        "purchase_date": purchase.purchaseDate,
        "items": [
            {
                "item_id": item.itemId,
                "quantity": item.quantity,
                "purchase_price": item.purchasePrice,
                "selling_price": item.sellingPrice,
            }
            for item in purchase.items
        ],
        "subtotal": purchase.subtotal,
        "vat": purchase.vat,
        "total": purchase.total,
        "created_at": datetime.utcnow(),
    }
    result = await purchase_collection.insert_one(purchase_data)

    for item in purchase.items:
        stock_data = StockCreate(
            item_id=item.itemId,
            quantity=item.quantity,
            purchase_price=item.purchasePrice,
            selling_price=item.sellingPrice,
            purchase_date=purchase.purchaseDate
        )
        await create_stock(stock_data)

    return {**purchase_data, "_id": result.inserted_id}

async def get_purchase(purchase_id: str):
    return await purchase_collection.find_one({"_id": purchase_id})

async def get_all_purchases():
    return await purchase_collection.find().to_list(length=None)
