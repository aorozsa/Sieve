// Variables
var grid = new Muuri('.grid', { // Initialise the grid
  layoutOnInit: false,
  dragEnabled: true,
  dragContainer: document.body,
  dragStartPredicate: function (item, e) { // Items are draggable if true is returned
    if (item === ghost) return false;
    return true;
  }
});
var ghost = grid.getItems(0)[0]; // "Card" used for adding other cards.
var savedItems; // Used for saving the current layout.
var saveBtn = document.querySelector('.saveBtn');
var loadBtn = document.querySelector('.loadBtn');
var group_title = document.querySelector('.group_title');
var title = document.querySelector('.title');
var comment = document.querySelector('.comment');
var code = document.querySelector('.code');

// Modal stuff. Might be deleted/changed in the future
var group; // Boolean specifying whether the card to add is a group card or not
var modal; // Div element that gets set by every button that opens a modal
var modals = document.querySelectorAll(".modal"); // List of all modals. Only used in initialisation.
var closeButtons = document.querySelectorAll(".close-button"); // List of all modal close buttons


// Functions
var val = 1;
function ghostAction() { // Change this to toggle visibility of two buttons. One will add a blank card, other will add a blank group.
  modal = document.getElementById("newCardModal");
  toggleModal();

  addNewCard([val]);
  val++;
}

function addNewCard(data) { // Creates a HTML element based on the data and adds it to the grid
  var itemElem = document.createElement('div');
  if (data.length == 3) { // If 3, create a regular card
    var itemTemplate = '' +
        '<div class="item">' +
          '<div class="item-content">' +
            '<p id="title">' + data[0] + '</p>' +
            '<p id="comment">' + data[1] + '</p>' +
            '<p id="code">' + data[2] + '</p>' +
          '</div>' +
        '</div>';

  } else { // Otherwise create a group card
    var itemTemplate = '' +
        '<div class="item">' +
          '<div class="item-content">' +
            '<p>' + data[0] + '</p>' +
          '</div>' +
        '</div>';
  }

  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
}

function toggleModal() { // Toggles the selected modal visibility and whether grid items can be dragged
  modal.classList.toggle("show-modal");
}


// Events
grid.on('dragEnd', function (item, event) {
  if (grid.getItems(0)[0] !== ghost) {
    grid.move(item, ghost); // Swap the item positions, putting the ghost back in front
  }
});

modals.forEach(function(mod) { // Enables the modals
  mod.style.display = "block";
});
closeButtons.forEach(function(closeButton) { // Adds event listeners to all the modal close buttons
  closeButton.addEventListener('click', toggleModal);
});
window.addEventListener('click', function(event) {
  if (event.target === modal) {
    toggleModal();
  }
});

saveBtn.addEventListener('click', function(event) {
  savedItems = grid.getItems();
});

loadBtn.addEventListener('click', function(event) {
  grid.remove(grid.getItems(), {removeElements: true});
  savedItems.forEach(function(item) {
    grid.add(item.getElement());
  });
  ghost = grid.getItems(0)[0];
});

/*
// Sends the signal to add a card. Would be based off modal element contents
addCardbtn.addEventListener('click', function(event) {
  try {
    if (group) { // If "group" is selected in the modal, generate a group
      if (group_title.value === "") {
        throw "Groups need to have a title";
      }
      addNewCard([group_title.value]);
    } else { // Otherwise generate a standard card
      if (title.value === "" || comment.value === "" || code.value === "") {
        throw "All fields need to be filled out."
      }
      addNewCard([title.value, comment.value, code.value]);
    }
  } catch(err) {
    alert(err);
  }
});*/
