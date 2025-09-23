
import strawberry
from typing import Optional
from datetime import datetime

@strawberry.type
class ItemType:
    id: str
    code: str
    name: Optional[str] = None
    track_inventory: bool
    purchase: bool
    cost_price: Optional[float] = None
    purchase_account: Optional[str] = None
    purchase_tax_rate: Optional[float] = None
    purchase_description: Optional[str] = None
    sell: bool
    sale_price: Optional[float] = None
    sales_account: Optional[str] = None
    sales_tax_rate: Optional[float] = None
    sales_description: Optional[str] = None
    userId: Optional[str] = None

@strawberry.input
class ItemCreate:
    code: str
    name: Optional[str] = None
    category: Optional[str] = None
    trackInventory: bool = False
    purchase: bool = False
    costPrice: Optional[float] = None
    purchaseAccount: Optional[str] = None
    purchaseTaxRate: Optional[float] = None
    purchaseDescription: Optional[str] = None
    sell: bool = False
    salePrice: Optional[float] = None
    salesAccount: Optional[str] = None
    salesTaxRate: Optional[float] = None
    salesDescription: Optional[str] = None
    userId: Optional[str] = None
    user: Optional[str] = None
    created: datetime
    updated: datetime
