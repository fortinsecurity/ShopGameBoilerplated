import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "userBasic":
      {
        "id": 1,
        "username": "temp1",
        "capital": 20000
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
  };

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
        "id":productid,
        "name":this.state.shops[this.state.currentShop].products[findProductById(productid, this.state.shops[this.state.currentShop])].name,
        "description":this.state.shops[this.state.currentShop].products[findProductById(productid, this.state.shops[this.state.currentShop])].name,
        "quantity":1
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
        "id":productid,
        "name":this.state.shops[this.state.currentShop].products[findProductById(productid, this.state.shops[this.state.currentShop])].name,
        "description":this.state.shops[this.state.currentShop].products[findProductById(productid, this.state.shops[this.state.currentShop])].name,
        "quantity":1
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
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <div className="Center">
          <div className="LeftNavi">
            <p className="testp">
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <h1>All Shops</h1>
            {mapAllShops}
          </div>
          <div className="Main">
            <p className="testp">
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <p>You are visiting {this.state.shops[this.state.currentShop].name}</p>
            {mapShop}
          </div>
          <div className="RightNavi">
            <p className="testp">
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <p>You are: {this.state.userBasic.username}</p>
            <p>Your capital is: {this.state.userBasic.capital}</p>
            <h2>Your Stock</h2>
            {mapUserStock}
          </div>
        </div>
        <div className="Footer">
          <p className="testp">
            Edit <code>src/App.js</code> and save to reload.
          </p>
        </div>
      </div>
    );
  }
}

export default App;