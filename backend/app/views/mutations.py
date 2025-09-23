import strawberry
from app.schemas.user import UserType, AuthTokenResponse
from app.security.password import get_password_hash, verify_password
from app.security.token import create_access_token
from app.crud.user import get_user_by_email, create_user
from app.schemas.item import ItemType, ItemCreate
from app.crud.item import create_item
from app.views.category import Mutation as CategoryMutation
from app.schemas.contact import ContactType, ContactCreateInput
from app.crud.contact import create_contact



@strawberry.type
class Mutation(CategoryMutation):
    @strawberry.mutation
    async def add_contact(self, contact_data: ContactCreateInput, info: strawberry.Info) -> ContactType:
        user = info.context.get("user")
        if not user:
            raise Exception("Not authenticated")

        contact_data.userId = str(user["_id"])
        new_contact = await create_contact(contact_data)
        return ContactType(
            id=str(new_contact["_id"]),
            contact_name=new_contact["contact_name"],
            account_number=new_contact.get("account_number"),
            first_name=new_contact.get("first_name"),
            last_name=new_contact.get("last_name"),
            email=new_contact.get("email"),
            phone_number=new_contact.get("phone_number"),
        )

    @strawberry.mutation
    async def add_item(self, item_data: ItemCreate, info: strawberry.Info) -> ItemType:
        user = info.context.get("user")
        if not user:
            raise Exception("Not authenticated")

        item_data.userId = str(user["_id"])
        new_item = await create_item(item_data)
        return ItemType(
            id=str(new_item["_id"]),
            code=new_item["code"],
            name=new_item.get("name"),
            track_inventory=new_item["track_inventory"],
            purchase=new_item["purchase"],
            cost_price=new_item.get("cost_price"),
            purchase_account=new_item.get("purchase_account"),
            purchase_tax_rate=new_item.get("purchase_tax_rate"),
            purchase_description=new_item.get("purchase_description"),
            sell=new_item["sell"],
            sale_price=new_item.get("sale_price"),
            sales_account=new_item.get("sales_account"),
            sales_tax_rate=new_item.get("sales_tax_rate"),
            sales_description=new_item.get("sales_description"),
        )

    @strawberry.mutation
    async def login(self, email: str, password: str) -> AuthTokenResponse:
        user = await get_user_by_email(email)
        if not user or not verify_password(password, user['hashed_password']):
            raise Exception("Invalid credentials")

        access_token = create_access_token(data={"sub": user['email']})
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






