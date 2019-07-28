// Declarations
var grid;
var modal; // Div element that gets set by every button that opens a modal
var modals = document.querySelectorAll(".modal"); // List of all modals. Only used in initialisation.
var draggable = true; // Specifies whether grid items are draggable or not
var group; // Boolean specifying whether the card to add is a group card or not
var newCardBtn = document.querySelector(".newCardBtn");
var closeButtons = document.querySelectorAll(".close-button"); // List of all modal close buttons
var regBtn = document.querySelector('.regBtn');
var groupBtn = document.querySelector('.groupBtn');
var addCardbtn = document.querySelector('.addCardbtn');
var ghost; // "Card" used for adding other cards.

// Functions
function toggleModal() { // Toggles the selected modal visibility and whether grid items can be dragged
  modal.classList.toggle("show-modal");
  draggable = !draggable;
}

function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}

function addCard(data) { // Creates a HTML element based on the data and adds it to the grid
  var itemElem = document.createElement('div');
  if (data.length == 3) { // If 3, create a regular card
    var itemTemplate = '' +
        '<div class="item">' +
          '<div class="item-content">' +
            '<h4>' + data[0] + '</h4>' +
            '<h6>' + data[1] + '</h6>' +
            '<p>' + data[2] + '</p>' +
          '</div>' +
        '</div>';
  } else { // Otherwise create a grid
    var itemTemplate = '' +
        '<div class="item">' +
          '<div class="item-content">' +
            '<h4>' + data[0] + '</h4>' +
          '</div>' +
        '</div>';
  }

  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
}

// Main part
grid = new Muuri('.grid', { // Initialise the grid
  items: "*", // Default value. Change this to an array
  dragEnabled: true,
  dragContainer: document.body,
  dragStartPredicate: function (item, e) { // Items are draggable if draggable is true
    if (item === ghost) return false;
    return draggable;
  }
});

ghost = grid.getItems(0)[0];

grid.on('dragEnd', function (item, event) {
  if (grid.getItems(0)[0] !== ghost) {
    grid.move(item, ghost); // Swap the item positions, putting the ghost back in front
  }
});

modals.forEach(function(mod) { // Enables the modals
  mod.style.display = "block";
});

newCardBtn.addEventListener('click', function(event) { // Every modal-opening button has to set "modal" to be something else
  modal = document.getElementById("newCard");
  toggleModal();
});

/* This is just an example. This (along with the associated html) can be deleted */
var exampleBtn = document.querySelector(".exampleBtn");
exampleBtn.addEventListener('click', function(event) {
  modal = document.getElementById("example"); // Every modal-opening button has to set "modal" to be something else
  toggleModal();
});

closeButtons.forEach(function(closeButton) { // Adds event listeners to all the modal close buttons
  closeButton.addEventListener('click', toggleModal);
});
window.addEventListener('click', windowOnClick);

regBtn.addEventListener('click', function(event) {
  group = false;
  regBtn.disabled = true;
  groupBtn.disabled = false;
});

groupBtn.addEventListener('click', function(event) {
  group = true;
  regBtn.disabled = false;
  groupBtn.disabled = true;
});

// Sends the signal to add a card. Would be based off modal element contents
addCardbtn.addEventListener('click', function(event) {
  if (group) { // If "group" is selected in the modal, generate a group
    addCard(["Group Title"]);
  } else { // Otherwise generate a standard card
    addCard(["Sample title", "Sample comment", "Sample code"]);
  }
});
