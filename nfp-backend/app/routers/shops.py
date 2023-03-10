from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, APIRouter, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
# from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from ..database import shops, products, database, users, inventory
from .users import User, get_current_active_user

class Product(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    stock: int
    price: int
    ask_price: int

class Shop(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    products: list[Product] = []

class BuyItem(BaseModel):
    shop_id: int
    id: int
    quantity: int

class SellItem(BaseModel):
    shop_id: int
    id: int
    quantity: int

router = APIRouter()

""" 
def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        return None


def get_password_hash(password):
    return pwd_context.hash(password)


async def get_user(username: str):
    query = users.select().where(users.c.username == username)
    try:
        user = await database.fetch_one(query)
        return UserInDB(username=user["username"], hashed_password=user["hashed_password"])
    except Exception as e:
        print(e)
        return None
 """

testResultDict = {
    "id": 1, 
    "products":[
        {
            "id":1, 
            "name":"product1",
            "price":200
        },
        {
            "id":2, 
            "name":"product2",
            "price":400
        }
    ]
}

@router.get("/shops/")
async def get_all_shops():
    shopsQuery = shops.select()
    try:
        result = []
        allshops = await database.fetch_all(shopsQuery)
        for shop in allshops:
            shopData = await get_shop(shop["id"])
            result.append(shopData)
        return result
    except Exception as e:
        return e
    # return testResultDict

@router.get("/shops/{shop_id}/", response_model=Shop)
async def get_shop(shop_id: int = 1):
    shopsQuery = shops.select().where(shops.c.id == shop_id)
    productsQuery = products.select().where(products.c.shop_id == shop_id)
    try:
        shop = await database.fetch_one(shopsQuery)
        shopProducts = await database.fetch_all(productsQuery)
        # print(shop["products"])
        # shop["products"] = shopProducts
        # print(shop["products"])
        return {**shop, "products":shopProducts}
    except Exception as e:
        return e
    # return testResultDict


'''
buy a product: POST: id, quantity
'''
# @router.post("/shops/{shop_id}/")
@router.post("/shops/buy/")
async def buy_product(buyItem: BuyItem, current_user: User = Depends(get_current_active_user)):
    productQuery = products.select().where(products.c.id == buyItem.id, products.c.shop_id == buyItem.shop_id)
    try:
        shopProduct = await database.fetch_one(productQuery)
        userCapital = dict(current_user)["capital"]
        totalBill = buyItem.quantity * shopProduct["price"]
        if shopProduct["stock"] < buyItem.quantity:
            return {"error":"Can't buy more than in stock.","stock":shopProduct["stock"], "quantity":buyItem.quantity}
        # if user doesnt have enough moeny
        if userCapital < totalBill:
            return {"error":"Can't buy more than your capital.","stock":shopProduct["price"], "quantity":buyItem.quantity}
        # deduce from user money
        query = users.update().where(users.c.username == current_user.username).values(
            capital= userCapital-totalBill
        )
        last_record_id = await database.execute(query)
        # deduce from stock
        query = products.update().where(products.c.id == buyItem.id, products.c.shop_id == buyItem.shop_id).values(
            stock=shopProduct["stock"]-buyItem.quantity
        )
        last_record_id = await database.execute(query)
        # increase user inventory
        # check if user has inventory of this product already. if yes: update. if no: insert
        checkIfProductExistsQuery = inventory.select().where(inventory.c.id == buyItem.id, inventory.c.user_username == current_user.username)
        productInInventory = await database.fetch_one(checkIfProductExistsQuery)
        # print("does the item exists in the user's inventory already? ", dict(productInInventory))
        if productInInventory:
            query = inventory.update().where(inventory.c.id == buyItem.id, inventory.c.user_username == current_user.username).values(
                quantity=productInInventory["quantity"] + buyItem.quantity
            )
            result = await database.execute(query)
        else:
            query = inventory.insert().values(
                id=shopProduct["id"],
                name=shopProduct["name"],
                quantity=buyItem.quantity,
                user_username=current_user.username
            )
            result = await database.execute(query)
        getUpdatedUser = users.select().where(users.c.username == current_user.username)
        updatedUser = await database.fetch_one(getUpdatedUser)  
        getUpdatedUserInventory = inventory.select().where(inventory.c.user_username == current_user.username)
        updatedUserInventory = await database.fetch_all(getUpdatedUserInventory)  
        return {"userBasic":updatedUser, "userStock":updatedUserInventory}
    except Exception as e:
        print(e)
        return e
    # return testResultDict


'''
sell a product: POST: id, quantity
check if we have enough in inventory to sell that much
check if shop has an entry for this product id AND if the ask_price for it is > 0
add quantity to shop stock
remove quantity from inventory
add money to capital

'''
# @router.post("/shops/{shop_id}/")
@router.post("/shops/sell/")
async def buy_product(sellItem: SellItem, current_user: User = Depends(get_current_active_user)):
    try:
        # check if we have enough in inventory to sell that much
        verifyInventoryQuery = inventory.select().where(inventory.c.user_username == current_user.username, inventory.c.id == sellItem.id)
        currentInventory = await database.fetch_one(verifyInventoryQuery)
        if not currentInventory:
            return {"error":"You don't have products with this id in your inventory.","id":sellItem.id}
        userStock = dict(currentInventory)["quantity"]
        if userStock < sellItem.quantity:
            return {"error":"You don't have enough stock of this product in your inventory.","id":sellItem.id, "stock":userStock} 
        print("inventory OK")
        # inventory OK
            
        # check if shop has an entry for this product id AND if the ask_price for it is > 0
        shopProductQuery = products.select().where(products.c.shop_id == sellItem.shop_id, products.c.id == sellItem.id)
        shopProductResult = await database.fetch_one(shopProductQuery)
        if not shopProductResult:
            return {"error":"The shop is not interested in buying this product, as it is not listed in the shop.","id":sellItem.id}
        shopAskPrice = shopProductResult["ask_price"]
        if shopAskPrice <= 0:
            return {"error":"The shop is missing an ask price for this product.","id":id, "ask_price":shopAskPrice}
        print("shop product and ask_price OK")
        # shop product and ask_price OK

        # add quantity to shop stock
        # UPDATE: when we sell to the store, we cant buy it back anymore -> DONT add to shop stock
        """ addToShopShock = products.update().where(products.c.shop_id == sellItem.shop_id, products.c.id == sellItem.id).values(
            stock= dict(shopProductResult)["stock"] + sellItem.quantity
        )
        result = await database.execute(addToShopShock) """

        # remove quantity from inventory
        removeFromInventoryQuery = inventory.update().where(inventory.c.user_username == current_user.username, inventory.c.id == sellItem.id).values(
            quantity=userStock-sellItem.quantity
        )
        result = await database.execute(removeFromInventoryQuery)
        print("removed quantity from inventory")

        # add money to capital
        earnings = shopAskPrice * sellItem.quantity # calculate how much the user earns from selling: product price * quantity
        getCurrentUser = users.select().where(users.c.username == current_user.username)
        currentUser = await database.fetch_one(getCurrentUser)
        updateCapQuery = users.update().where(users.c.username == current_user.username).values(
            capital= dict(currentUser)["capital"] + earnings
        )
        result = await database.execute(updateCapQuery)
        # return new capital and user inventory
        getUpdatedUser = users.select().where(users.c.username == current_user.username)
        updatedUser = await database.fetch_one(getUpdatedUser)  
        getUpdatedUserInventory = inventory.select().where(inventory.c.user_username == current_user.username)
        updatedUserInventory = await database.fetch_all(getUpdatedUserInventory)  
        return {"userBasic":updatedUser, "userStock":updatedUserInventory}
        return currentUser
    except Exception as e:
        print("Error: ",e)
        return e
    # return testResultDict
