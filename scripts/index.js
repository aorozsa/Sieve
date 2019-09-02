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
var templateCard = document.getElementById('templateCard');
var regBtn = document.querySelector('.regBtn');
var groupBtn = document.querySelector('.groupBtn');
var regBtn = document.querySelector('.regBtn');
var pickColourBtn = document.querySelector('.pickColourBtn');
var colourPicker = document.querySelector('.colourPicker');
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

  }).on('dragStart', function(item, e) {
    collapseDrag = content(item).includes('class="group_title"') && !(item._id in collapseSave);
    if (collapseDrag) {
      toggleGroupCollapse(item, e);
    }

  }).on('dragEnd', function(item, event) {
    if (grid.getItems(0)[0] !== ghost) {
      grid.move(item, ghost); // Swap the item positions, putting the ghost back in front
    }
    if (collapseDrag) {
      toggleGroupCollapse(item, event);
    }
    changeCardColour(item);

  }).on('add', function(items) {
    items.forEach(function(item) {
      changeCardColour(item);
    });

  }).on('remove', function(items, indices) {
    if (items.length == 1) {
      if (content(items[0]).includes('class="group_title"')) {
        var items = grid.getItems();
        changeCardColour(items[indices[0] - 1], true);
      }
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
  addItems(itemElem.firstChild);
  ghost = grid.getItems(0)[0];

  // Automatically loads the last layout if applicable
  var layout = window.localStorage.getItem('layout');
  if (layout) {
    load(layout);
  }

  var modals = document.querySelectorAll(".modal"); // List of all modals
  var closeButtons = document.querySelectorAll(".close-button"); // List of all modal close buttons
  modals.forEach(function(modal) { // Enables the modals
    modal.style.display = "block";
  });
  closeButtons.forEach(function(closeButton) { // Adds an event listener to all the modal close buttons
    closeButton.addEventListener('click', toggleModal);
  });
}

function content(item) { // Returns an item's "card" class
  return item.getElement().firstElementChild.innerHTML;
}

function object(item) { // Return's the HTML element of an item's "card" class. Utilised in changing styles
  return item.getElement().querySelector('.card');
}

function allItems() { // Returns all grid items except the ghost
  var items = grid.getItems();
  items.shift()
  return items;
}

function addItems(itemsToAdd) { // Adds a single card in a fancy way
  grid.add(itemsToAdd, {
    layout: function(i) {
      var items = grid.getItems();
      if (itemsToAdd.length === undefined) items = items[items.length - 1];
      grid.hide(items, {
        instant: true,
        onFinish: function(hiddenItems) {
          grid.show(hiddenItems);
        }
      });
    }
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

function ghostAction() { // Activates when the ghost card is clicked
  modal = document.getElementById("newCardModal");
  changeTemplateColour(!groupBtn.disabled);
  toggleModal();
}

function changeTemplateColour(setToLastItem) { // Changes the template's border colour. Based either on the last item or the colour picker
  if (setToLastItem) {
    var lastItem = grid.getItems();
    templateCard.style.borderColor = object(lastItem[lastItem.length - 1]).style.borderColor;
  } else {
    templateCard.style.borderColor = colourPicker.value;
  }
}

function changeCardColour(card, deleteGroup = false) { // Changes the card's border colour based on the group it's in. Only for regular cards
  var items = grid.getItems();
  var startIndex = items.indexOf(card);
  var cardElement = object(card);

  if (content(card).includes('class="comment"') && !deleteGroup) {
    cardElement.style.borderColor = object(items[startIndex - 1]).style.borderColor;

  } else { // Updates ungrouped cards' colours if a group is dragged in front of the ungrouped cards. Also turns newly ungrouped cards black
    for (var i = startIndex + 1; i < items.length; i++) {
      if (content(items[i]).includes('class="comment"')) {
        object(items[i]).style.borderColor = cardElement.style.borderColor;
      } else {
        return;
      }
    }
  }
}

function addNewCard(data, returnElement = false) { // Creates a HTML element based on the data and adds it to the grid
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
      '<div class="card" style="border-color:' + data[1] + '">' +
      '<p class="group_title" contenteditable="true"' + style + data[0] + '</p>' +
      '<div class="card-remove">&#10005</div>' +
      '<div class="group-collapse">C</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }

  itemElem.innerHTML = itemTemplate;
  if (returnElement) {
    return itemElem.firstChild;
  } else {
    addItems(itemElem.firstChild);
  }
}

function toggleGroupCollapse(gridItem, eventTarget) {
  var items = allItems();
  var saveName = String(gridItem._id); // Assigns the save data to the grid card's id within the grid
  var itemsToLoad = collapseSave[saveName];

  try {
    if (itemsToLoad === undefined && eventTarget !== null) { // For collapsing a group
      var savedItems = [];
      for (var i = items.indexOf(gridItem) + 1; i < items.length; i++) {
        if (!content(items[i]).includes('class="group_title"')) { // If it's a regular card, save it
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
    if (content(item).includes("group-collapse")) {
      toggleGroupCollapse(item, null);
    }
  });
}

function saveItems() { // Returns all of the grid's item data in a readable format. Core component for saving
  undoGroupCollapse();
  var items = allItems();
  var itemsToSave = [];
  items.forEach(function(item) {
    item = content(item);
    var itemData = item.match(/<p.*?<\/p>/g);
    var dataToSave = [];
    itemData.forEach(function(elem) {
      elem = elem.split('">').pop().split('</p>')[0];
      dataToSave.push(elem);
    });

    if (dataToSave.length < 3) {
      var groupStyle = item.match(/border-color:.*?"/g);
      groupStyle = groupStyle[0].split(':').pop().split('"')[0];
      dataToSave.push(groupStyle);
    }
    itemsToSave.push(dataToSave);
  });
  return JSON.stringify(itemsToSave);
}

function load(layout) { // Loads cards that have already been created before
  var itemsToLoad = JSON.parse(layout);
  for (var i = 0; i < itemsToLoad.length; i++) {
    itemsToLoad[i] = addNewCard(itemsToLoad[i], true);
  }
  addItems(itemsToLoad);
}

function toggleModal() { // Toggles the currently selected modal's visibility
  modal.classList.toggle("show-modal");
}

function toggleGroupRegular() {
  regBtn.disabled = !regBtn.disabled;
  groupBtn.disabled = !groupBtn.disabled;
  colourPicker.disabled = !colourPicker.disabled;
  templateGroupTitle.hidden = !templateGroupTitle.hidden;
  templateTitle.hidden = !templateTitle.hidden;
  templateComment.hidden = !templateComment.hidden;
  templateCode.hidden = !templateCode.hidden;
  if (regBtn.disabled) {
    groupBtn.style.cursor = "pointer";
    regBtn.style.cursor = "default";
  } else {
    groupBtn.style.cursor = "default";
    regBtn.style.cursor = "pointer";
  }
  pickColourBtn.classList.toggle("pickColourBtnDisabled");
  changeTemplateColour(!groupBtn.disabled);
}


// Event listeners
initialise();

window.addEventListener("beforeunload", function(e) { // Necessary things to do before closing
  undoGroupCollapse();
  window.localStorage.setItem('layout', saveItems()); // Autosaves the grid's layout
});
window.addEventListener('mousedown', function(e) {
  firstClick = e.target;
});
window.addEventListener('mouseup', function(e) {
  if (e.target === modal && e.target === firstClick) {
    toggleModal();
  }
});

toggleEditBtn.addEventListener('click', function(e) {
  var pStyle;
  var allPElements = document.getElementsByTagName('p');

  if (editable) {
    toggleEditBtn.style.backgroundColor = "white";
    pStyle = "inherit";
  } else {
    toggleEditBtn.style.backgroundColor = "lightblue";
    pStyle = "text";
  }
  for (var i = 0; i < allPElements.length - 4; i++) { // Excludes the last 4 elements, which are the template inputs
    allPElements[i].style.cursor = pStyle;
  }
  editable = !editable;
});

clearBtn.addEventListener('click', function(e) {
  modal = document.getElementById("clearConfirmModal");
  toggleModal();
});
clearYesBtn.addEventListener('click', function(e) { // Removes all items except the ghost, then removes everything from memory
  toggleModal();
  deleteItems(allItems());
  deleteItems(dummyGrid.getItems(), dummyGrid);
  window.localStorage.clear();
});
clearNoBtn.addEventListener('click', function(e) {
  toggleModal();
});

saveBtn.addEventListener('click', function(e) {
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
addCardBtn.addEventListener('click', function(e) {
  if (groupBtn.disabled) { // If "group" is selected in the modal, generate a group card
    var group_title = templateGroupTitle.textContent;
    if (templateGroupTitle === "") group_title = "Group Title";
    addNewCard([group_title, templateCard.style.borderColor]);

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
