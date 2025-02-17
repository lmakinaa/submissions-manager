from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
import httpx

services = {
    'auth': 'http://auth_service:8000',
    'core': 'http://core_service:8000',
}

public_paths = [
    '/auth/token',
    '/auth/register/',
    '/core/apply/'
]

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{services['auth']}/token")

async def forward_public_request(service_url: str, method: str, path: str, body=None, headers=None):
    async with httpx.AsyncClient() as client:
        url = f"{service_url}{path}"
        response = await client.request(method, url, json=body, headers=headers)
        return response

async def forward_protected_request(service_url: str, method: str, path: str, body=None, headers=None, token: str = Depends(oauth2_scheme)):
    async with httpx.AsyncClient() as client:
        url = f"{service_url}{path}"
        response = await client.request(method, url, json=body, headers=headers)
        return response

@app.api_route("/api/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def gateway(service: str, path: str, request: Request):
    if service not in services:
        raise HTTPException(status_code=404, detail="Service not found")

    service_url = services[service]
    body = await request.json() if request.method in ["POST", "PUT", "PATCH"] else None
    headers = dict(request.headers)

    full_path = f"{service}/{path}"
    if full_path in public_paths:
        response = await forward_public_request(service_url, request.method, f"/{path}", body, headers)
    else:
        response = await forward_protected_request(service_url, request.method, f"/{path}", body, headers)

    return JSONResponse(status_code=response.status_code, content=response.json())