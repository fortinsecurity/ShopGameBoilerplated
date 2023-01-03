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
      "currentShop": 0, // array index and NOT shop id
      "shops": [
        {
          "id": 1,
          "name": "Shop1",
          "description": "some shop somewhere",
          "products": [
            {
              "id": 1,
              "name": "Apples",
              "price": 300,
              "ask_price": 350,
              "stock": 50
            },
            {
              "id": 2,
              "name": "Bananas",
              "price": 300,
              "ask_price": 350,
              "stock": 50
            },
            {
              "id": 3,
              "name": "Oranges",
              "price": 600,
              "ask_price": 650,
              "stock": 50
            },
          ]
        },
        {
          "id": 2,
          "name": "Shop2",
          "description": "some shop somewhere",
          "products": [
            {
              "id": 1,
              "name": "Apples",
              "price": 100,
              "ask_price": 150,
              "stock": 10
            },
            {
              "id": 2,
              "name": "Bananas",
              "price": 100,
              "ask_price": 150,
              "stock": 10
            },
            {
              "id": 3,
              "name": "Oranges",
              "price": 900,
              "ask_price": 950,
              "stock": 10
            },
          ]
        }
      ],
      "userStock": [
        {
          "id": 1,
          "name": "Apples",
          "description": "",
          "quantity": 5,
        },
        {
          "id": 2,
          "name": "Bananas",
          "description": "",
          "quantity": 2,
        },
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

  async getUserBasicData() {
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
      let userBasicDataJson = await res.json();
      // update state
      let newUserBasic = Object.assign({}, this.state.userBasic);
      newUserBasic.loggedIn = true
      newUserBasic.username = userBasicDataJson.username;
      newUserBasic.capital = userBasicDataJson.capital;
      this.setState({
        userBasic: newUserBasic,
        statusMessage: "Successfully logged in as " + newUserBasic.username + "."
      })
    } else {
      alert("Couldn't get user data.")
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    // login form

    
    await this.getToken(e);

    
    await this.getUserBasicData();


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
    deduce from user capital
    deduce from shop stock
  */

  handleBuy(productid) {
    console.log("clicked buy: ", productid);
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

    // deduce from user capital
    let newCapicalState = Object.assign({}, this.state.userBasic);
    newCapicalState.capital -= this.state.shops[this.state.currentShop]
      .products[findProductById(productid, this.state.shops[this.state.currentShop])]["price"];
    this.setState({
      userBasic: newCapicalState
    });

    // deduce from shop stock
    let newShopState = Object.assign({}, this.state.shops[this.state.currentShop]);
    newShopState.products[findProductById(productid, this.state.shops[this.state.currentShop])]["stock"] -= 1;
    console.log(newShopState);
    this.setState({
      shop: newShopState
    });

    // add to user stock
    let newUserStockState = Object.assign([], this.state.userStock);
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
    });
  }; // handleBuy

  handleSell(productid) {
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

    // add to user capital
    let newCapicalState = Object.assign({}, this.state.userBasic);
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
    });


    // add to user stock
    let newUserStockState = Object.assign([], this.state.userStock);
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
    });

  };

  handleTravel(shopArrayIndex) {
    this.setState({
      currentShop: shopArrayIndex,

    })
  }

  render() {



    const mapShop = this.state.shops[this.state.currentShop].products.map((element, index) => {
      return (
        <table>
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
              {element.ask_data}
            </td>
            <td>
              {element.stock}
            </td>
            <td>
              <button onClick={() => this.handleBuy(element.id)}>Buy 1</button>
            </td>
            <td>
              <button onClick={() => this.handleSell(element.id)}>Sell 1</button>
            </td>
          </tr>

        </table>
      );
    });

    const mapAllShops = this.state.shops.map((element, index) => {

      return (
        <table>
          <tr>
            <td>
              {element.name}
            </td>
            <td>
              {element.description}
            </td>
            <td>
              <button onClick={() => this.handleTravel(index)}>Travel</button>
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
              <h1>{this.state.shops[this.state.currentShop].name}</h1>
              {mapShop}
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