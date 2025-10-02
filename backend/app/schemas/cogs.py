import strawberry

@strawberry.type
class CogsReportItem:
    item_name: str
    quantity_sold: int
    cost_of_sales: float
    sale_amount: float
    profit_margin: float
