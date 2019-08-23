// Variables
var grid;
var ghost; // "Card" used for adding other cards.
var editable = false; // Boolean that specifies whether the card can be modified or not.
var toggleEditBtn = document.querySelector('.toggleEditBtn');
var clearBtn = document.querySelector('.clearBtn');
var saveBtn = document.querySelector('.saveBtn');
var loadBtn = document.querySelector('.loadBtn');

// Modal variables
var group; // Boolean specifying whether the card to add is a group card or not
var modal; // Div element that gets set by every button that opens a modal
var regBtn = document.querySelector('.regBtn');
var groupBtn = document.querySelector('.groupBtn');
var addCardBtn = document.querySelector('.addCardBtn');
var templateGroupTitle = document.getElementById('templateGroupTitle');
var templateTitle = document.getElementById('templateTitle');
var templateComment = document.getElementById('templateComment');
var templateCode = document.getElementById('templateCode');
var clearYesBtn = document.getElementById('clearYesBtn');
var clearNoBtn = document.getElementById('clearNoBtn');


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
      if (e.target.matches("p") && editable) return false; // Disables dragging on card text when specified.
      if (e.target.matches("label")) return false; // Disables dragging on buttons.
      return Muuri.ItemDrag.defaultStartPredicate(item, e);
    }
  }).on('dragEnd', function(item, event) {
    if (grid.getItems(0)[0] !== ghost) {
      grid.move(item, ghost); // Swap the item positions, putting the ghost back in front
    }
    window.localStorage.setItem('layout', saveItems()); // Autosaves the grid's items
  });

  // Adds in the ghost card by default
  var itemElem = document.createElement('div');
  var itemTemplate =
    '<div class="item">'+
    '<div class="item-content">' +
    '<div class="card" id="ghost" onclick="ghostAction();"><h1>+</h1></div>' +
    '</div>'+
    '</div>';
  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
  ghost = grid.getItems(0)[0];

  // Automatically loads the last layout if applicable
  var layout = window.localStorage.getItem('layout');
  if (layout) {
    load(layout);
  }

  regBtn.style.cursor = "default"; // Sets the cursor for the regular card toggle in the add card modal.

  var modals = document.querySelectorAll(".modal"); // List of all modals
  var closeButtons = document.querySelectorAll(".close-button"); // List of all modal close buttons

  modals.forEach(function(mod) { // Enables the modals
    mod.style.display = "block";
  });
  closeButtons.forEach(function(closeButton) { // Adds an event listener to all the modal close buttons
    closeButton.addEventListener('click', toggleModal);
  });
}

function ghostAction() { // Change this to toggle visibility of two buttons. One will add a blank card, other will add a blank group.
  modal = document.getElementById("newCardModal");
  toggleModal();
}

function addNewCard(data, loading = false) { // Creates a HTML element based on the data and adds it to the grid
  var itemElem = document.createElement('div');
  if (data.length == 3) { // If 3, create a regular card
    var itemTemplate =
      '<div class="item">' +
      '<div class="item-content">' +
      '<div class="card">' +
      '<p class="title" contenteditable="true">' + data[0] + '</p>' +
      '<p class="comment" contenteditable="true">' + data[1] + '</p>' +
      '<p class="code" contenteditable="true">' + data[2] + '</p>' +
      '</div>' +
      '</div>' +
      '</div>';

  } else { // Otherwise create a group card
    var itemTemplate =
      '<div class="item">' +
      '<div class="item-content">' +
      '<div class="card">' +
      '<p class="group_title" contenteditable="true">' + data[0] + '</p>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
  if (!loading) { // Saves the grid's items when adding just one card. Would seriously bottleneck loading otherwise.
    window.localStorage.setItem('layout', saveItems());
  }
}

function saveItems() { // Returns all of the grid's item data in a readable format. Core component for saving
  var items = allItems().map(item => item.getElement());
  var itemsToSave = [];
  items.forEach(function(item) {
    item = JSON.stringify(item.firstElementChild.innerHTML);
    var itemData = item.match(/<p.*?<\/p>/g);
    var dataToSave = [];
    itemData.forEach(function(elem) {
      elem = elem.split('">').pop().split('</p>')[0];
      dataToSave.push(elem);
    });
    itemsToSave.push(dataToSave);
  });
  return JSON.stringify(itemsToSave);
}

function load(layout) { // Loads cards that have already been created before
  var itemsToLoad = JSON.parse(layout);
  itemsToLoad.forEach(function(item) {
    addNewCard(item, true);
  });
  window.localStorage.setItem('layout', saveItems()); // Saves the grid's items
}

function deleteItems(items) {
  grid.hide(items, {
    onFinish: function(hiddenItems) {
      grid.remove(hiddenItems, {
        removeElements: true
      });
    }
  });
}

function allItems() { // Returns all items except the ghost
  var items = grid.getItems();
  items.shift()
  return items;
}

function toggleModal() { // Toggles the currently selected modal's visibility
  modal.classList.toggle("show-modal");
}


// Event listeners
initialise();

window.addEventListener('click', function(event) {
  if (event.target === modal) {
    toggleModal();
  }
});

toggleEditBtn.addEventListener('click', function(event) { // Removes all items except the ghost, then removes the autosaved grid data.
  if (editable) {
    editable = false;
    toggleEditBtn.style.border = "2px outset lightgray";
    toggleEditBtn.style.backgroundColor = "white";
  } else {
    editable = true;
    toggleEditBtn.style.border = "2px inset lightgray";
    toggleEditBtn.style.backgroundColor = "lightblue";
  }
});

clearBtn.addEventListener('click', function(event) { // Removes all items except the ghost, then removes the autosaved grid data.
  modal = document.getElementById("clearConfirmModal");
  toggleModal();
});
clearYesBtn.addEventListener('click', function(event) { // Removes all items except the ghost, then removes the autosaved grid data.
  toggleModal();
  deleteItems(allItems());
  window.localStorage.removeItem('layout'); // Removes the layout from memory.
});
clearNoBtn.addEventListener('click', function(event) { // Removes all items except the ghost, then removes the autosaved grid data.
  toggleModal();
});

saveBtn.addEventListener('click', function(event) {
  var file = new Blob([saveItems()], {
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
    grid.hide(allItems(), { // Deletes the items in a fancy way before loading in new items
      onFinish: function(hiddenItems) {
        grid.remove(hiddenItems, {
          removeElements: true
        });
        load(contents);
        document.getElementById("load").reset();
      }
    });
  };
  reader.readAsText(file);
}), false;

regBtn.addEventListener('click', function(event) {
  group = false;
  regBtn.disabled = true;
  groupBtn.disabled = false;
  regBtn.style.cursor = "default";
  groupBtn.style.cursor = "pointer";
});
groupBtn.addEventListener('click', function(event) {
  group = true;
  regBtn.disabled = false;
  groupBtn.disabled = true;
  regBtn.style.cursor = "pointer";
  groupBtn.style.cursor = "default";
});
// Sends the signal to add a card.
addCardBtn.addEventListener('click', function(event) {
  if (group) { // If "group" is selected in the modal, generate a group
    var gt = templateGroupTitle.textContent;
    if (group_title.text === "") gt = "Group Title";
    addNewCard([gt]);

  } else { // Otherwise generate a standard card
    var t = templateTitle.textContent;
    var c = templateComment.textContent;
    var cod = templateCode.textContent;
    if (t === "") t = "Title";
    if (c === "") c = "Comment";
    if (cod === "") cod = "Code";
    addNewCard([t, c, cod]);
  }
});
