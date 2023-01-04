/* 
  TODO:
    init user inventory and shop stock properly after login
    buying oranges gives kiwis
    shop travel?
*/

import React from 'react';
import './App.css';

class App extends React.Component {

  BACKEND_SERVER_URL = "http://localhost:8000";

  constructor(props) {
    super(props);
    this.state = {
      "statusMessage": "Welcome!",
      "userBasic":
      {
        "id": 1,
        "username": "temp1",
        "capital": 20000,
        "password": "",
        "loggedIn": false
      },
      "currentShop": 1,
      "currentShopArrId": 0,
      "shops": [
        {
          "id": 1,
          "name": "Shop1",
          "description": "some shop somewhere",
          "products": [
            {
              "id": 0,
              "name": "Dummy",
              "description": null,
              "stock": 0,
              "price": 0,
              "ask_price": 0
            }
          ]
        },
        {
          "id": 2,
          "name": "Shop2",
          "description": "some shop somewhere",
          "products": [
            {
              "id": 0,
              "name": "Dummy",
              "description": null,
              "stock": 0,
              "price": 0,
              "ask_price": 0
            }
          ]
        }
      ],
      "userStock": [
      ]
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  };


  /* Login */
  handleUsernameChange(e) {
    let newUserName = Object.assign({}, this.state.userBasic);
    newUserName.username = e.target.value
    this.setState({
      userBasic: newUserName
    })
  }

  handlePasswordChange(e) {
    let newUserName = Object.assign({}, this.state.userBasic);
    newUserName.password = e.target.value
    this.setState({
      userBasic: newUserName
    })
  }

  // login
  /* 
    send form as POST to /token to get the JWT auth token and set the JWT token in local storage
    GET /users/me to get userBasic data and setState with the data from /users/me
  */

  /* helpers */
  async getToken(e) {
    const formData = new FormData();
    formData.append('username', this.state.userBasic.username);
    formData.append('password', this.state.userBasic.password);
    let res = await fetch(`${this.BACKEND_SERVER_URL}/token`, {
      method: 'POST',
      body: formData
    });
    if (res.status == 200) {
      let loginResponseJson = await res.json();
      localStorage.setItem('token', loginResponseJson.access_token);
    } else {
      alert('Login failed.')
    }
  }

  async getUserData() {
    const formData = new FormData();
    formData.append('username', this.state.userBasic.username);
    formData.append('password', this.state.userBasic.password);
    let res = await fetch(`${this.BACKEND_SERVER_URL}/users/me` + new URLSearchParams({

    }), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (res.status == 200) {
      let { userBasic, userStock } = await res.json();
      // update state
      let newUserBasic = Object.assign({}, this.state.userBasic);
      newUserBasic.loggedIn = true
      newUserBasic.username = userBasic.username;
      newUserBasic.capital = userBasic.capital;
      this.setState({
        userBasic: newUserBasic,
        userStock: userStock,
        statusMessage: "Successfully logged in as " + newUserBasic.username + "."
      })
    } else {
      alert("Couldn't get user data.")
    }
  }

  async getUserInventory() {

  }

  async handleSubmit(e) {
    e.preventDefault();
    await this.getToken(e);
    await this.getUserData();

    // get user info and populate state
    /*       const res = await fetch(`${this.BACKEND_SERVER_URL}/users/me`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: note,
              completed: false
            })
          })
          const json = await res.json();
          setNotes([...notes, json]) */
  }

  async handleLogout(e) {
    e.preventDefault();
    let newUserBasic = Object.assign({}, this.state.userBasic);
    newUserBasic.loggedIn = false
    this.setState({
      userBasic: newUserBasic,
      statusMessage: "Successfully logged out."
    })
  }

  /* 
    OLD
    deduce from user capital
    deduce from shop stock
  */

  /* 
    POST to /shops/buy, 
    update userBasic with resulting user capital.
    shop stock is going to be reduced on the frontend if everything went well (see main method)
  
  */

  // helper
  async postBuyProduct(shopid, productid, quantity) {
    const res = await fetch(`${this.BACKEND_SERVER_URL}/shops/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        shop_id: shopid,
        id: productid,
        quantity: quantity
      })
    })
    if (res.status == 200) {
      let { userBasic, userStock } = await res.json();
      // update state
      let newUserBasic = Object.assign({}, this.state.userBasic);
      console.log("newUserBasic: ", newUserBasic);
      console.log("userBasic: ", userBasic);
      newUserBasic.capital = userBasic.capital;
      this.setState({
        userBasic: newUserBasic,
        userStock: userStock
      })
      return true
    } else {
      alert("Failed buying the item.")
    }
  }

  async handleBuy(productid) {
    console.log("clicked buy: ", productid);
    const shopid = this.state.currentShop;
    const buyResult = await this.postBuyProduct(shopid, productid, 1);
    if (buyResult) {
      // deduce from shop stock
      let newShopState = Object.assign({}, this.state.shops[this.state.currentShopArrId]);
      newShopState.products[findProductById(productid, this.state.shops[this.state.currentShopArrId])]["stock"] -= 1;
      console.log(newShopState);
      this.setState({
        shop: newShopState
      });
    }

    // helpers
    /* 
      we get passed the product id. we need to find the shop.products array index of this product
    */
    function findProductById(productid, shop) {
      console.log("this is the shop inside findProductById: ", shop)
      for (var i = 0; i < shop.products.length; i++) {
        if (shop.products[i]["id"] == productid) {
          return i
        }
      }
    };

    /* 
      we get passed the product id. we need to find the userStock array index of this product
    */
    function findStockById(productid, userStock) {
      let res = -1;
      for (let i = 0; i < userStock.length; i++) {
        if (userStock[i]["id"] == productid) {
          res = i;
        }
      }
      return res;
    };

    // OLD - replaced by actual logic
    // deduce from user capital
    /*     let newCapicalState = Object.assign({}, this.state.userBasic);
        newCapicalState.capital -= this.state.shops[this.state.currentShop]
          .products[findProductById(productid, this.state.shops[this.state.currentShop])]["price"];
        this.setState({
          userBasic: newCapicalState
        }); */



    // OLD - replaced by actual logic
    // add to user stock
    /*     let newUserStockState = Object.assign([], this.state.userStock);
        if (findStockById(productid, this.state.userStock) < 0) {
          let newInventory = {
            "id": productid,
            "name": this.state.shops[this.state.currentShop].products[findProductById(productid, this.state.shops[this.state.currentShop])].name,
            "description": this.state.shops[this.state.currentShop].products[findProductById(productid, this.state.shops[this.state.currentShop])].name,
            "quantity": 1
          }
          newUserStockState.push(newInventory)
        } else {
          newUserStockState[findStockById(productid, this.state.userStock)]["quantity"] += 1;
        }
        this.setState({
          userStock: newUserStockState
        }); */
  }; // handleBuy



  /* 
    POST to /shops/sell, 
    update userBasic with resulting user capital.
    shop stock is going to be reduced on the frontend if everything went well (see main method)
  
  */

  // helper
  async postSellProduct(shopid, productid, quantity) {
    const res = await fetch(`${this.BACKEND_SERVER_URL}/shops/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        shop_id: shopid,
        id: productid,
        quantity: quantity
      })
    })
    if (res.status == 200) {
      let { userBasic, userStock } = await res.json();
      // update state
      let newUserBasic = Object.assign({}, this.state.userBasic);
      console.log("newUserBasic: ", newUserBasic);
      console.log("userBasic: ", userBasic);
      newUserBasic.capital = userBasic.capital;
      this.setState({
        userBasic: newUserBasic,
        userStock: userStock
      })
      return true
    } else {
      alert("Failed selling the item.")
    }
  }

  async handleSell(productid) {
    const shopid = this.state.currentShop;
    const sellResult = await this.postSellProduct(shopid, productid, 1);


    // OLD - replaced by actual logic
    // add to user capital
    /*     let newCapicalState = Object.assign({}, this.state.userBasic);
        newCapicalState.capital += this.state.shops[this.state.currentShop].products[findProductById(productid, this.state.shop)]["price"]
        this.setState({
          userBasic: newCapicalState
        });
    
        console.log("clicked sell: ", productid);
        let newShopState = Object.assign({}, this.state.shops[this.state.currentShop]);
        const arrId = findProductById(productid, this.state.shops[this.state.currentShop]);
        newShopState.products[arrId]["stock"] += 1;
        console.log(newShopState);
        this.setState({
          shop: newShopState
        }); */


    // OLD - replaced by actual logic
    // add to user stock
    /*     let newUserStockState = Object.assign([], this.state.userStock);
        if (findStockById(productid, this.state.userStock) < 0) {
          let newInventory = {
            "id": productid,
            "name": this.state.shops[this.state.currentShop].products[findProductById(productid, this.state.shops[this.state.currentShop])].name,
            "description": this.state.shops[this.state.currentShop].products[findProductById(productid, this.state.shops[this.state.currentShop])].name,
            "quantity": 1
          }
          newUserStockState.push(newInventory)
        } else {
          newUserStockState[findStockById(productid, this.state.userStock)]["quantity"] -= 1;
        }
        this.setState({
          userStock: newUserStockState
        }); */

    // helpers
    function findProductById(productid, shop) {
      console.log("this is the shop inside findProductById: ", shop)
      for (var i = 0; i < shop.products.length; i++) {
        if (shop.products[i]["id"] == productid) {
          return i
        }
      }
    };

    function findStockById(productid, userStock) {
      console.log("this is the inventory inside findProductById: ", userStock)
      for (var i = 0; i < userStock.length; i++) {
        if (userStock[i]["id"] == productid) {
          return i
        }
      }
    };

  };

  handleTravel(shopId) { // shopId is the actual id, not the array index
    let currentShopArrId = 0;
    // we need also the array index of the new shop
    for (var i = 0; i < this.state.shops.length; i++) {
      if (this.state.shops[i].id == shopId) {
        currentShopArrId = i;
        break;
      }
    }
    console.log("handleTravel: we are traveling to shopId: %s, with array index: %s ", shopId, currentShopArrId);
    this.setState({
      currentShop: shopId,
      currentShopArrId: currentShopArrId
    })
    this.loadShopProducts(shopId);
  }

  // helper
  async loadShopProducts(shopId) {
    let currentShopId;
    if (shopId) {
      currentShopId = shopId;
    } else {
      currentShopId = this.state.currentShop;
    }
    console.log("current shop: ", currentShopId);
    let res = await fetch(`${this.BACKEND_SERVER_URL}/shops/` + currentShopId);
    if (res.status == 200) {
      let currentShop = await res.json();
      console.log("new shop: ", currentShop)
      // update state
      let shops;
      let replaced = false;
      shops = Object.assign([], this.state.shops);
      for (var i = 0; i < this.state.shops.length; i++) {
        if (this.state.shops[i].id == currentShop.id) {
          shops[i] = currentShop;
          replaced = true;
        }
      }
      if (!replaced) {
        shops.push(currentShop);
      }
      this.setState({
        shops: shops
      })
    } else {
      alert("Couldn't get current shop's products.")
    }
  }

  // check if we own a valid token. if yes: set state.loggedIn to true
  // load shop once
  // TODO
  componentDidMount() {
    console.log("called componentDidMount");
    if (!this.state.loggedIn) {
      /* 
        check if token
        check if token still valid (by expiration date in the payload)
        if yes: set state.loggedIn to true
        TODO: If we get a 404 anyway anywhere, we should set state.loggedIn to false
      */
    }

    // load shops. TODO set a proper condition to ensure it has been loaded only once, or figure out why componentDidMount currently runs twice
    if (true) {
      this.loadShopProducts();
    }

  }

  render() {


    const mapShop = this.state.shops[this.state.currentShopArrId].products.map((element, index) => {
      return (
        <tr>
          <td>
            {element.id}
          </td>
          <td>
            {element.name}
          </td>
          <td>
            {element.price}
          </td>
          <td>
            {element.ask_price}
          </td>
          <td>
            {element.stock}
          </td>
          <td>
            {this.state.userBasic.loggedIn &&
              <button onClick={() => this.handleBuy(element.id)}>Buy 1</button>
            }
          </td>
          <td>
            {this.state.userBasic.loggedIn &&
              <button onClick={() => this.handleSell(element.id)}>Sell 1</button>
            }
          </td>
        </tr>
      );
    });

    const mapAllShops = this.state.shops.map((element, index) => {

      return (
        <table>
          <tr>
            <td>
              {element.name}
            </td>
            {/*             <td>
              {element.description}
            </td> */}
            <td>
              <button onClick={() => this.handleTravel(element.id)}>Travel</button>
            </td>
          </tr>
        </table>
      );
    });


    const mapUserStock = this.state.userStock.map((element, index) => {

      return (
        <table>
          <tr>
            <td>
              {element.name}
            </td>
            <td>
              {element.quantity}
            </td>
          </tr>

        </table>
      );
    });

    return (
      <div className="App">
        <header className="App-header">
          <p className="testp">
            WebShop game
          </p>
        </header>
        <div className="Center">
          <div className="LeftNavi">
            <h1>All Shops</h1>
            {mapAllShops}
          </div>
          <div className="Main">
            <div className="MainUpper">
              <h1>{this.state.shops[this.state.currentShopArrId].name}</h1>
              <table>
                <tr>
                  <th>
                    ID
                  </th>
                  <th>
                    Name
                  </th>
                  <th>
                    Buy Price
                  </th>
                  <th>
                    Sell Price
                  </th>
                  <th>
                    Stock
                  </th>
                </tr>
                {mapShop}
              </table>
            </div>
            <div className="MainLower">
              <h2>Status message</h2>
              {this.state.statusMessage}
            </div>
          </div>
          <div className="RightNavi">
            {!this.state.userBasic.loggedIn &&
              <div className="LoginForm">
                <h1>Please login first!</h1>
                <form action="#" method="POST" onSubmit={this.handleSubmit}>
                  <input type="hidden" name="remember" defaultValue="true" />
                  <div>
                    <div>
                      <label htmlFor="username">
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Username"
                        value={this.state.userBasic.username}
                        onChange={this.handleUsernameChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="password">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                        value={this.state.userBasic.password}
                        onChange={this.handlePasswordChange}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Forgot your password?
                      </a>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">

                      </span>
                      Sign in
                    </button>
                  </div>
                </form>


              </div>
            }
            {this.state.userBasic.loggedIn &&
              <div className="LoggedIn">
                <h1>User</h1>
                <p>You are logged in as: {this.state.userBasic.username}</p>
                <p>Your capital is: {this.state.userBasic.capital}</p>
                <h2>Your Stock</h2>
                {mapUserStock}
                <br />
                <button onClick={this.handleLogout}>Logout</button>
              </div>
            }
          </div>
        </div>
        <div className="Footer">
          <p className="testp">
            Created with: React, FastAPI, SQLAlchemy, alembic, PostgreSQL, ❤️ (for programming)
          </p>
        </div>
      </div>
    );
  }
}

export default App;