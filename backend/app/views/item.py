import strawberry
from strawberry.types import Info
from app.schemas.item import ItemType, ItemCreate
from app.crud.item import create_item, get_items
from app.utils.context import extract_user_id, get_user_from_info
from typing import List



@strawberry.type
class Query:
    @strawberry.field
    async def getItems(self, info:Info) -> List[ItemType]:
        user = get_user_from_info(info)

        if not user:
            raise Exception("Not authenticated")

        items = await get_items()
        #print(categories)
        return [ItemType(id=str(c["_id"]), 
                         code=c.get("code", ""),
                         name=c["name"], 
                         category=c["category"],
                         measurement=c["measurement"],
                         barcode=c["barcode"],
                         supplier=c["supplier"],
                         track_inventory=c["track_inventory"],
                         purchase=c["purchase"],
                         cost_price=c["cost_price"],
                         purchase_account=c["purchase_account"],
                         purchase_tax_rate=c["purchase_tax_rate"],
                         purchase_description=c["purchase_description"],
                         sell=c["sell"],
                         sale_price=c["sale_price"],
                         sales_account=c["sales_account"],
                         sales_tax_rate=c["sales_tax_rate"],
                         sales_description=c["sales_description"],
                         created_at=c["created_at"],
                         updated_at=c["updated_at"],
                         user=c['user']) 
                         for c in items]
    

            

@strawberry.type
class Mutation():

    @strawberry.mutation
    async def add_item(self, item_data: ItemCreate, info: Info) -> ItemType:
        user = get_user_from_info(info)
        print(user)
        if not user:
            raise Exception("Not authenticated")

        user_id = extract_user_id(user)
        if user_id is None:
            raise Exception("Authenticated user has no id")

        item_data.user = user['email']
        new_item = await create_item(item_data)

        return ItemType(
            id=str(new_item["_id"]),
            code=new_item["code"],
            name=new_item.get("name"),
            category=new_item.get("category"),
            measurement=new_item.get("measurement"),
            barcode=new_item["barcode"],
            supplier=new_item.get("supplier"),
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
            user=user['email'],
            created_at=new_item['created_at'],
            updated_at=new_item['updated_at']
        )
    
