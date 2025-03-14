# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from sqlalchemy import create_engine, Column, Integer, String, MetaData, Table, text, inspect
# from sqlalchemy.orm import sessionmaker
# from typing import List, Optional, Dict, Any
# from fastapi.middleware.cors import CORSMiddleware

# DATABASE_URL = "postgresql://postgres:Ganya123@localhost:5432/sql_db"

# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(bind=engine)
# metadata = MetaData()

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Replace "*" with frontend URL for security
#     allow_credentials=True,
#     allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
#     allow_headers=["*"],  # Allow all headers
# )

# # Define a Pydantic model for JSON input
# class TableRequest(BaseModel):
#     table_name: str

# class ColumnSchema(BaseModel):
#     column_name: str
#     column_type: str  # Example: "String", "Integer"

# class ModifyTableRequest(BaseModel):
#     table_name: str
#     add_columns: Optional[List[ColumnSchema]] = []
#     drop_columns: Optional[List[str]] = []
#     modify_columns: Optional[List[ColumnSchema]] = []

# class InsertRowRequest(BaseModel):
#     table_name: str
#     row_data: Dict[str, Any]  # Dynamic key-value pairs for column data

# class UpdateRowRequest(BaseModel):
#     table_name: str
#     condition: Dict[str, Any]  # Condition to identify the row(s) to update
#     new_values: Dict[str, Any]  # Columns and new values to update

# class DeleteRowRequest(BaseModel):
#     table_name: str
#     condition: Dict[str, Any]  # Condition to identify the row(s) to delete

# def create_dynamic_table(table_name: str):
#     table = Table(
#         table_name, metadata,
#         Column("id", Integer, primary_key=True, index=True),
#         Column("name", String, index=True)
#     )
#     metadata.create_all(engine, tables=[table])
#     return table_name

# def delete_dynamic_table(table_name: str):
#     table = Table(table_name, metadata, autoload_with=engine)
#     table.drop(engine)
#     return table_name

# def add_column(table_name: str, column_name: str, column_type: str):
#     query = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"
#     with engine.connect() as conn:
#         conn.execute(text(query))
#         conn.commit()

# def drop_column(table_name: str, column_name: str):
#     query = f"ALTER TABLE {table_name} DROP COLUMN {column_name}"
#     with engine.connect() as conn:
#         conn.execute(text(query))
#         conn.commit()

# def modify_column(table_name: str, column_name: str, new_column_type: str):
#     query = f"ALTER TABLE {table_name} ALTER COLUMN {column_name} TYPE {new_column_type} USING {column_name}::{new_column_type}"
#     with engine.connect() as conn:
#         conn.execute(text(query))
#         conn.commit()


# def insert_row(table_name: str, row_data: Dict[str, Any]):
#     # Get table metadata
#     inspector = inspect(engine)
#     columns = {col["name"] for col in inspector.get_columns(table_name)}

#     # Ensure provided data matches table columns
#     filtered_data = {k: v for k, v in row_data.items() if k in columns}

#     if not filtered_data:
#         raise ValueError("No valid columns provided for insertion.")

#     column_names = ", ".join(filtered_data.keys())
#     placeholders = ", ".join([f":{key}" for key in filtered_data.keys()])
#     query = f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})"

#     with engine.connect() as conn:
#         conn.execute(text(query), filtered_data)
#         conn.commit()

# def update_row(table_name: str, condition: Dict[str, Any], new_values: Dict[str, Any]):
#     # Validate table existence
#     inspector = inspect(engine)
#     if table_name not in inspector.get_table_names():
#         raise ValueError(f"Table '{table_name}' does not exist.")

#     # Validate column existence
#     columns = {col["name"] for col in inspector.get_columns(table_name)}
    
#     # Filter valid column names
#     new_values = {k: v for k, v in new_values.items() if k in columns}
#     condition = {k: v for k, v in condition.items() if k in columns}

#     if not new_values:
#         raise ValueError("No valid columns provided for update.")
#     if not condition:
#         raise ValueError("Condition must have at least one valid column.")

#     # Construct SQL query
#     set_clause = ", ".join([f"{col} = :{col}" for col in new_values.keys()])
#     where_clause = " AND ".join([f"{col} = :{col}" for col in condition.keys()])
    
#     query = f"UPDATE {table_name} SET {set_clause} WHERE {where_clause}"

#     # Execute query
#     with engine.connect() as conn:
#         conn.execute(text(query), {**new_values, **condition})
#         conn.commit()

# def delete_row(table_name: str, condition: Dict[str, Any]):
#     # Validate table existence
#     inspector = inspect(engine)
#     if table_name not in inspector.get_table_names():
#         raise ValueError(f"Table '{table_name}' does not exist.")

#     # Validate column existence
#     columns = {col["name"] for col in inspector.get_columns(table_name)}
    
#     # Filter valid condition columns
#     condition = {k: v for k, v in condition.items() if k in columns}

#     if not condition:
#         raise ValueError("Condition must have at least one valid column.")

#     # Construct SQL query
#     where_clause = " AND ".join([f"{col} = :{col}" for col in condition.keys()])
#     query = f"DELETE FROM {table_name} WHERE {where_clause}"

#     # Execute query
#     with engine.connect() as conn:
#         conn.execute(text(query), condition)
#         conn.commit()


# @app.get("/get_table_schema")
# def get_table_schema(table_name: str):
#     try:
#         inspector = inspect(engine)
#         if table_name not in inspector.get_table_names():
#             raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
#         # Get columns info from the inspector
#         columns = inspector.get_columns(table_name)
#         # Build a list of dicts with column name and type
#         schema = [
#             {"column_name": col["name"], "column_type": str(col["type"])}
#             for col in columns
#         ]
#         return {"schema": schema}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))



# @app.get("/get_table_data")
# def get_table_data(table_name: str):
#     try:
#         # Check if the table exists using the inspector
#         inspector = inspect(engine)
#         if table_name not in inspector.get_table_names():
#             raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
#         # Construct the query to fetch all rows from the specified table
#         query = text(f"SELECT * FROM {table_name}")
        
#         # Execute the query and fetch the results
#         with engine.connect() as conn:
#             result = conn.execute(query)
#             # Convert each row to a dictionary
#             rows = [dict(row) for row in result]
        
#         return {"data": rows}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))



# @app.post("/create_table")
# def create_table(request: TableRequest):
#     try:
#         created_table = create_dynamic_table(request.table_name)
#         return {"message": f"Table '{created_table}' created successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.delete("/delete_table")
# def delete_table(request: TableRequest):
#     try:
#         deleted_table = delete_dynamic_table(request.table_name)
#         return {"message": f"Table '{deleted_table}' deleted successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.put("/modify_table")
# def modify_table(request: ModifyTableRequest):
#     try:
#         for col in request.add_columns:
#             add_column(request.table_name, col.column_name, col.column_type)

#         for col_name in request.drop_columns:
#             drop_column(request.table_name, col_name)

#         for col in request.modify_columns:
#             modify_column(request.table_name, col.column_name, col.column_type)

#         return {"message": f"Table '{request.table_name}' modified successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @app.get("/tables")
# def get_tables():
#     try:
#         inspector = inspect(engine)
#         tables = inspector.get_table_names()
#         return {"tables": tables}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# @app.post("/insert_row")
# def insert_row_api(request: InsertRowRequest):
#     try:
#         insert_row(request.table_name, request.row_data)
#         return {"message": f"Row inserted into table '{request.table_name}' successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.put("/update_row")
# def update_row_api(request: UpdateRowRequest):
#     try:
#         update_row(request.table_name, request.condition, request.new_values)
#         return {"message": f"Row(s) in '{request.table_name}' updated successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @app.delete("/delete_row")
# def delete_row_api(request: DeleteRowRequest):
#     try:
#         delete_row(request.table_name, request.condition)
#         return {"message": f"Row(s) in '{request.table_name}' deleted successfully"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
