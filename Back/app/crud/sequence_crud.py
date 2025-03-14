from sqlalchemy import text
from app.schemas.sequence_schema import SequenceCreate
from ..database import SessionLocal, engine

# Dependency to get a synchronous DB session.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_sequence(db, seq: SequenceCreate):
    sql = f"CREATE SEQUENCE {seq.name}"
    options = []
    if seq.start is not None:
        options.append(f"START WITH {seq.start}")
    if seq.increment is not None:
        options.append(f"INCREMENT BY {seq.increment}")
    if seq.min_value is not None:
        options.append(f"MINVALUE {seq.min_value}")
    if seq.max_value is not None:
        options.append(f"MAXVALUE {seq.max_value}")
    if seq.cache is not None:
        options.append(f"CACHE {seq.cache}")
    if seq.cycle:
        options.append("CYCLE")
    if options:
        sql += " " + " ".join(options)
    sql += ";"
    db.execute(text(sql))
    db.commit()
    return {"sequence": seq.name, "query_executed": sql}

def get_next_value(db, seq_name: str):
    sql = f"SELECT NEXTVAL('{seq_name}') as nextval;"
    result = db.execute(text(sql))
    row = result.fetchone()
    return row["nextval"] if row else None

def get_current_value(db, seq_name: str):
    sql = f"SELECT CURRVAL('{seq_name}') as currval;"
    result = db.execute(text(sql))
    row = result.fetchone()
    return row["currval"] if row else None

def set_sequence_value(db, seq_name: str, value: int):
    sql = f"SELECT SETVAL('{seq_name}', {value}) as setval;"
    result = db.execute(text(sql))
    row = result.fetchone()
    db.commit()
    return row["setval"] if row else None

def restart_sequence(db, seq_name: str, start_with: int):
    sql = f"ALTER SEQUENCE {seq_name} RESTART WITH {start_with};"
    db.execute(text(sql))
    db.commit()
    return {"message": f"Sequence {seq_name} restarted with {start_with}"}

def drop_sequence(db, seq_name: str):
    sql = f"DROP SEQUENCE {seq_name};"
    db.execute(text(sql))
    db.commit()
    return {"message": f"Sequence {seq_name} dropped"}

def list_sequences(db):
    sql = "SELECT relname FROM pg_class WHERE relkind = 'S';"
    result = db.execute(text(sql))
    rows = result.mappings().all()  # convert rows to dict‑like objects
    sequences = [row["relname"] for row in rows]
    return sequences


def view_sequence_details(db, seq_name: str):
    sql = f"SELECT * FROM {seq_name};"
    result = db.execute(text(sql))
    row = result.fetchone()
    return dict(row) if row else {}

def associate_sequence(db, seq_name: str, table: str, column: str):
    sql = f"ALTER SEQUENCE {seq_name} OWNED BY {table}.{column};"
    db.execute(text(sql))
    db.commit()
    return {"message": f"Sequence {seq_name} is now owned by {table}.{column}"}

def reset_sequence_for_table(db, table: str, column: str):
    sql = (
        f"SELECT SETVAL(pg_get_serial_sequence('{table}', '{column}'), "
        f"COALESCE(MAX({column}), 1), false) as new_val FROM {table};"
    )
    result = db.execute(text(sql))
    row = result.fetchone()
    db.commit()
    return row["new_val"] if row else None
