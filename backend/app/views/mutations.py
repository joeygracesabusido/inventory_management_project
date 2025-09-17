import strawberry
from app.schemas.user import UserType, AuthTokenResponse
from app.security.password import get_password_hash, verify_password
from app.security.token import create_access_token
from app.crud.user import get_user_by_email, create_user

@strawberry.type
class Mutation:
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
