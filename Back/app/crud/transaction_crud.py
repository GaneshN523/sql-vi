from sqlalchemy import text
from app.schemas.transaction_schema import IsolationLevel
from app.database import SessionLocal, engine  # Adjust import as needed

# Dependency to get a synchronous DB session.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------------
# Transaction Control Commands
# -----------------------------------

def begin_transaction(db):
    sql = "BEGIN;"
    db.execute(text(sql))
    # Note: Do not commit so that the transaction remains open.
    return {"message": "Transaction begun"}

def commit_transaction(db):
    sql = "COMMIT;"
    db.execute(text(sql))
    db.commit()
    return {"message": "Transaction committed"}

def rollback_transaction(db):
    sql = "ROLLBACK;"
    db.execute(text(sql))
    db.commit()
    return {"message": "Transaction rolled back"}

def create_savepoint(db, savepoint_name: str):
    sql = f"SAVEPOINT {savepoint_name};"
    db.execute(text(sql))
    return {"message": f"Savepoint '{savepoint_name}' created"}

def rollback_to_savepoint(db, savepoint_name: str):
    sql = f"ROLLBACK TO SAVEPOINT {savepoint_name};"
    db.execute(text(sql))
    return {"message": f"Rolled back to savepoint '{savepoint_name}'"}

def release_savepoint(db, savepoint_name: str):
    sql = f"RELEASE SAVEPOINT {savepoint_name};"
    db.execute(text(sql))
    return {"message": f"Savepoint '{savepoint_name}' released"}

# END TRANSACTION is equivalent to COMMIT
def end_transaction(db):
    return commit_transaction(db)

# ABORT is equivalent to ROLLBACK
def abort_transaction(db):
    return rollback_transaction(db)

# -----------------------------------
# Isolation Level Control
# -----------------------------------

def set_transaction_isolation(db, isolation_level: IsolationLevel):
    sql = f"SET TRANSACTION ISOLATION LEVEL {isolation_level.value};"
    db.execute(text(sql))
    return {"message": f"Transaction isolation level set to {isolation_level.value}"}

def set_session_isolation(db, isolation_level: IsolationLevel):
    sql = f"SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL {isolation_level.value};"
    db.execute(text(sql))
    return {"message": f"Session isolation level set to {isolation_level.value}"}

# -----------------------------------
# Locking and Concurrency Control
# -----------------------------------

def lock_table(db, table_name: str):
    sql = f"LOCK TABLE {table_name};"
    db.execute(text(sql))
    return {"message": f"Table '{table_name}' locked"}

# -----------------------------------
# Transaction Snapshot and Visibility Control
# -----------------------------------

def set_transaction_snapshot(db, snapshot_id: str):
    sql = f"SET TRANSACTION SNAPSHOT '{snapshot_id}';"
    db.execute(text(sql))
    return {"message": f"Transaction snapshot set to '{snapshot_id}'"}

def export_snapshot(db):
    sql = "EXPORT SNAPSHOT;"
    db.execute(text(sql))
    return {"message": "Snapshot exported"}

# -----------------------------------
# Prepared Transactions (Two-Phase Commit)
# -----------------------------------

def prepare_transaction(db, transaction_id: str):
    sql = f"PREPARE TRANSACTION '{transaction_id}';"
    db.execute(text(sql))
    db.commit()
    return {"message": f"Transaction prepared with id '{transaction_id}'"}

def commit_prepared(db, transaction_id: str):
    sql = f"COMMIT PREPARED '{transaction_id}';"
    db.execute(text(sql))
    db.commit()
    return {"message": f"Prepared transaction '{transaction_id}' committed"}

def rollback_prepared(db, transaction_id: str):
    sql = f"ROLLBACK PREPARED '{transaction_id}';"
    db.execute(text(sql))
    db.commit()
    return {"message": f"Prepared transaction '{transaction_id}' rolled back"}

# -----------------------------------
# Event Triggers and Notifications (Transaction-Level)
# -----------------------------------

def listen_channel(db, channel_name: str):
    sql = f"LISTEN {channel_name};"
    db.execute(text(sql))
    return {"message": f"Listening on channel '{channel_name}'"}

def notify_channel(db, channel_name: str, message: str):
    sql = f"NOTIFY {channel_name}, '{message}';"
    db.execute(text(sql))
    return {"message": f"Notification sent on channel '{channel_name}' with message '{message}'"}

def unlisten_channel(db, channel_name: str):
    sql = f"UNLISTEN {channel_name};"
    db.execute(text(sql))
    return {"message": f"Stopped listening on channel '{channel_name}'"}

# -----------------------------------
# Advisory Locks (User-Defined Locks)
# -----------------------------------

def advisory_lock(db, key: int):
    sql = f"SELECT pg_advisory_lock({key});"
    db.execute(text(sql))
    return {"message": f"Advisory lock acquired for key {key}"}

def advisory_unlock(db, key: int):
    sql = f"SELECT pg_advisory_unlock({key});"
    db.execute(text(sql))
    return {"message": f"Advisory lock released for key {key}"}

def advisory_xact_lock(db, key: int):
    sql = f"SELECT pg_advisory_xact_lock({key});"
    db.execute(text(sql))
    return {"message": f"Advisory transaction lock acquired for key {key}"}

def advisory_unlock_all(db):
    sql = "SELECT pg_advisory_unlock_all();"
    db.execute(text(sql))
    return {"message": "All advisory locks released"}
