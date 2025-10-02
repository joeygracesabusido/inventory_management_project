import strawberry
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from strawberry.fastapi import GraphQLRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.views.mutations import Mutation
from app.views.queries import Query
from app.schemas.item import ItemCreate
from app.crud.item import create_item
from app.views.category import Mutation as InsertCategory
from app.views.item import Query as getItems
from app.db.database import create_unique_indexes


from app.views.item import Mutation as ItemMutation


@strawberry.type
class Query(Query, getItems) :
    pass

@strawberry.type
class Mutation(Mutation, InsertCategory, ItemMutation):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)

from app.custom_graphql import CustomGraphQLRouter

graphql_app = CustomGraphQLRouter(schema)

app = FastAPI(
    title="Inventory Management System",
    description="API for the Inventory Management System",
    version="0.1.0",
)

@app.on_event("startup")
async def startup_event():
    await create_unique_indexes()

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

@app.get("/add_contact")
async def add_contact(request: Request):
    return templates.TemplateResponse("add_contact.html", {"request": request})

@app.get("/products")
async def products(request: Request):
    return templates.TemplateResponse("products.html", {"request": request})

@app.get("/new_item")
async def new_item_form(request: Request):
    return templates.TemplateResponse("new_item.html", {"request": request})

@app.get("/edit_item/{item_id}")
async def edit_item_form(request: Request, item_id: str):
    return templates.TemplateResponse("edit_item.html", {"request": request, "item_id": item_id})

@app.get("/sales_order")
async def sales_order_form(request: Request):
    return templates.TemplateResponse("sales_order.html", {"request": request})

@app.get("/purchase")
async def purchase_form(request: Request):
    return templates.TemplateResponse("purchase.html", {"request": request})

@app.get("/inventory_valuation")
async def inventory_valuation_report_page(request: Request):
    return templates.TemplateResponse("inventory_valuation.html", {"request": request})


@app.get("/cogs_report")
async def cogs_report_page(request: Request):
    return templates.TemplateResponse("cogs_report.html", {"request": request})


@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})