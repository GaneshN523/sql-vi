# app/main.py
from fastapi import FastAPI
from app.routers import tableop_route, selectop_route, indexview_route, sequence_route, transaction_route  # , views, indexes (if created)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Dynamic SQL API")

app.include_router(tableop_route.router)
app.include_router(selectop_route.router)
app.include_router(indexview_route.router)
app.include_router(sequence_route.router)
app.include_router(transaction_route.router, prefix="/transactions")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict origins as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Dynamic SQL API!"}
