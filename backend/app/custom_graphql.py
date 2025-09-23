from typing import Any, Dict

import jwt
from starlette.requests import Request
from starlette.websockets import WebSocket
from strawberry.fastapi import GraphQLRouter

from app.core.config import settings
from app.crud.user import get_user_by_email


class CustomGraphQLRouter(GraphQLRouter):
    async def get_context(
        self, request: Request | WebSocket, response
    ) -> Dict[str, Any]:
        context = await super().get_context(request, response)
        authorization = request.headers.get("Authorization", "")
        if not authorization.startswith("Bearer "):
            return context

        token = authorization.replace("Bearer ", "")
        try:
            payload = jwt.decode(
                token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
            )
            email = payload.get("sub")
            user = await get_user_by_email(email)
            context["user"] = user
        except jwt.PyJWTError:
            pass  # Handle invalid token

        return context
