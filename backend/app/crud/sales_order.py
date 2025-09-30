from app.db.database import db
from app.models.sales_order import SalesOrder

sales_order_collection = db.sales_orders

async def create_sales_order(sales_order: SalesOrder):
    sales_order_data = sales_order.dict()
    result = await sales_order_collection.insert_one(sales_order_data)
    return {**sales_order_data, "_id": result.inserted_id}
