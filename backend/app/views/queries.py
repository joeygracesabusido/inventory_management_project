import strawberry
from typing import List, Optional
from datetime import datetime
from app.schemas.category import CategoryType
from app.crud.category import get_categories
from app.schemas.contact import ContactType
from app.crud.contact import get_contacts
from app.crud.sales_order import get_cogs_report
from app.crud.stock import get_inventory_valuation_report, get_oldest_stock_selling_price
from app.schemas.inventory_report import InventoryReportItemType
from app.schemas.cogs import CogsReportItem
from app.crud.cogs import calculate_cogs_per_item

@strawberry.type
class Query:
    @strawberry.field
    async def categories(self, name: Optional[str] = None) -> List[CategoryType]:
        categories = await get_categories(name)
        #print(categories)
        return [CategoryType(id=str(c["_id"]), name=c["name"], user=c['user']) for c in categories]

    @strawberry.field
    async def contacts(self, name: Optional[str] = None) -> List[ContactType]:
        contacts = await get_contacts(name)
        return [ContactType(id=str(c["_id"]), contact_name=c["contact_name"]) for c in contacts]

    @strawberry.field
    async def cogsReport(self, startDate: Optional[datetime] = None, endDate: Optional[datetime] = None) -> float:
        total_cogs = await get_cogs_report(start_date=startDate, end_date=endDate)
        return total_cogs

    @strawberry.field
    async def cogs_per_item_report(self) -> List[CogsReportItem]:
        cogs_data = await calculate_cogs_per_item()
        return [CogsReportItem(**item) for item in cogs_data]

    @strawberry.field
    async def inventoryValuationReport(self, item_id: Optional[str] = None, startDate: Optional[datetime] = None, endDate: Optional[datetime] = None) -> List[InventoryReportItemType]:
        report_data = await get_inventory_valuation_report(item_id=item_id, start_date=startDate, end_date=endDate)
        return [InventoryReportItemType(**item) for item in report_data]

    @strawberry.field
    async def getItemSellingPriceFromStock(self, item_id: str) -> Optional[float]:
        selling_price = await get_oldest_stock_selling_price(item_id)
        return selling_price
