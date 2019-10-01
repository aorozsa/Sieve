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
var projectTitle = document.getElementById('projectTitle');
var slider = document.querySelector(".slider");

// Modal variables
var modal; // Div element that gets set by every button that opens a modal
var firstClick; // Used to determine if the mouse is released in the same place as it was held down
var titleYesBtn = document.getElementById('titleYesBtn');
var titleNoBtn = document.getElementById('titleNoBtn');
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
    changeCardBorder(item);

  }).on('add', function(items) {
    items.forEach(function(item) {
      changeCardBorder(item);
    });

  }).on('remove', function(items, indices) {
    if (items.length == 1) {
      if (isGroup(items[0])) {
        items = grid.getItems();
        changeCardBorder(items[indices[0] - 1], true);
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

  var modals = document.querySelectorAll(".modal"); // List of all modals
  var closeButtons = document.querySelectorAll(".close-button"); // List of all modal close buttons
  modals.forEach(function(modal) { // Enables the modals
    modal.style.display = "block";
  });
  closeButtons.forEach(function(closeButton) { // Adds an event listener to all the modal close buttons
    closeButton.addEventListener('click', toggleModal);
  });

  // Automatically loads the last layout if applicable. Otherwise promt the user to input a
  var layout = window.localStorage.getItem('layout');
  if (layout && layout !== '[""]') {
    load(layout);
    projectTitle.style.zIndex = 0;
  } else {
    setTimeout(queryProjectTitle, 0); // Makes the modal appear with a smooth animation instead of instantly
  }
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
  return content(item).includes('class="heading"');
}

function allItems() { // Returns all grid items except the ghost
  var items = grid.getItems();
  items.shift()
  return items;
}

function queryProjectTitle() {
  modal = document.getElementById("queryProjectTitle");
  projectTitle.disabled = false;
  projectTitle.style.zIndex = 10;
  projectTitle.value = "";
  toggleModal();
  projectTitle.focus();
}

function checkProjectTitle() {
  if (checkText(projectTitle)) {
    toggleModal();
    modal = document.getElementById("confirmProjectTitle");
    toggleModal();
    projectTitle.disabled = true;
  } else {
    projectTitle.focus();
  }
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
  templateHeading.value = projectTitle.value;
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

function changeCardBorder(card, deleteGroup = false) { // Changes the card's border colour based on the group it's in. Also changes regular cards' headers
  var items = grid.getItems();
  var startIndex = items.indexOf(card);
  var cardElement = object(card);

  if (isRegular(card) && !deleteGroup) {
    cardElement.style.borderColor = object(items[startIndex - 1]).style.borderColor;

  } else { // Updates ungrouped cards' colours if a group is dragged in front of the ungrouped cards. Also turns newly ungrouped cards black
    for (var i = startIndex + 1; i < items.length; i++) {
      if (isRegular(items[i])) {
        object(items[i]).style.borderColor = cardElement.style.borderColor;
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
  function caratToEnd(elem) { // Changing the text of a field sets the carat to the start. This sets it to the end
    elem.focus();
    if (typeof window.getSelection != "undefined"
      && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(elem);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (typeof document.body.createTextRange != "undefined") {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(elem);
      textRange.collapse(false);
      textRange.select();
    }
  }

  for (var i = 0; i < elements.length; i++) {
    if (elements[i].className === "code") {
      elements[i].addEventListener('keyup', function(e) {
        if (!checkText(this)) {
          this.innerHTML = "Interview:&nbsp;";
          caratToEnd(this);
        }
      });
      elements[i].addEventListener('focus', function(e) {
        caratToEnd(this);
      });

    } else {
      swap(elements[i]); // Once on initialisation
      elements[i].addEventListener('blur', function(e) { // Happens whenever the textbox loses focus
        swap(this);
      });
    }
  }
}

function addNewCard(data, returnElement = false) { // Creates a HTML element based on the data and adds it to the grid
  var itemElem = document.createElement('div');

  if (data.length == 3) { // If 4, create a regular card
    var style = editable ? ' style="cursor:text;">' : '>'; // Set the cursor to 'text' if the edit toggle is active
    var itemTemplate =
      '<div class="item">' +
      '<div class="item-content">' +
      '<div class="card">' +
      '<p class="heading" contenteditable="true">' + projectTitle.value + '</p>' +
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
      '<div class="card" style="border-color:' + data[1] + ';">' +
      '<p class="group_title" contenteditable="true">' + data[0] + '</p>' +
      '<div class="card-remove">&#10005</div>' +
      '<label class="group-collapse"></label>' +
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

      if (savedItems.length == 0) { // End early if there's nothing to collapse
        return;
      }
      collapseSave[saveName] = savedItems; // Save the data

      if (savedItems.length > 0) {
        changeBorder(itemElement, "8px double");
      }
      eventTarget.style.backgroundImage = 'url("app_images/expand.png")';

    } else { // For expanding a group
      var destinationIndex = items.indexOf(gridItem) + 2;
      itemsToLoad.forEach(function(item) {
        dummyGrid.send(item, grid, destinationIndex++);
      });
      grid.show(itemsToLoad);
      delete collapseSave[saveName]; // Delete the data
      changeBorder(itemElement, "4px solid")
      eventTarget.style.backgroundImage = 'url("app_images/collapse.png")';
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
  var itemsToSave = [projectTitle.value];
  items.forEach(function(item) {
    item = content(item);
    var itemData = item.match(/<p.*?<\/p>/g); // This also includes the value of the heading, which is unwanted
    var dataToSave = [];
    itemData.forEach(function(elem) {
      elem = elem.split('">').pop().split('</p>')[0];
      dataToSave.push(elem);
    });

    if (dataToSave.length == 4) { // Remove the value of the heading if the card is a regular one
      dataToSave.shift();
    } else { // Otherwise save the group's colour
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
  projectTitle.value = itemsToLoad.shift();
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
    templateTitle.focus();
  } else {
    groupBtn.style.cursor = "default";
    regBtn.style.cursor = "pointer";
  }
  pickColourBtn.classList.toggle("pickColourBtnDisabled");
  changeTemplateColour(!groupBtn.disabled);
}

function checkText(element, confirm = false) { // Returns true if the element contains text. Otherwise it makes it flash, then returns false
  var text = element !== projectTitle ? element.textContent : element.value;
  var isCode = element.className === "code";

  if ((isCode && text.match(/^Interview: [0-9]+$/g) === null) || text === "") {
    if (!confirm && text === "Interview: ") {
      return true;
    }
    for (var delay = 0; delay <= 600; delay += 200) {
      setTimeout(function() {
        if (element.style.backgroundColor === "red") {
          element.style.backgroundColor = "white";
        } else {
          element.style.backgroundColor = "red";
        }
      }, delay);
    }
    return false;
  }
  return true;
}

// Event listeners
initialise();

window.addEventListener("beforeunload", function(e) { // Necessary things to do before closing
  undoGroupCollapse();
  this.localStorage.setItem('layout', saveItems()); // Autosaves the grid's layout
});
window.addEventListener('mousedown', function(e) {
  firstClick = e.target;
});
window.addEventListener('mouseup', function(e) {
  if (modal !== document.getElementById("queryProjectTitle") && modal !== document.getElementById("confirmProjectTitle")) {
    if (e.target === modal && e.target === firstClick) {
      toggleModal();
    }
  }
});

projectTitle.addEventListener('blur', checkProjectTitle) // Whenever it loses focus (i.e. click away or press tab)
projectTitle.addEventListener('keyup', function(e) { // If enter is pressed
  if (e.keyCode == 13) checkProjectTitle();
});
titleYesBtn.addEventListener('click', function(e) {
  toggleModal();
  projectTitle.style.zIndex = 0;
  templateHeading.value = projectTitle.value;
});
titleNoBtn.addEventListener('click', function(e) {
  toggleModal();
  modal = document.getElementById("queryProjectTitle");
  toggleModal();
  projectTitle.disabled = false;
  projectTitle.focus();
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
    if (!(allPElements[i].className == "group_title") && !(allPElements[i].className == "heading")) {
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
  queryProjectTitle();
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
  function s2ab(s) {
    var buf = new ArrayBuffer(s.length); // Convert s to ArrayBuffer
    var view = new Uint8Array(buf);  // Create Uint8Array as viewer
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; // Convert to octet
    return buf;
  }

  function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
      return a.map(function(r) { return r[c]; });
    });
  }

  var wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Thematic Analysis Export"
  };
  wb.SheetNames.push("First Sheet");
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
    });
    if (dataToSave.length == 4) { // Remove the value of the heading if the card is a regular one
      dataToSave.shift();

      var interviewnumber = dataToSave[2].substr(10);
      if (typeof interviews[interviewnumber] === 'undefined') {
        interviews[interviewnumber] = [['Interview: ' + dataToSave[2].charAt(10)]];
      }
      interviews[interviewnumber].push(dataToSave);
      if (typeof interviews[dataToSave[2].substr(11)] === 'undefined') {
        interviews[dataToSave[2].substr(11)] = [['Interview: ' + dataToSave[2].charAt(11)]];
      }
      interviews[dataToSave[2].substr(11)].push(dataToSave);
    }
  });


  var rows = [];
  var quotes = new Array(interviews.length);
  var quotesSorted = new Array(interviews.length);

  for (i = 1; i < interviews.length; i++) {
    if (typeof interviews[i] !== 'undefined') {
      quotes[i] = new Array();
      for (j = 1; j < interviews[i].length; j++) {
        if (typeof interviews[i][j][1] !== 'undefined') {
          quotes[i].push(interviews[i][j][0]);
        }
        quotes[i].sort();
      }
    }
  }

  for (i = 1; i < quotes.length; i++) {
    if (typeof quotes[i] !== 'undefined') {
      quotesSorted[i] = new Array();
      var intName = "Interview: " + i;
      quotesSorted[i].push(intName);
      quotesSorted[i].push(quotes[i][0]);
      for (j = 1; j < quotes[i].length; j++) {
        str1 = String(quotes[i][j]);
        length = str1.length;
        str2 = String(quotes[i][j - 1]);
        if (str1.localeCompare(str2)) {
          quotesSorted[i].push('');
          quotesSorted[i].push(str1);
        } else {
          quotesSorted[i].push(str1);
        }
      }
    }
  }

  var quotesSorted = quotesSorted.filter(function(el) {
    return el != null;
  });

  rows = transpose(quotesSorted);

  wb.Sheets["First Sheet"] = XLSX.utils.aoa_to_sheet(rows);
  var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  saveAs(new Blob([s2ab(wbout)], { type: "application/excel" }), 'ThematicDataExport.xlsx');
});

// Update the current slider value (each time you drag the slider handle). Works by appending new values to the stylesheet
slider.oninput = function() {
  var scale = this.value / 50;
  try {
    var sheet = window.document.styleSheets[1];
    for (var i = 0; i < 7; i++) { // Deletes the previous rules
      sheet.deleteRule(sheet.cssRules.length - 1);
    }
  } catch (e) { // Creates a new sheet that can be modified and read by both a browser and Electron
    style = document.createElement("style");
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    var sheet = window.document.styleSheets[1];
  }

  // The new size is the default size multiplied by the slider value divided by 50
  sheet.insertRule('#ghost h1 { font-size: ' + 75 * scale + 'px; }', sheet.cssRules.length);
  sheet.insertRule('.item { width: ' + 250 * scale + 'px; height: ' + 250 * scale + '; }', sheet.cssRules.length);
  sheet.insertRule('.group_title { font-size: ' + 230 * scale + '%; }', sheet.cssRules.length);
  sheet.insertRule('.heading { font-size:' + 170 * scale + '%; }', sheet.cssRules.length);
  sheet.insertRule('.title { font-size:' + 200 * scale + '%; }', sheet.cssRules.length);
  sheet.insertRule('.comment { font-size:' + 130 * scale + '%; }', sheet.cssRules.length);
  sheet.insertRule('.code { font-size:' + 94 * scale + '%; }', sheet.cssRules.length);

  grid.refreshItems().layout(true); // Refresh the size of the items and readjust the layout
}

regBtn.addEventListener('click', toggleGroupRegular);
groupBtn.addEventListener('click', toggleGroupRegular);
addCardBtn.addEventListener('click', function(e) {
  if (groupBtn.disabled) { // If "group" is selected in the modal, generate a group card
    if (!checkText(templateGroupTitle)) return;
    addNewCard([templateGroupTitle.textContent, templateCard.style.borderColor]);

  } else { // Otherwise generate a standard card
    var cont = checkText(templateTitle);
    cont = checkText(templateComment) && cont;
    cont = checkText(templateCode, true) && cont;
    if (!cont) return;
    addNewCard([templateTitle.textContent, templateComment.textContent, templateCode.textContent]);
  }
});