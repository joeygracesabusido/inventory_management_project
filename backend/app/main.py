import strawberry
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from strawberry.fastapi import GraphQLRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from app.models.user import User
from app.schemas.user import UserType, AuthTokenResponse
from app.security.password import get_password_hash, verify_password
from app.security.token import create_access_token
from app.crud.user import get_user_by_email, create_user

# --- GraphQL Schemas ---

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Hello, world!"

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

schema = strawberry.Schema(query=Query, mutation=Mutation)

graphql_app = GraphQLRouter(schema)

app = FastAPI(
    title="Inventory Management System",
    description="API for the Inventory Management System",
    version="0.1.0",
)

# Static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Templates
templates = Jinja2Templates(directory="app/templates")


# CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend's domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix="/graphql")

@app.get("/dashboard")
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})