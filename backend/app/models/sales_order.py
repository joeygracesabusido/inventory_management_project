from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SalesOrderItem(BaseModel):
    item_id: str
    quantity: int
    sale_price: float
    cogs: float # Cost of Goods Sold for this line item

class SalesOrder(BaseModel):
    customer_name: str
    invoice_date: datetime
    items: List[SalesOrderItem]
    subtotal: float
    vat: float
    total: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
