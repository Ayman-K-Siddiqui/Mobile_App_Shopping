if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then(
    (registration) => {
      console.log("Service worker registration succeeded:", registration);
    },
    (error) => {
      console.error(`Service worker registration failed: ${error}`);
    }
  );
} else {
  console.error("Service workers are not supported.");
}

const db = new Dexie("ShoppingApp");

db.version(2).stores({
  items: "++id, name, price, quantity, discount, isPurchased",
});
// #creates new database with name ShoppingApp and version 1 and object

const itemsForm = document.getElementById("itemForm");
const itemsDiv = document.getElementById("itemsDiv");
const totalPriceDiv = document.getElementById("totalPriceDiv");

// line 19 used to conditionally add the "purchased" class to the <div> element based on the value of item.isPurchased
// line27, had to bind the event to the checkbox, so that the function would know which item to update
const renderItems = async () => {
  const allItems = await db.items.reverse().toArray();
  let totalPrice = 0; // Initialize total price

  itemsDiv.innerHTML = allItems
    .map((item) => {
      // Calculate the discounted price
      const discountedPrice =
        (item.price * item.quantity * (100 - item.discount)) / 100;

      if (item.isPurchased) {
        // If the item is purchased, subtract its price from the total
        totalPrice -= discountedPrice;
      } else {
        // If the item is not purchased, add its price to the total
        totalPrice += discountedPrice;
      }

      return `<div class="item ${item.isPurchased ? "purchased" : ""}">
      <label>
        <input type="checkbox" class="checkbox" 
          onchange="itemStatus(event, ${item.id})"
          ${item.isPurchased ? "checked" : ""}>
      </label>

      <div class="itemInfo">
        <p>${item.name}</p>
        <p>$${discountedPrice.toFixed(2)} x ${item.quantity}</p>
      </div>

      <button class="deleteButton" onclick="deleteItem(${item.id})">X</button>
    </div>`;
    })

    .join("");
  totalPrice = Math.max(totalPrice, 0);
  // #makes sure that the total price is not a negative number
  totalPriceDiv.innerText = `Total Price: $${totalPrice.toFixed(2)}`;
};

// #adding all the values of arrayOfPrice together

window.onload = () => {
  renderItems();
};
// #runs renderItems function when page loads

itemsForm.onsubmit = async (e) => {
  e.preventDefault();

  const name = document.getElementById("nameInput").value;
  const quantity = document.getElementById("quantityInput").value;
  const price = document.getElementById("priceInput").value;
  const discount = document.getElementById("discountInput").value;
  // #takes the inputted values from the form

  await db.items.add({
    name: name,
    quantity: quantity,
    price: price,
    discount: discount,
  });
  // #adds the inputted values to the database
  await renderItems();
  // #takes the current inputted item and adds it to the database display

  itemsForm.reset();
};

const itemStatus = async (e, id) => {
  await db.items.update(id, { isPurchased: !!e.target.checked });
  await renderItems();
};

const deleteItem = async (id) => {
  await db.items.delete(id);
  await renderItems();
};

const removeAll = async () => {
  await db.items.clear();
  await renderItems();
};

// #updates the isPurchased value to true or false, depending on the checkbox CLICKED OR not
