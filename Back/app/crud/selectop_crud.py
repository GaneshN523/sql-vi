from fastapi import HTTPException
from sqlalchemy import Column, Integer, String, text, Table
from sqlalchemy import inspect
from ..database import engine, metadata
from typing import List, Optional, Dict, Any, Tuple

def select_data(
    table: str,
    columns: Optional[List[str]] = None,
    where: Optional[Dict[str, Any]] = None,
    order_by: Optional[str] = None,
    order: Optional[str] = None,
    limit: Optional[int] = None,
    offset: Optional[int] = None,
    group_by: Optional[str] = None,
    having: Optional[str] = None,
    distinct: bool = False,
    join: Optional[List[Dict[str, str]]] = None,  # Accept join type
    aggregate: Optional[Dict[str, str]] = None
) -> Tuple[List[Dict[str, Any]], str]:
    """
    Enhanced SQL SELECT function for PostgreSQL using SQLAlchemy.

    The `where` parameter accepts a dictionary where each value can either be a plain value
    (for equality) or a list/tuple of two items [operator, value] (e.g., ["=", 2]).
    """
    sql = "SELECT "

    # Handle DISTINCT
    if distinct:
        sql += "DISTINCT "

    # Handle columns & aggregates
    if aggregate:
        aggregate_columns = [f"{func}({col}) AS \"{col}_{func}\"" for col, func in aggregate.items()]
        sql += ", ".join(aggregate_columns)
    elif columns:
        sql += ", ".join(columns)
    else:
        sql += "*"

    sql += f" FROM {table}"

    # Handle JOIN
    if join:
        for join_data in join:
            join_type = join_data.get("join_type", "INNER JOIN")  # Default to INNER JOIN
            join_table = join_data["join_table"]
            condition = join_data.get("condition", "")  # Default to empty if not provided
        
            if join_type.upper() == "CROSS JOIN":
                sql += f" {join_type} {join_table}"  # CROSS JOIN doesn't require an ON condition
            else:
                sql += f" {join_type} {join_table} ON {condition}"

    # Handle WHERE conditions
    query_params = {}
    if where:
        conditions = []
        for idx, (col, val) in enumerate(where.items()):
            placeholder = f":{col}{idx}"
            # Check if val is a tuple or list with exactly 2 elements (operator, value)
            if isinstance(val, (tuple, list)) and len(val) == 2:
                operator, value = val
                conditions.append(f"{col} {operator} {placeholder}")
                query_params[f"{col}{idx}"] = value
            else:
                conditions.append(f"{col} = {placeholder}")
                query_params[f"{col}{idx}"] = val
        sql += " WHERE " + " AND ".join(conditions)

    # Handle GROUP BY
    if group_by:
        sql += f" GROUP BY {group_by}"

    # Handle HAVING
    if having:
        sql += f" HAVING {having}"

    # Handle ORDER BY
    if order_by:
        sql += f" ORDER BY {order_by}"
        if order and order.upper() in ["ASC", "DESC"]:
            sql += f" {order.upper()}"

    # Handle LIMIT & OFFSET using colon-style placeholders
    if limit is not None:
        sql += " LIMIT :limit"
        query_params["limit"] = limit
    if offset is not None:
        sql += " OFFSET :offset"
        query_params["offset"] = offset

    # Execute the query
    with engine.connect() as connection:
        result = connection.execute(text(sql), query_params)
        rows = result.fetchall()
        cols = result.keys()
        data = [dict(zip(cols, row)) for row in rows]

    formatted_sql = sql
    for param, value in query_params.items():
        formatted_sql = formatted_sql.replace(f":{param}", f"'{value}'" if isinstance(value, str) else str(value))
    
    return data, formatted_sql


def get_table_names() -> List[str]:
    inspector = inspect(engine)
    return inspector.get_table_names()
