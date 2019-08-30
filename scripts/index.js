// Variables
var grid;
var dummyGrid; // An invisible grid used in group collapsing
var ghost; // Placeholder card used for adding other cards
var editable = false; // Boolean that specifies whether the cards can be modified or not
var collapseLock = false; // Stops the group collapse button's action from firing twice
var collapseDrag = false; // True if the group collapse was triggered by dragging and wasn't already active
var collapseSave = {}; // Used to record the active collapsed cards
var toggleEditBtn = document.querySelector('.toggleEditBtn');
var clearBtn = document.querySelector('.clearBtn');
var saveBtn = document.querySelector('.saveBtn');
var loadBtn = document.querySelector('.loadBtn');

// Modal variables
var modal; // Div element that gets set by every button that opens a modal
var firstClick; // Used to determine if the mouse is released in the same place as it was held down
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
      if (item === ghost || (e.target.matches("p") && editable)) return false;
      if (e.target.matches(".card-remove")) {
        deleteItems(item);
        return false;
      }
      if (e.target.matches(".group-collapse")) {
        if (!collapseLock) {
          toggleGroupCollapse(item, e.target);
        }
        collapseLock = !collapseLock;
        return false;
      }
      return Muuri.ItemDrag.defaultStartPredicate(item, e);
    }
  }).on('dragStart', function(item, event) {
    if (!(item._id in collapseSave)) {
      toggleGroupCollapse(item, event);
      collapseDrag = true;
    } else {
      collapseDrag = false;
    }
  }).on('dragEnd', function(item, event) {
    if (grid.getItems(0)[0] !== ghost) {
      grid.move(item, ghost); // Swap the item positions, putting the ghost back in front
    }
    if (collapseDrag) {
      toggleGroupCollapse(item, event);
    }
  });

  dummyGrid = new Muuri('.dummygrid'); // Invisible grid used to house regular cards that collapse in on groups

  // Adds in the ghost card by default
  var itemElem = document.createElement('div');
  var itemTemplate =
    '<div class="item">' +
    '<div class="item-content">' +
    '<div class="card" id="ghost" onclick="ghostAction();"><h1>+</h1></div>' +
    '</div>' +
    '</div>';
  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
  ghost = grid.getItems(0)[0];

  // Automatically loads the last layout if applicable
  var layout = window.localStorage.getItem('layout');
  if (layout) {
    load(layout);
  }

  regBtn.style.cursor = "default"; // Sets the cursor for the regular card toggle in the add card modal

  var modals = document.querySelectorAll(".modal"); // List of all modals
  var closeButtons = document.querySelectorAll(".close-button"); // List of all modal close buttons
  modals.forEach(function(mod) { // Enables the modals
    mod.style.display = "block";
  });
  closeButtons.forEach(function(closeButton) { // Adds an event listener to all the modal close buttons
    closeButton.addEventListener('click', toggleModal);
  });
}

function ghostAction() { // Change this to toggle visibility of two buttons. One will add a blank card, other will add a blank group
  modal = document.getElementById("newCardModal");
  toggleModal();
}

function addNewCard(data) { // Creates a HTML element based on the data and adds it to the grid
  var itemElem = document.createElement('div');
  var style = editable ? ' style="cursor:text;">' : '>'; // Set the cursor to 'text' if the edit toggle is active

  if (data.length == 3) { // If 3, create a regular card
    var itemTemplate =
      '<div class="item">' +
      '<div class="item-content">' +
      '<div class="card">' +
      '<p class="title" contenteditable="true"' + style + data[0] + '</p>' +
      '<p class="comment" contenteditable="true"' + style + data[1] + '</p>' +
      '<p class="code" contenteditable="true"' + style + data[2] + '</p>' +
      '<div class="card-remove">&#10005</div>' +
      '</div>' +
      '</div>' +
      '</div>';

  } else { // Otherwise create a group card
    var itemTemplate =
      '<div class="item">' +
      '<div class="item-content">' +
      '<div class="card">' +
      '<p class="group_title" contenteditable="true"' + style + data[0] + '</p>' +
      '<div class="card-remove">&#10005</div>' +
      '<div class="group-collapse">C</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
}

function toggleGroupCollapse(gridItem, eventTarget) {
  var items = allItems();
  var saveName = String(gridItem._id); // Assigns the save data to the grid card's id within the grid
  var itemsToLoad = collapseSave[saveName];

  try {
    if (itemsToLoad === undefined && eventTarget !== null) { // For collapsing a group
      var savedItems = [];
      for (var i = items.indexOf(gridItem) + 1; i < items.length; i++) {
        var content = items[i].getElement().firstElementChild.innerHTML;
        if (!content.includes("group_title")) { // If it's a regular card, save it
          savedItems.push(items[i]);
          grid.hide(items[i], {
            onFinish: function(hiddenItem) {
              grid.send(hiddenItem[0], dummyGrid, -1);
            }
          });
        } else { // End early if another group is found
          break;
        }
      }
      collapseSave[saveName] = savedItems; // Save the data

    } else { // For expanding a group
      var destinationIndex = items.indexOf(gridItem) + 2;
      itemsToLoad.forEach(function(item) {
        var dummyItems = dummyGrid.getItems();
        dummyGrid.send(item, grid, destinationIndex++);
      });
      grid.show(itemsToLoad);
      delete collapseSave[saveName]; // Delete the data
    }

    if (eventTarget.innerHTML === 'C') {
      eventTarget.innerHTML = 'E';
    } else {
      eventTarget.innerHTML = 'C';
    }

  } catch (e) {
    return;
  } finally {
    grid.synchronize();
  }
}

function undoGroupCollapse() { // Goes through every item and undoes any collapsed grids. Necessary for saving
  allItems().forEach(function(item) {
    if (item.getElement().firstElementChild.innerHTML.includes("group-collapse")) {
      toggleGroupCollapse(item, null);
    }
  });
}

function saveItems() { // Returns all of the grid's item data in a readable format. Core component for saving
  undoGroupCollapse();
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
    addNewCard(item);
  });
}

function deleteItems(items, selectedGrid = grid) {
  selectedGrid.hide(items, {
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

function toggleGroupRegular() {
  regBtn.disabled = !regBtn.disabled;
  groupBtn.disabled = !groupBtn.disabled;
  templateGroupTitle.hidden = !templateGroupTitle.hidden;
  templateTitle.hidden = !templateTitle.hidden;
  templateComment.hidden = !templateComment.hidden;
  templateCode.hidden = !templateCode.hidden;
  if (regBtn.disabled) {
    regBtn.style.cursor = "default";
    groupBtn.style.cursor = "pointer";
  } else {
    regBtn.style.cursor = "pointer";
    groupBtn.style.cursor = "default";
  }
}


// Event listeners
initialise();

window.addEventListener("beforeunload", function(event) { // Necessary things to do before closing
  undoGroupCollapse();
  window.localStorage.setItem('layout', saveItems()); // Autosaves the grid's layout
});
window.addEventListener('mousedown', function(event) {
  firstClick = event.target;
});
window.addEventListener('mouseup', function(event) {
  if (event.target === modal && event.target === firstClick) {
    toggleModal();
  }
});

toggleEditBtn.addEventListener('click', function(event) {
  var pStyle;
  var allPElements = document.getElementsByTagName('p');
  if (editable) {
    toggleEditBtn.style.backgroundColor = "white";
    pStyle = "inherit";
  } else {
    toggleEditBtn.style.backgroundColor = "lightblue";
    pStyle = "text";
  }
  for (var i = 0; i < allPElements.length; i++) {
    allPElements[i].style.cursor = pStyle;
  }
  editable = !editable;
});

clearBtn.addEventListener('click', function(event) {
  modal = document.getElementById("clearConfirmModal");
  toggleModal();
});
clearYesBtn.addEventListener('click', function(event) { // Removes all items except the ghost, then removes everything from memory
  toggleModal();
  deleteItems(allItems());
  deleteItems(dummyGrid.getItems(), dummyGrid);
  window.localStorage.clear();
});
clearNoBtn.addEventListener('click', function(event) {
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

regBtn.addEventListener('click', toggleGroupRegular);
groupBtn.addEventListener('click', toggleGroupRegular);
addCardBtn.addEventListener('click', function(event) {
  if (groupBtn.disabled) { // If "group" is selected in the modal, generate a group card
    var group_title = templateGroupTitle.textContent;
    if (templateGroupTitle === "") group_title = "Group Title";
    addNewCard([group_title]);

  } else { // Otherwise generate a standard card
    var title = templateTitle.textContent;
    var comment = templateComment.textContent;
    var code = templateCode.textContent;
    if (title === "") title = "Title";
    if (comment === "") comment = "Comment";
    if (code === "") code = "Code";
    addNewCard([title, comment, code]);
  }
});
