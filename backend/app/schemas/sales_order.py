import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class SalesOrderItemType:
    item_id: str
    quantity: int
    sale_price: float
    cogs: float

@strawberry.type
class SalesOrderType:
    id: str
    customer_name: str
    invoice_date: datetime
    items: List[SalesOrderItemType]
    subtotal: float
    vat: float
    total: float
    created_at: datetime

@strawberry.input
class SalesOrderItemCreate:
    item_id: str
    quantity: int
    sale_price: float

@strawberry.input
class SalesOrderCreate:
    customer_name: str
    invoice_date: datetime
    items: List[SalesOrderItemCreate]
    subtotal: float
    vat: float
    total: float
