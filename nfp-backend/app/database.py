import os
import databases
import sqlalchemy
from sqlalchemy.orm import relationship
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

database = databases.Database(DATABASE_URL)

metadata = sqlalchemy.MetaData()

notes = sqlalchemy.Table(
    "notes",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("text", sqlalchemy.String),
    sqlalchemy.Column("completed", sqlalchemy.Boolean),
)

users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("username", sqlalchemy.String),
    sqlalchemy.Column("hashed_password", sqlalchemy.String),
    sqlalchemy.Column("capital", sqlalchemy.Integer)
)

shops = sqlalchemy.Table(
    "shops",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String),
    sqlalchemy.Column("description", sqlalchemy.String)
)


products = sqlalchemy.Table(
    "products",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String),
    sqlalchemy.Column("description", sqlalchemy.String),
    sqlalchemy.Column("stock", sqlalchemy.Integer),
    sqlalchemy.Column("price", sqlalchemy.Integer),
    sqlalchemy.Column("ask_price", sqlalchemy.Integer),
    sqlalchemy.Column("shop_id", sqlalchemy.Integer, sqlalchemy.ForeignKey('shops.id'), primary_key=True),

)

shops.products = relationship("Products", order_by = products.c.id, back_populates = "shops")
shops.products = relationship("Shops", order_by = shops.c.id, back_populates = "products")

inventory = sqlalchemy.Table(
    "inventory",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String),
    sqlalchemy.Column("description", sqlalchemy.String),
    sqlalchemy.Column("quantity", sqlalchemy.Integer),
    sqlalchemy.Column("user_username", sqlalchemy.Integer, sqlalchemy.ForeignKey('users.username')),

)

all_products = sqlalchemy.Table(
    "all_products",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String)
)


# TODO: create sqlalchemy ORM Products instead of sqlalchemy core products. then properly define the relationsship both ways


engine = sqlalchemy.create_engine(
    DATABASE_URL
)



conn = engine.connect()
# user passwords: asdf1324
# use this when recreating the db table with the alembic migrations

""" conn.execute(users.insert(), [
   {'id':1, 'username':'temp1', 'hashed_password':'$2b$12$9otiY1u97UZP/GoGGQ.rJ.70SCeL5WA5DMsHg4ZpFRmUu952z6dwS', "capital":"20000"},
   {'id':2, 'username':'temp2', 'hashed_password':'$2b$12$IEjkZD7CGbRPuKs7kwA53eRxvr5Z.DZTiEmL4gxM5vV7b48Aja4Bu', "capital":"20000"}
])

conn.execute(shops.insert(), [
   {'id':1, 'name':'Shop1', 'description':'some shop somewhere'},
   {'id':2, 'name':'Shop2', 'description':'some shop somewhere else'}
])

conn.execute(products.insert(), [
   {'id':1, 'name':'Apples', "price":"200", "ask_price": 150, "stock":90, "shop_id":1},
   {'id':2, 'name':'Bananas', "price":"400", "ask_price": 330, "stock":60,"shop_id":1},
   {'id':3, 'name':'Kiwis', "price":"180", "ask_price": 150, "stock":70,"shop_id":1},
   {'id':2, 'name':'Bananas', "price":"300", "ask_price": 250, "stock":30,"shop_id":2},
   {'id':4, 'name':'Oranges', "price":"700", "ask_price": 600, "stock":50,"shop_id":2},
   {'id':5, 'name':'Strawberries', "price":"700", "ask_price": 600, "stock":40,"shop_id":2}
])

conn.execute(inventory.insert(), [
   {'id':1, 'name':'Apples', "quantity":2,"user_username":"temp1"},
   {'id':2, 'name':'Bananas', "quantity":2,"user_username":"temp1"},
   {'id':4, 'name':'Oranges', "quantity":9,"user_username":"temp2"}
]) 

conn.execute(all_products.insert(), [
   {'id':1, 'name':'Apples'},
   {'id':2, 'name':'Bananas'},
   {'id':3, 'name':'Kiwis'},
   {'id':4, 'name':'Oranges'},
   {'id':5, 'name':'Strawberries'},
   {'id':6, 'name':'Tomatos'},
   {'id':7, 'name':'Pineapple'}
]) """