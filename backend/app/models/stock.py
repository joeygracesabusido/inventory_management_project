from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Stock(BaseModel):
    item_id: str
    quantity: int
    purchase_price: float
    purchase_date: datetime = Field(default_factory=datetime.utcnow)
