
import strawberry
from strawberry.types import Info
from app.schemas.item import ItemType, ItemCreate, ItemsResponse
from app.crud.item import create_item, get_items, get_item, update_item
from app.utils.context import extract_user_id, get_user_from_info
from typing import List



@strawberry.type
class Query:
    @strawberry.field
    async def getItems(self, info:Info, search: str = None, page: int = 1, page_size: int = 20) -> ItemsResponse:
        user = get_user_from_info(info)

        if not user:
            raise Exception("Not authenticated")

        result = await get_items(search_term=search, page=page, page_size=page_size)
        
        items = result["items"]
        total_items = result["total_items"]
        
        #print(categories)
        return ItemsResponse(
            items=[ItemType(id=str(c["_id"]), 
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
                         for c in items],
            total_items=total_items
        )
    
    @strawberry.field
    async def getItem(self, info:Info, itemId: str) -> ItemType:
        user = get_user_from_info(info)

        if not user:
            raise Exception("Not authenticated")

        item = await get_item(item_id=itemId)
        
        return ItemType(id=str(item["_id"]), 
                         code=item.get("code", ""),
                         name=item["name"], 
                         category=item["category"],
                         measurement=item["measurement"],
                         barcode=item["barcode"],
                         supplier=item["supplier"],
                         track_inventory=item["track_inventory"],
                         purchase=item["purchase"],
                         cost_price=item["cost_price"],
                         purchase_account=item["purchase_account"],
                         purchase_tax_rate=item["purchase_tax_rate"],
                         purchase_description=item["purchase_description"],
                         sell=item["sell"],
                         sale_price=item["sale_price"],
                         sales_account=item["sales_account"],
                         sales_tax_rate=item["sales_tax_rate"],
                         sales_description=item["sales_description"],
                         created_at=item["created_at"],
                         updated_at=item["updated_at"],
                         user=item['user']) 

            

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
    
    @strawberry.mutation
    async def update_item(self, item_id: str, item_data: ItemCreate, info: Info) -> ItemType:
        user = get_user_from_info(info)
        if not user:
            raise Exception("Not authenticated")

        updated_item = await update_item(item_id, item_data)

        return ItemType(
            id=str(updated_item["_id"]),
            code=updated_item["code"],
            name=updated_item.get("name"),
            category=updated_item.get("category"),
            measurement=updated_item.get("measurement"),
            barcode=updated_item["barcode"],
            supplier=updated_item.get("supplier"),
            track_inventory=updated_item["track_inventory"],
            purchase=updated_item["purchase"],
            cost_price=updated_item["cost_price"],
            purchase_account=updated_item["purchase_account"],
            purchase_tax_rate=updated_item["purchase_tax_rate"],
            purchase_description=updated_item["purchase_description"],
            sell=updated_item["sell"],
            sale_price=updated_item["sale_price"],
            sales_account=updated_item["sales_account"],
            sales_tax_rate=updated_item["sales_tax_rate"],
            sales_description=updated_item["sales_description"],
            user=user['email'],
            
            updated_at=updated_item['updated_at']
        )
    
