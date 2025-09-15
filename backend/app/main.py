import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.models.user import User
from app.schemas.user import UserType, AuthTokenResponse
from app.security.password import get_password_hash, verify_password
from app.security.token import create_access_token

# --- Dummy User Database ---
# In a real application, this would be a database query.
_users: List[User] = [
    User(
        id=1,
        email="admin@example.com",
        hashed_password=get_password_hash("password"),
        first_name="Admin",
        last_name="User"
    )
]

def get_user_by_email(email: str) -> User | None:
    return next((user for user in _users if user.email == email), None)

# --- GraphQL Schemas ---

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, world!"

@strawberry.type
class Mutation:
    @strawberry.mutation
    def login(self, email: str, password: str) -> AuthTokenResponse:
        user = get_user_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise Exception("Invalid credentials")

        access_token = create_access_token(data={"sub": user.email})
        return AuthTokenResponse(access_token=access_token, token_type="bearer")

schema = strawberry.Schema(query=Query, mutation=Mutation)

graphql_app = GraphQLRouter(schema)

app = FastAPI(
    title="Inventory Management System",
    description="API for the Inventory Management System",
    version="0.1.0",
)

# CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
async def root():
    return {"message": "Inventory Management System API is running."}