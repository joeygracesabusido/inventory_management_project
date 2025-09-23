import strawberry
from app.schemas.item import ItemType, ItemCreate
from app.crud.item import create_item

@strawberry.type
class Mutation():

    @strawberry.mutation
    async def add_item(self, item_data: ItemCreate) -> ItemType:
        new_item = await create_item(item_data)
        return ItemType(
            id=new_item["_id"],
            code=new_item["code"],
            name=new_item["name"],
            track_inventory=new_item["track_inventory"],
            purchase=new_item["purchase"],
            cost_price=new_item["cost_price"],
            purchase_account=new_item["purchase_account"],
            purchase_tax_rate=new_item["purchase_tax_rate"],
            purchase_description=new_item["purchase_description"],
            sell=new_item["sell"],
            sale_price=new_item["sale_price"],
            sales_account=new_item["sales_account"],
            sales_tax_rate=new_item["sales_tax_rate"],
            sales_description=new_item["sales_description"],
        )
    