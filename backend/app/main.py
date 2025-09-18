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
from app.db.database import create_unique_indexes


@strawberry.type
class Query(Query) :
    pass

@strawberry.type
class Mutation(Mutation, InsertCategory):
    pass

schema = strawberry.Schema(query=Query, mutation=Mutation)

graphql_app = GraphQLRouter(schema)

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

@app.post("/new_item")
async def new_item(request: Request):
    form = await request.form()
    item_data = ItemCreate(
        code=form.get("code"),
        name=form.get("name"),
        track_inventory=form.get("track_inventory") == "on",
        purchase=form.get("purchase") == "on",
        cost_price=float(form.get("cost_price")),
        purchase_account=form.get("purchase_account"),
        purchase_tax_rate=form.get("purchase_tax_rate"),
        purchase_description=form.get("purchase_description"),
        sell=form.get("sell") == "on",
        sale_price=float(form.get("sale_price")),
        sales_account=form.get("sales_account"),
        sales_tax_rate=form.get("sales_tax_rate"),
        sales_description=form.get("sales_description"),
    )
    await create_item(item_data)
    return RedirectResponse(url="/products", status_code=303)

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})