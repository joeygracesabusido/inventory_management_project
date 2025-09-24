import strawberry
from strawberry.types import Info
from app.schemas.item import ItemType, ItemCreate
from app.crud.item import create_item
from app.utils.context import extract_user_id, get_user_from_info

@strawberry.type
class Mutation():

    @strawberry.mutation
    async def add_item(self, item_data: ItemCreate, info: Info) -> ItemType:
        user = get_user_from_info(info)
        if not user:
            raise Exception("Not authenticated")

        user_id = extract_user_id(user)
        if user_id is None:
            raise Exception("Authenticated user has no id")

        item_data.userId = user_id
        new_item = await create_item(item_data)

        return ItemType(
            id=str(new_item["_id"]),
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
            userId=new_item.get("userId"),
            created=None,
            updated=None,
        )
    
