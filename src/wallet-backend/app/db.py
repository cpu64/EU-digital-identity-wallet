import os
import uuid
import aiofiles
from sqlalchemy import MetaData, Table, Column, Uuid, String, select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine

db_args = {
    "dbname": os.getenv("PGDATABASE", "mydb"),
    "user": os.getenv("PGUSER", "postgres"),
    "password": os.getenv("PGPASSWORD", "overwriteme"),
    "host": os.getenv("PGHOST", "localhost"),
    "port": os.getenv("PGPORT", "5432"),
}

meta = MetaData()
users = Table(
    "users",
    meta,
    Column("username", String(32), primary_key=True, nullable=False),
    Column("password_hash", String(128), nullable=False),
    Column("blob_id", Uuid, unique=True, nullable=False),
    Column("totp", String(32), nullable=True),
)


def get_connection_string():
    return f"postgresql+asyncpg://{db_args["user"]}:{db_args["password"]}@{db_args["host"]}:{db_args["port"]}/{db_args["dbname"]}"


async def init_db():
    engine = create_async_engine(get_connection_string())

    async with engine.begin() as conn:
        await conn.run_sync(meta.create_all)

    return engine


async def create_user(
    engine: AsyncEngine, username: str, password_hash: str, totp: str
):
    async with engine.begin() as conn:
        await conn.execute(
            users.insert(),
            {
                "username": username,
                "password_hash": password_hash,
                "blob_id": uuid.uuid4(),
                "totp": totp,
            },
        )


async def get_user(engine: AsyncEngine, username: str):
    async with engine.begin() as conn:
        result = await conn.execute(select(users).where(users.c.username == username))
        user = result.fetchone()

        if user is None:
            return None
        else:
            return {
                "username": user[0],
                "password_hash": user[1],
                "blob_id": user[2],
                "totp": user[3],
            }


async def get_blob(engine: AsyncEngine, username: str, blob_dir: str):
    user = await get_user(engine, username)

    if user is None:
        raise Exception("User not found")

    blob_name = os.path.join(blob_dir, str(user["blob_id"]))

    if not os.path.isfile(blob_name):
        return ""

    async with aiofiles.open(blob_name, mode="r") as file:
        return await file.read()


async def write_blob(engine: AsyncEngine, username: str, blob_dir: str, blob: str):
    user = await get_user(engine, username)

    if user is None:
        raise Exception("User not found")

    blob_name = os.path.join(blob_dir, str(user["blob_id"]))

    async with aiofiles.open(blob_name, mode="w") as file:
        await file.write(blob)
