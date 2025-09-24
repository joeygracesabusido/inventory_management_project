import strawberry

@strawberry.type
class UserType:
    id: str
    email: str
    first_name: str
    last_name: str

@strawberry.type
class AuthTokenResponse:
    access_token: str = strawberry.field(name="accessToken")
    token_type: str = strawberry.field(name="tokenType")
