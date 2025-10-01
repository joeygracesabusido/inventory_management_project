import strawberry
from typing import Optional
from datetime import datetime

@strawberry.type
class StockType:
    id: str
    item_id: str
    quantity: int
    purchase_price: float
    selling_price: Optional[float] = None
    purchase_date: datetime

@strawberry.input
class StockCreate:
    item_id: str
    quantity: int
    purchase_price: float
    selling_price: Optional[float] = None
    purchase_date: Optional[datetime] = None

@strawberry.input
class StockUpdate:
    quantity: Optional[int] = None
    purchase_price: Optional[float] = None
