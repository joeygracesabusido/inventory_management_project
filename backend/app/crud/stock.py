from bson import ObjectId
from app.db.database import db
from app.schemas.stock import StockCreate

stock_collection = db.stock

async def create_stock(stock: StockCreate):
    stock_data = stock.dict()
    result = await stock_collection.insert_one(stock_data)
    return {**stock_data, "_id": result.inserted_id}

async def get_stock_by_item_id(item_id: str):
    stocks = await stock_collection.find({"item_id": item_id}).sort("purchase_date", 1).to_list(length=None)
    return stocks

async def update_stock_quantity(stock_id: str, new_quantity: int):
    await stock_collection.update_one({"_id": ObjectId(stock_id)}, {"$set": {"quantity": new_quantity}})

async def delete_stock(stock_id: str):
    await stock_collection.delete_one({"_id": ObjectId(stock_id)})
