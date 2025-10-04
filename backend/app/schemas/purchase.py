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
    invoiceNumber: Optional[str] = strawberry.field(name='invoiceNumber', default=None)
    deliveryNumber: Optional[str] = strawberry.field(name='invoiceNumber', default=None)
    supplierName: str = strawberry.field(name="supplierName")
    purchaseDate: datetime = strawberry.field(name="purchaseDate")
    items: List[PurchaseItemType]
    subtotal: float
    vat: float
    total: float
    createdAt: datetime = strawberry.field(name="createdAt")
    updatedAt: datetime = strawberry.field(name="updatedAt")
    userId: Optional[str] = strawberry.field(name="userId", default=None)

@strawberry.input
class PurchaseItemCreate:
    itemId: str = strawberry.field(name="itemId")
    quantity: int
    purchasePrice: float = strawberry.field(name="purchasePrice")
    sellingPrice: Optional[float] = strawberry.field(name="sellingPrice", default=None)

@strawberry.input
class PurchaseCreate:
    invoiceNumber: Optional[str] = strawberry.field(name='invoiceNumber', default=None)
    deliveryNumber: Optional[str] = strawberry.field(name='invoiceNumber', default=None)
    supplierName: str = strawberry.field(name="supplierName")
    purchaseDate: datetime = strawberry.field(name="purchaseDate")
    items: List[PurchaseItemCreate]
    subtotal: float
    vat: float
    total: float