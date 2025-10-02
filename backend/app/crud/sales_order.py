from app.db.database import db
from app.models.sales_order import SalesOrder
from datetime import datetime

sales_order_collection = db.sales_orders

async def create_sales_order(sales_order: SalesOrder):
    sales_order_data = sales_order.dict()
    result = await sales_order_collection.insert_one(sales_order_data)
    return {**sales_order_data, "_id": result.inserted_id}

async def get_all_sales_orders():
    return await sales_order_collection.find().to_list(length=None)

async def get_cogs_report(start_date: datetime = None, end_date: datetime = None) -> float:
    query = {}
    if start_date and end_date:
        query["invoice_date"] = {"$gte": start_date, "$lte": end_date}
    elif start_date:
        query["invoice_date"] = {"$gte": start_date}
    elif end_date:
        query["invoice_date"] = {"$lte": end_date}

    total_cogs = 0
    sales_orders = await sales_order_collection.find(query).to_list(length=None)
    for order in sales_orders:
        for item in order["items"]:
            total_cogs += item["cogs"]
    return total_cogs
