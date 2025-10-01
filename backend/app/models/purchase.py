from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PurchaseItem(BaseModel):
    item_id: str
    quantity: int
    purchase_price: float

class Purchase(BaseModel):
    supplier_name: str
    purchase_date: datetime
    items: List[PurchaseItem]
    subtotal: float
    vat: float
    total: float
    created_at: datetime = Field(default_factory=datetime.utcnow)