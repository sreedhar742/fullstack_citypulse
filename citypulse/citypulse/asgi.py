import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'citypulse.settings')
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from citypulse.middleware import JWTAuthMiddleware
from citypulse_notifications.routing import websocket_urlpatterns


django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,  # ✅ Fix: Include HTTP
    "websocket": JWTAuthMiddleware(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
