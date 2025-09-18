import strawberry

@strawberry.type
class CategoryType:
    id: str
    name: str

@strawberry.input
class CategoryCreate:
    name: str
