// Variables
var grid;
var dummyGrid; // An invisible grid used in group collapsing
var ghost; // Placeholder card used for adding other cards
var editable = false; // Boolean that specifies whether the cards can be modified or not
var collapseLock = false; // Stops the group collapse button's action from firing twice
var collapseDrag = false; // True if the group collapse was triggered by dragging and wasn't already active
var collapseSave = {}; // Used to record the active collapsed cards
var dragStartIndex; // Used to undo certain group movements in grid.on('dragEnd')
var toggleEditBtn = document.querySelector('.toggleEditBtn');
var clearBtn = document.querySelector('.clearBtn');
var saveBtn = document.querySelector('.saveBtn');
var loadBtn = document.querySelector('.loadBtn');
var exportBtn = document.querySelector('.exportBtn');

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
var templateHeading = document.getElementById('templateHeading');
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
      createElement: function(item) { // This guarantees that the placeholder's border is dashed and is 4 pixels thick
        var itemObject = object(item);
        var defaultBorder = itemObject.style.borderStyle;
        var defaultBorderWidth = itemObject.style.borderWidth;
        itemObject.style.borderStyle = "dashed";
        itemObject.style.borderWidth = "4px";
        var placeholder = item.getElement().cloneNode(true);
        itemObject.style.borderStyle = defaultBorder;
        itemObject.style.borderWidth = defaultBorderWidth;
        return placeholder;
      }
    },
    dragStartPredicate: function(item, e) { // Items are draggable if true is returned
      if (item === ghost) return false;
      if (editable && e.target.matches("p") && !e.target.matches(".heading") && isRegular(item)) return false;
      if (e.target.matches(".card-remove")) {
        undoGroupCollapse(item);
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
    dragStartIndex = grid.getItems().indexOf(item);
    collapseDrag = isGroup(item) && !(item._id in collapseSave);
    if (collapseDrag) {
      toggleGroupCollapse(item, e);
    } else if (isGroup(item) && (collapseSave[item.id] === undefined || collapseSave[item.id].length > 0)) {
      changeBorder(object(item), "8px double");
    }

  }).on('dragEnd', function(item, event) {
    var delay = 0;
    if (grid.getItems(0)[0] !== ghost) {
      grid.move(item, ghost); // Swap the item positions, putting the ghost back in front
    }

    if (isGroup(item)) {
      var items = grid.getItems();
      var i = items.indexOf(item);
      // If the item isn't the last in the list, the item in front isn't a group, or the item behind isn't the ghost, undo the movement and set a delay
      if (!(i === items.length - 1 || isGroup(items[i + 1]) || object(items[i - 1]).style.borderColor == "")) {
        grid.move(item, dragStartIndex);
        delay = 300; // This has to be equal to the grid's dragReleaseDuration for the best looks. The default is 300
      }
    }

    setTimeout(function() {
      if (collapseDrag) {
        toggleGroupCollapse(item, event);
      }
    }, delay);
    changeCardAttributes(item);

  }).on('add', function(items) {
    items.forEach(function(item) {
      changeCardAttributes(item);
    });

  }).on('remove', function(items, indices) {
    if (items.length == 1) {
      if (isGroup(items[0])) {
        items = grid.getItems();
        changeCardAttributes(items[indices[0] - 1], true);
      }
    }
  });

  dummyGrid = new Muuri('.dummyGrid', { // Grid used to house regular cards that collapse in on groups
    dragEnabled: false
  });

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

  // Adds event listeners to the template text elements
  addListenersToPElements(document.getElementsByTagName('p'));

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

function isGroup(item) {
  return content(item).includes('class="group_title"');
}

function isRegular(item) {
  return content(item).includes('class="comment"');
}

function allItems() { // Returns all grid items except the ghost
  var items = grid.getItems();
  items.shift()
  return items;
}

function addItems(itemsToAdd, fileLoad = false) { // Adds cards with an animation
  grid.add(itemsToAdd, {
    layout: function(i) {
      var items = grid.getItems();
      if (fileLoad) items.shift(); // Omits the first item
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

function deleteItems(items, selectedGrid = grid) { // Deletes items with an animation
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
  var items = grid.getItems();
  try {
    templateHeading.textContent = items[items.length - 1].getElement().getElementsByTagName('p')[0].textContent;
  } catch (e) {
    templateHeading.textContent = "UNGROUPED";
  }
  changeTemplateColour(!groupBtn.disabled);
  toggleModal();
}

function toggleModal() { // Toggles the currently selected modal's visibility
  modal.classList.toggle("show-modal");
}

function changeTemplateColour(setToLastItem) { // Changes the template's border colour. Based either on the last item or the colour picker
  if (setToLastItem) {
    var lastItem = grid.getItems();
    templateCard.style.borderColor = object(lastItem[lastItem.length - 1]).style.borderColor;
  } else {
    templateCard.style.borderColor = colourPicker.value;
  }
}

function changeCardAttributes(card, deleteGroup = false) { // Changes the card's border colour based on the group it's in. Also changes regular cards' headers
  var items = grid.getItems();
  var startIndex = items.indexOf(card);
  var cardElement = object(card);

  function changeHeader(item) {
    var headingElem = item.getElement().getElementsByTagName('p')[0];
    try {
      headingElem.textContent = items[items.indexOf(item) - 1].getElement().getElementsByTagName('p')[0].textContent;
    } catch (e) {
      headingElem.textContent = "UNGROUPED";
    }
  }

  if (isRegular(card) && !deleteGroup) {
    cardElement.style.borderColor = object(items[startIndex - 1]).style.borderColor;
    changeHeader(card);

  } else { // Updates ungrouped cards' colours if a group is dragged in front of the ungrouped cards. Also turns newly ungrouped cards black
    for (var i = startIndex + 1; i < items.length; i++) {
      if (isRegular(items[i])) {
        object(items[i]).style.borderColor = cardElement.style.borderColor;
        changeHeader(items[i]);
      } else {
        return;
      }
    }
  }
}

function addListenersToPElements(elements) {
  function swap(elem) {
    if (elem.textContent.length > 0) {
      elem.style.borderStyle = "none";
    } else {
      elem.style.border = "1px solid #98B6FF";
    }
  }
  for (var i = 0; i < elements.length; i++) {
    swap(elements[i]); // Once on initialisation
    elements[i].addEventListener('blur', function(e) { // Happens whenever the textbox loses focus
      swap(this);
    });
  }
}

function addNewCard(data, returnElement = false) { // Creates a HTML element based on the data and adds it to the grid
  var itemElem = document.createElement('div');

  if (data.length == 4) { // If 4, create a regular card
    var style = editable ? ' style="cursor:text;">' : '>'; // Set the cursor to 'text' if the edit toggle is active
    var itemTemplate =
      '<div class="item">' +
      '<div class="item-content">' +
      '<div class="card">' +
      '<p class="heading" contenteditable="true">' + data[0] + '</p>' +
      '<p class="title" contenteditable="true"' + style + data[1] + '</p>' +
      '<p class="comment" contenteditable="true"' + style + data[2] + '</p>' +
      '<p class="code" contenteditable="true"' + style + data[3] + '</p>' +
      '<div class="card-remove">&#10005</div>' +
      '</div>' +
      '</div>' +
      '</div>';

  } else { // Otherwise create a group card
    var itemTemplate =
      '<div class="item">' +
      '<div class="item-content">' +
      '<div class="card" style="border-color:' + data[1] + ';">' +
      '<p class="group_title" contenteditable="true">' + data[0] + '</p>' +
      '<div class="card-remove">&#10005</div>' +
      '<div class="group-collapse">C</div>' +
      '</div>' +
      '</div>' +
      '</div>';
  }
  itemElem.innerHTML = itemTemplate;
  addListenersToPElements(itemElem.getElementsByTagName('p'));

  if (returnElement) {
    return itemElem.firstChild;
  } else {
    addItems(itemElem.firstChild);
  }
}

function changeBorder(itemElement, style) {
  var colour = itemElement.style.borderColor;
  itemElement.style.borderBottom = style;
  itemElement.style.borderRight = style;
  itemElement.style.borderColor = colour;
}

function toggleGroupCollapse(gridItem, eventTarget) {
  var items = allItems();
  var itemElement = object(gridItem);
  var saveName = gridItem._id; // Assigns the save data to the grid card's id within the grid
  var itemsToLoad = collapseSave[saveName];

  try {
    if (itemsToLoad === undefined && eventTarget !== undefined) { // For collapsing a group
      var savedItems = [];
      for (var i = items.indexOf(gridItem) + 1; i < items.length; i++) {
        if (!isGroup(items[i])) { // If it's a regular card, save it
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

      if (savedItems.length > 0) {
        changeBorder(itemElement, "8px double");
      }
      eventTarget.innerHTML = 'E';

    } else { // For expanding a group
      var destinationIndex = items.indexOf(gridItem) + 2;
      itemsToLoad.forEach(function(item) {
        dummyGrid.send(item, grid, destinationIndex++);
      });
      grid.show(itemsToLoad);
      delete collapseSave[saveName]; // Delete the data
      changeBorder(itemElement, "4px solid")
      eventTarget.innerHTML = 'C';
    }

  } catch (e) {
    return;
  } finally {
    grid.synchronize();
  }
}

function undoGroupCollapse(item) { // Goes through every item and undoes any collapsed grids. Necessary for saving
  if (item === undefined) {
    allItems().forEach(function(item) {
      if (isGroup(item)) {
        toggleGroupCollapse(item);
      }
    });
  } else {
    toggleGroupCollapse(item); // For a single item instead
  }
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

    if (dataToSave.length < 4) {
      var groupStyle = item.match(/border-color:.*?;/g);
      groupStyle = groupStyle[0].split(':').pop().split(';')[0];
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
  addItems(itemsToLoad, true);
}

function toggleGroupRegular() {
  regBtn.disabled = !regBtn.disabled;
  groupBtn.disabled = !groupBtn.disabled;
  colourPicker.disabled = !colourPicker.disabled;
  templateGroupTitle.hidden = !templateGroupTitle.hidden;
  templateHeading.hidden = !templateHeading.hidden;
  templateTitle.hidden = !templateTitle.hidden;
  templateComment.hidden = !templateComment.hidden;
  templateCode.hidden = !templateCode.hidden;
  if (regBtn.disabled) {
    groupBtn.style.cursor = "pointer";
    regBtn.style.cursor = "default";
    var items = grid.getItems();
    try {
      templateHeading.textContent = items[items.length - 1].getElement().getElementsByTagName('p')[0].textContent;
    } catch (e) {
      templateHeading.textContent = "UNGROUPED";
    }
  } else {
    groupBtn.style.cursor = "default";
    regBtn.style.cursor = "pointer";
  }
  pickColourBtn.classList.toggle("pickColourBtnDisabled");
  changeTemplateColour(!groupBtn.disabled);
}

function checkText(element) { // Returns true if the element contains text. Otherwise it makes it flash, then returns false
  if (element.textContent === "") {
    for (var delay = 0; delay <= 600; delay += 200) {
      setTimeout(function() {
        if (templateCard.style.borderColor === "") {
          templateCard.style.borderColor = "black";
        }
        if (element.style.backgroundColor === templateCard.style.borderColor) {
          element.style.backgroundColor = null;
        } else {
          element.style.backgroundColor = templateCard.style.borderColor;
        }
      }, delay);
    }
    return false;
  }
  return true;
}

function s2ab(s) { // Used in excel exporting
  var buf = new ArrayBuffer(s.length); // Convert s to ArrayBuffer
  var view = new Uint8Array(buf);  // Create Uint8Array as viewer
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; // Convert to octet
  return buf;
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
    if (allPElements[i].contentEditable == 'true') { // Only activate on elements that can be edited
      allPElements[i].style.cursor = pStyle;
    }
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
clearNoBtn.addEventListener('click', toggleModal);

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
    grid.hide(allItems(), { // Deletes the items with an animation before loading in new items
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
});

exportBtn.addEventListener('click', function(e) {
  var wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Thematic Analysis Export"
  };
  wb.SheetNames.push("First Sheet");
  var ws_data = JSON.parse(saveItems());
  console.log(ws_data);
  undoGroupCollapse();
  var items = allItems();
  var interviews = [];
  items.forEach(function(item) {
    item = content(item);
    var itemData = item.match(/<p.*?<\/p>/g);
    var dataToSave = [];
    itemData.forEach(function(elem) {
      elem = elem.split('">').pop().split('</p>')[0].toString();
      dataToSave.push(elem);
      console.log(dataToSave);
    });
    if (dataToSave.length == 3) {
      if (typeof interviews[dataToSave[2].charAt(10)] === 'undefined') {
        // does not exist
        interviews[dataToSave[2].charAt(10)] = [['Interview: ' + dataToSave[2].charAt(10)]];
        var headers = ['Quote Title', 'Quote', 'Code'];
        interviews[dataToSave[2].charAt(10)].push(headers);
      }
      interviews[dataToSave[2].charAt(10)].push(dataToSave);
    }
    // if (dataToSave.length < 3) {
    //   var groupStyle = item.match(/border-color:.*?;/g);
    //   groupStyle = groupStyle[0].split(':').pop().split(';')[0];
    //   dataToSave.push(groupStyle);
    // }
    // interviews.push(dataToSave);

  });
  rows = [];
  console.log(interviews[1]);
  for (i = 0; i < interviews.length; i++) {

    if (typeof interviews[i] == 'undefined') {
      console.log(typeof interviews[i] + i);
      // does not exist
    } else {
      console.log(interviews[i] + i);
      for (j = 0; j < interviews[i].length; j++) {
        rows.push(interviews[i][j]);
      }
    }
  }
  wb.Sheets["First Sheet"] = XLSX.utils.aoa_to_sheet(rows);
  // var cell_address = {c:0, r:0};
  // const cell_ref = XLSX.utils.encode_cell(cell_address);
  // wb.Sheets[wb.SheetNames[0]] = {};
  // var ws = wb.Sheets[wb.SheetNames[0]];
  // console.log(wb);
  // var cell = {};
  // ws["!ref"] = cell_ref;
  // ws[cell_ref] = cell;
  // ws[cell_ref].v = 100;
  var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), 'ThematicDataExport.xlsx');
});

regBtn.addEventListener('click', toggleGroupRegular);
groupBtn.addEventListener('click', toggleGroupRegular);
addCardBtn.addEventListener('click', function(e) {
  if (groupBtn.disabled) { // If "group" is selected in the modal, generate a group card
    if (!checkText(templateGroupTitle)) return;
    addNewCard([templateGroupTitle.textContent, templateCard.style.borderColor]);

  } else { // Otherwise generate a standard card
    var cont = checkText(templateTitle);
    cont = checkText(templateComment) && cont;
    cont = checkText(templateCode) && cont;
    if (!cont) return;
    addNewCard([templateHeading.textContent, templateTitle.textContent, templateComment.textContent, templateCode.textContent]);
  }
});