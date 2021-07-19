const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "h9h5etbub9em",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "-sksOJtnnuyBIQELTnZ3hjh_GsWKNFgoH1506A2XgZ4",
});

//Variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
// Sitewide - Sidebar Variables
const sidebarOverlay = document.querySelector(".sidebarOverlay");
const sidebar = document.querySelector(".sidebar");

//Cart
let cart = [];

let buttonsDOM = [];

//Getting the products
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "coffeeLand",
      });

      // let result = await fetch("products.json");
      // let data = await result.json();
      let products = contentful.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

//Show Products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((products) => {
      result += `
        
    <article class="product">
      <div class="img-container">

        <img src=${products.image}
        alt="produtc" class="product-img">
        <button class="bag-btn" data-id=${products.id}>
          <i class="fas fa-shoppingcart"></i>

          add to cart
        </button>
      </div>
      <h3> ${products.title}</h3>
      <h4>€${products.price}</h4>
    </article>
    
    `;
    });

    productsDOM.innerHTML = result;
  }
  getBagBtns() {
    const btns = [...document.querySelectorAll(".bag-btn")];

    buttonsDOM = btns;

    btns.forEach((btns) => {
      let id = btns.dataset.id;
      let inCart = cart.find * ((item) => item.id === id);
      if (inCart) {
        btns.innerText = "In Cart";
        btns.disabled = true;
      }

      btns.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disbaled = true;

        //Get product from products

        let cartItems = { ...Storage.getProducts(id), amount: 1 };
        //Add products to Cart
        cart = [...cart, cartItems];

        //Save cart in local Storage
        Storage.saveCart(cart);

        //Set Cart Values
        this.setCartValues(cart);

        //Dislay Cart Items

        this.addCartItem(cartItems);

        //Show the Cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    
    <img src=${item.image} alt="product">

  <div>

    <h4>${item.title} </h4>
    <h5>€${item.price}</h5>
    <span class="remove-item" data-id=${item.id}> remove</span>
  </div>

  <div>
    <i class="fas fa-chevron-up" data-id=${item.id}></i>
    <p class="item-amount">${item.amount}</p>
    <i class="fas fa-chevron-down" data-id=${item.id}></i>
  </div> `;

    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  

  setUpApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    //Clear Cart Button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // Cart Functionality - Event Bubbling
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement); //removes items from the DOM
        this.removeItem(id); //removes items from the cart
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let substractAmount = event.target;
        let id = substractAmount.dataset.id;
        let tempyItem = cart.find((item) => item.id === id);
        tempyItem.amount = tempyItem.amount - 1;

        if (tempyItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          substractAmount.previousElementSibling.innerText = tempyItem.amount;
        } else {
          cartContent.removeChild(substractAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);

    cartItems.forEach((id) => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//Local Storage so that when the page is reloaded, the items in the cart remain
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((products) => products.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // ui.sidebarLogic();
  //Setup App
  ui.setUpApp();

  //Retrieve all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagBtns();
      ui.cartLogic();
    });
});

// Vertical Sidebar Logic - Sitewide
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("fa-bars")) {
    sidebarOverlay.classList.add("transparentBcg");
    sidebar.classList.add("showSidebar");
  }
  if (event.target.classList.contains("fa-window-close")) {
    sidebarOverlay.classList.remove("transparentBcg");
    sidebar.classList.remove("showSidebar");
  }
});

// Disabling form submissions if there are invalid fields
(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();


