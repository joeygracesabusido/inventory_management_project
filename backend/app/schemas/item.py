
import strawberry
from typing import Optional

@strawberry.type
class ItemType:
    id: str
    code: str
    name: Optional[str] = None
    track_inventory: bool
    purchase: bool
    cost_price: Optional[float] = None
    purchase_account: Optional[str] = None
    purchase_tax_rate: Optional[str] = None
    purchase_description: Optional[str] = None
    sell: bool
    sale_price: Optional[float] = None
    sales_account: Optional[str] = None
    sales_tax_rate: Optional[str] = None
    sales_description: Optional[str] = None

@strawberry.input
class ItemCreate:
    code: str
    name: Optional[str] = None
    track_inventory: bool = False
    purchase: bool = False
    cost_price: Optional[float] = None
    purchase_account: Optional[str] = None
    purchase_tax_rate: Optional[str] = None
    purchase_description: Optional[str] = None
    sell: bool = False
    sale_price: Optional[float] = None
    sales_account: Optional[str] = None
    sales_tax_rate: Optional[str] = None
    sales_description: Optional[str] = None
