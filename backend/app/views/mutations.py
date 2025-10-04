import strawberry
from strawberry.types import Info

from app.schemas.user import UserType, AuthTokenResponse
from app.security.password import get_password_hash, verify_password
from app.security.token import create_access_token
from app.crud.user import get_user_by_email, create_user
from app.schemas.item import ItemType, ItemCreate
from app.crud.item import create_item
from app.schemas.contact import ContactType, ContactCreateInput
from app.crud.contact import create_contact
from app.utils.context import extract_user_id, get_user_from_info
from app.views.category import Mutation as CategoryMutation
from app.views.item import Mutation as ItemMutation
from app.schemas.stock import StockType, StockCreate
from app.crud.stock import create_stock, get_latest_stock_selling_price
from app.schemas.sales_order import SalesOrderType, SalesOrderCreate, SalesOrderItemCreate, SalesOrderItemType
from app.crud.sales_order import create_sales_order
from app.crud.fifo import consume_stock
from app.models.sales_order import SalesOrder, SalesOrderItem
from app.schemas.purchase import PurchaseCreate, PurchaseType, PurchaseItemType
from app.crud.purchase import create_purchase


class IsAuthenticated(strawberry.permission.BasePermission):
    message = "Not authenticated"
    def has_permission(self, source, info: Info, **kwargs) -> bool:
        return bool(get_user_from_info(info))
    



@strawberry.type
class Mutation(CategoryMutation, ItemMutation):
        
    @strawberry.mutation
    async def add_stock(self, stock_data: StockCreate, info: Info) -> StockType:
        user = get_user_from_info(info)
        if not user:
            raise Exception("Not authenticated")

        new_stock = await create_stock(stock_data)
        return StockType(
            id=str(new_stock["_id"]),
            item_id=new_stock["item_id"],
            quantity=new_stock["quantity"],
            purchase_price=new_stock["purchase_price"],
            selling_price=new_stock["selling_price"],
            purchase_date=new_stock["purchase_date"]
        )

    @strawberry.mutation
    async def create_sales_order(self, sales_order_data: SalesOrderCreate, info: Info) -> SalesOrderType:
        user = get_user_from_info(info)
        if not user:
            raise Exception("Not authenticated")

        items_with_cogs = []
        for item_data in sales_order_data.items:
            consumed_items_details = await consume_stock(item_data.item_id, item_data.quantity)
            total_cogs_for_item = sum(detail['cogs'] for detail in consumed_items_details)
            
            effective_sale_price = await get_latest_stock_selling_price(item_data.item_id)
            if effective_sale_price is None:
                effective_sale_price = item_data.sale_price # fallback

            items_with_cogs.append(SalesOrderItem(
                item_id=item_data.item_id,
                quantity=item_data.quantity,
                sale_price=effective_sale_price,
                cogs=total_cogs_for_item
            ))

        new_sales_order = SalesOrder(
            customer_name=sales_order_data.customer_name,
            invoice_date=sales_order_data.invoice_date,
            items=items_with_cogs,
            subtotal=sales_order_data.subtotal,
            vat=sales_order_data.vat,
            total=sales_order_data.total
        )

        created_order = await create_sales_order(new_sales_order)

        return SalesOrderType(
            id=str(created_order["_id"]),
            customer_name=created_order["customer_name"],
            invoice_date=created_order["invoice_date"],
            items=[SalesOrderItemType(**item) for item in created_order["items"]],
            subtotal=created_order["subtotal"],
            vat=created_order["vat"],
            total=created_order["total"],
            created_at=created_order["created_at"]
        )

    # @strawberry.mutation
    # async def create_purchase(self, purchase_data: PurchaseCreate, info: Info) -> PurchaseType:
    #     user = get_user_from_info(info)
    #     if not user:
    #         raise Exception("Not authenticated")

    #     new_purchase = await create_purchase(purchase_data)

    #     return PurchaseType(
    #         id=str(new_purchase["_id"]),
    #         supplierName=new_purchase["supplier_name"],
    #         purchaseDate=new_purchase["purchase_date"],
    #         items=[PurchaseItemType(itemId=item["item_id"], 
    #                                 quantity=item["quantity"], purchasePrice=item["purchase_price"], 
    #                                 sellingPrice=item["selling_price"]) for item in new_purchase["items"]],
    #         subtotal=new_purchase["subtotal"],
    #         vat=new_purchase["vat"],
    #         total=new_purchase["total"],
    #         createdAt=new_purchase["created_at"]
    #     )
        
    @strawberry.mutation
    async def add_contact(self, contact_data: ContactCreateInput, info: Info) -> ContactType:
        user = get_user_from_info(info)
        if not user:
            raise Exception("Not authenticated")

        contact_data.user = user['email']
        new_contact = await create_contact(contact_data)
        return ContactType(
            id=str(new_contact["_id"]),
            contact_name=new_contact["contact_name"],
            account_number=new_contact.get("account_number"),
            first_name=new_contact.get("first_name"),
            last_name=new_contact.get("last_name"),
            email=new_contact.get("email"),
            phone_number=new_contact.get("phone_number"),
            user=user['email']
        )
 

    @strawberry.mutation
    async def login(self, email: str, password: str) -> AuthTokenResponse:
        user = await get_user_by_email(email)
        if not user or not verify_password(password, user['hashed_password']):
            raise Exception("Invalid credentials")

        access_token = create_access_token(
            data={
                "sub": user['email'],
                "userId": str(user['_id']),
            }
        )
        return AuthTokenResponse(access_token=access_token, token_type="bearer")

    @strawberry.mutation
    async def signUp(self, email: str, password: str, first_name: str, last_name: str) -> UserType:
        # Check if user already exists
        user = await get_user_by_email(email)
        if user:
            raise Exception("User with this email already exists")

        # Create new user
        hashed_password = get_password_hash(password)
        new_user_data = {
            "email": email,
            "hashed_password": hashed_password,
            "first_name": first_name,
            "last_name": last_name
        }
        new_user = await create_user(new_user_data)

        return UserType(
            id=new_user["id"],
            email=new_user["email"],
            first_name=new_user["first_name"],
            last_name=new_user["last_name"]
        )



