// Variables
var grid;
var ghost; // "Card" used for adding other cards.
var ghostMarkup = '<div class="card" id="ghost" onclick="ghostAction();"><h1>+</h1></div>'; // HTML markup for the ghost card
var saveBtn = document.querySelector('.saveBtn');
var loadBtn = document.querySelector('.loadBtn');
var clearBtn = document.querySelector('.clearBtn');
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
function initialise() {
  grid = new Muuri('.grid', { // Initialise the grid
    layoutOnInit: false,
    dragEnabled: true,
    dragContainer: document.body,
    dragPlaceholder: {
      enabled: true,
      createElement: function(item) {
        return item.getElement().cloneNode(true);
      }
    },
    dragStartPredicate: function(item, e) { // Items are draggable if true is returned
      if (item === ghost) return false;
      return Muuri.ItemDrag.defaultStartPredicate(item, e);
    }
  }).on('dragEnd', function(item, event) {
    if (grid.getItems(0)[0] !== ghost) {
      grid.move(item, ghost); // Swap the item positions, putting the ghost back in front
    }
    window.localStorage.setItem('layout', gridToJSON()); // Autosaves the grid's items
  });

  var layout = window.localStorage.getItem('layout');
  if (layout) { // Automatically loads the last layout if applicable
    load(layout);
  } else {
    addExistingCard(ghostMarkup); // Adds the ghost card by default. This area could also be used for a "first-time message"
  }
}

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
    var itemTemplate =
      '<div class="item">' +
      '<div class="item-content">' +
      '<div class="card">' +
      '<p id="title">' + data[0] + '</p>' +
      '<p id="comment">' + data[1] + '</p>' +
      '<p id="code">' + data[2] + '</p>' +
      '</div>' +
      '</div>' +
      '</div>';

  } else { // Otherwise create a group card
    var itemTemplate =
      '<div class="item">' +
      '<div class="item-content">' +
      '<div class="card">' +
      '<p>' + data[0] + '</p>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
  window.localStorage.setItem('layout', gridToJSON()); // Saves the grid's items
}

function addExistingCard(cardDiv) { // Like addNewCard, but it accepts a string of the pre-written card class and creates a template using that
  var itemElem = document.createElement('div');
  var itemTemplate =
    '<div class="item">' +
    '<div class="item-content">' +
    cardDiv +
    '</div>' +
    '</div>';
  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
  if (cardDiv.includes("ghost")) { // Initialise the ghost card, if that's what the card in question is
    ghost = grid.getItems(0)[0];
  }
}

function gridToJSON() { // Returns all of the grid's item elements in a stringified format. Core component for saving
  var items = grid.getItems().map(item => item.getElement());
  var itemsToSave = [];
  items.forEach(function(item) {
    itemsToSave.push(item.firstElementChild.innerHTML);
  });
  return JSON.stringify(itemsToSave);
}

function load(layout) { // Loads cards that have already been created before
  var itemsToLoad = JSON.parse(layout);
  itemsToLoad.forEach(function(item) {
    addExistingCard(item);
  });
  window.localStorage.setItem('layout', gridToJSON()); // Saves tge grid's items
}

function toggleModal() { // Toggles the selected modal visibility and whether grid items can be dragged
  modal.classList.toggle("show-modal");
}


// The main part of the program
initialise();

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
  var file = new Blob([gridToJSON()], {
    type: 'application/octet-stream'
  });
  saveAs(file, "SieveSaveFile");
});

loadBtn.addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    grid.remove(grid.getItems(), {
      removeElements: true
    });
    load(contents);
  };
  reader.readAsText(file);

  window.localStorage.setItem('layout', gridToJSON());
}), false;

clearBtn.addEventListener('click', function(event) { // Removes all items, adds back the ghost, then saves the layout
  grid.remove(grid.getItems(), {
    removeElements: true
  });
  addExistingCard(ghostMarkup);
  window.localStorage.setItem('layout', gridToJSON()); // Saves the grid's items
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
