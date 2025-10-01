import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class PurchaseItemType:
    itemId: str = strawberry.field(name="itemId")
    quantity: int
    purchasePrice: float = strawberry.field(name="purchasePrice")
    sellingPrice: Optional[float] = strawberry.field(name="sellingPrice")

@strawberry.type
class PurchaseType:
    id: str
    supplierName: str = strawberry.field(name="supplierName")
    purchaseDate: datetime = strawberry.field(name="purchaseDate")
    items: List[PurchaseItemType]
    subtotal: float
    vat: float
    total: float
    createdAt: datetime = strawberry.field(name="createdAt")

@strawberry.input
class PurchaseItemCreate:
    itemId: str = strawberry.field(name="itemId")
    quantity: int
    purchasePrice: float = strawberry.field(name="purchasePrice")
    sellingPrice: Optional[float] = strawberry.field(name="sellingPrice")

@strawberry.input
class PurchaseCreate:
    supplierName: str = strawberry.field(name="supplierName")
    purchaseDate: datetime = strawberry.field(name="purchaseDate")
    items: List[PurchaseItemCreate]
    subtotal: float
    vat: float
    total: float