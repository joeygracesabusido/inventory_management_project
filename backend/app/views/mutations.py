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



class IsAuthenticated(strawberry.permission.BasePermission):
    message = "Not authenticated"
    def has_permission(self, source, info: Info, **kwargs) -> bool:
        return bool(get_user_from_info(info))
    



@strawberry.type
class Mutation(CategoryMutation, ItemMutation):
        
        
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



