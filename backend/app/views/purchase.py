import strawberry
from strawberry.types import Info

from app.utils.context import extract_user_id, get_user_from_info

from app.schemas.purchase import PurchaseCreate, PurchaseType, PurchaseItemType
from app.crud.purchase import create_purchase


@strawberry.type
class Mutation():
    @strawberry.mutation
    async def create_purchase(self, purchase_data: PurchaseCreate, info: Info) -> PurchaseType:
        user = get_user_from_info(info)
        if not user:
            raise Exception("Not authenticated")

        new_purchase = await create_purchase(purchase_data, user)

        return PurchaseType(
            id=str(new_purchase["_id"]),
            supplierName=new_purchase["supplierName"],
            purchaseDate=new_purchase["purchaseDate"],
            items=[PurchaseItemType(itemId=item["itemId"], 
                                    quantity=item["quantity"], purchasePrice=item["purchasePrice"], 
                                    sellingPrice=item["sellingPrice"]) for item in new_purchase["items"]],
            subtotal=new_purchase["subtotal"],
            vat=new_purchase["vat"],
            total=new_purchase["total"],
            createdAt=new_purchase["createdAt"],
            updatedAt=new_purchase["updatedAt"],
            userId=str(new_purchase["email"])
        )