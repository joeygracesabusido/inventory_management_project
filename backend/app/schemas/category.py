import strawberry

@strawberry.type
class CategoryType:
    id: str
    name: str
    user: str

@strawberry.input
class CategoryCreate:
    name: str
    user: str
