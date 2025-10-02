from bson import ObjectId
from app.db.database import db
from app.schemas.stock import StockCreate
from datetime import datetime
from typing import Optional

stock_collection = db.stock
sales_order_collection = db.sales_orders

async def create_stock(stock: StockCreate):
    stock_data = {
        "item_id": stock.item_id,
        "quantity": stock.quantity,
        "purchase_price": stock.purchase_price,
        "selling_price": stock.selling_price,
        "purchase_date": stock.purchase_date,
    }
    result = await stock_collection.insert_one(stock_data)
    return {**stock_data, "_id": result.inserted_id}

async def get_stock_by_item_id(item_id: str):
    stocks = await stock_collection.find({"item_id": item_id}).sort("purchase_date", 1).to_list(length=None)
    return stocks

async def get_oldest_stock_selling_price(item_id: str) -> Optional[float]:
    oldest_stock = await stock_collection.find_one({"item_id": item_id}, sort=[("purchase_date", 1)])
    if oldest_stock and "selling_price" in oldest_stock:
        return oldest_stock["selling_price"]
    return None

async def get_latest_stock_selling_price(item_id: str) -> Optional[float]:
    latest_stock = await stock_collection.find_one({"item_id": item_id}, sort=[("purchase_date", -1)])
    if latest_stock and "selling_price" in latest_stock:
        return latest_stock["selling_price"]
    return None

async def update_stock_quantity(stock_id: str, new_quantity: int):
    await stock_collection.update_one({"_id": ObjectId(stock_id)}, {"$set": {"quantity": new_quantity}})

async def delete_stock(stock_id: str):
    await stock_collection.delete_one({"_id": ObjectId(stock_id)})

async def get_item_stock_movements(item_id: Optional[str] = None, start_date: datetime = None, end_date: datetime = None):
    purchase_query = {}
    if item_id:
        purchase_query["item_id"] = item_id
    if start_date and end_date:
        purchase_query["purchase_date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        purchase_query["purchase_date"] = {"$gte": start_date}
    elif end_date:
        purchase_query["purchase_date"] = {"$lte": end_date}

    purchases = await stock_collection.find(purchase_query).to_list(length=None)
    movements = []
    for p in purchases:
        movements.append({
            "date": p["purchase_date"],
            "type": "Purchase",
            "transactionId": str(p["_id"]),
            "quantity": p["quantity"],
            "rate": p["purchase_price"],
            "value": p["quantity"] * p["purchase_price"],
            "profitMargin": 0, # Purchases don't have profit margin
        })

    sales_query = {}
    if item_id:
        sales_query["items.item_id"] = item_id
    if start_date and end_date:
        sales_query["invoice_date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        sales_query["invoice_date"] = {"$gte": start_date}
    elif end_date:
        sales_query["invoice_date"] = {"$lte": end_date}

    sales_orders = await sales_order_collection.find(sales_query).to_list(length=None)
    for order in sales_orders:
        for item in order["items"]:
            if item_id is None or item["item_id"] == item_id:
                movements.append({
                    "date": order["invoice_date"],
                    "type": "Sale",
                    "transactionId": str(order["_id"]),
                    "quantity": -item["quantity"], # Negative for sales
                    "rate": item["sale_price"],
                    "value": -item["quantity"] * item["sale_price"],
                    "profitMargin": (item["sale_price"] - item["cogs"]) * item["quantity"],
                })
    
    movements.sort(key=lambda x: x["date"])
    return movements

async def get_inventory_valuation_report(item_id: Optional[str] = None, start_date: datetime = None, end_date: datetime = None):
    movements = await get_item_stock_movements(item_id, start_date, end_date)

    running_quantity = 0
    running_value = 0
    report = []

    for move in movements:
        running_quantity += move["quantity"]
        running_value += move["value"]
        report.append({
            **move,
            "runningQuantity": running_quantity,
            "runningValue": running_value,
        })
    return report
