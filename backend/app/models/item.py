from pydantic import BaseModel

class Item(BaseModel):
    code: str
    name: str
    track_inventory: bool
    purchase: bool
    cost_price: float
    purchase_account: str
    purchase_tax_rate: float
    purchase_description: str
    sell: bool
    sale_price: float
    sales_account: str
    sales_tax_rate: float
    sales_description: str