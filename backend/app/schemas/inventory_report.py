import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class InventoryReportItemType:
    date: datetime
    type: str
    transactionId: str = strawberry.field(name="transactionId")
    quantity: float
    rate: float
    value: float
    profitMargin: float = strawberry.field(name="profitMargin")
    runningQuantity: float = strawberry.field(name="runningQuantity")
    runningValue: float = strawberry.field(name="runningValue")
