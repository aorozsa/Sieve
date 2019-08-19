// Variables
var grid;
var grid2;
var ghost; // "Card" used for adding other cards.
var ghostMarkup = '<div class="card" id="ghost" onclick="ghostAction();"><h1>+</h1></div>'; // HTML markup for the ghost card
var saveBtn = document.querySelector('.saveBtn');
var loadBtn = document.querySelector('.loadBtn');
var sortBtn = document.querySelector('.sortBtn');
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

// Storing items in arrays to save
var titles = ['test1', 'test2', 'test3'];

var comments = ['test1', 'test2', 'test3'];
var codes = ['test1', 'test2', 'test3'];
var data_layout = [2, 5, 7];
var dataid;


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
      if (e.target.matches("textarea")) return false; // Disables dragging on textareas. This will be altered in the future
      return Muuri.ItemDrag.defaultStartPredicate(item, e);
    },
    dragSort: getAllGrids
  }).on('dragEnd', function(item, event) {
    if (grid.getItems(0)[0] !== ghost) {
      grid.move(item, ghost); // Swap the item positions, putting the ghost back in front
    }
    // window.localStorage.setItem('layout', gridToJSON()); // Autosaves the grid's items
  });
  addSavedCard(ghostMarkup);
  var layout = window.localStorage.getItem('layout');
  // if (layout) { // Automatically loads the last layout if applicable
  //   addSavedCard(ghostMarkup);
  //   load(layout);
  // } else {
  //   addSavedCard(ghostMarkup); // Adds the ghost card by default. This area could also be used for a "first-time message"
  // }

  grid2 = new Muuri('.grid-2', {
    dragEnabled: true,
    dragContainer: document.body,
    dragSort: getAllGrids
  });

}

function getAllGrids(item) {
  var grids = (grid, grid2);
  return [grids];
}



function ghostAction() { // Change this to toggle visibility of two buttons. One will add a blank card, other will add a blank group.
  // modal = document.getElementById("newCardModal");
  // toggleModal();
  if (title.value==""){
    addNewCard([dataid, dataid, dataid]);
  }else{
    addNewCard([title.value, comment.value, code.value]);
  }
  console.log(title.value);

}

function addNewCard(data) { // Creates a HTML element based on the data and adds it to the grid
  var itemElem = document.createElement('div');
  if (data.length == 3) { // If 3, create a regular card
    if(Math.max(...data_layout) > -1){
      dataid = (Math.max(...data_layout) + 1);
    } else {
      dataid = 1;
    }

    var itemTemplate =
      '<div class="item"' + 'data-id=' + dataid + '>' +
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
      '<textarea placeholder="Title"></textarea>' +
      '</div>' +
      '</div>' +
      '</div>';
  }
  titles.push(data[0]);
  comments.push(data[1]);
  codes.push(data[2]);
  data_layout.push(dataid);
  console.log(titles, comments, codes, data_layout);
  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
  // window.localStorage.setItem('layout', gridToJSON()); // Saves the grid's items
}


function addSavedCard(cardDiv) { // Like addNewCard, but it accepts a string of the pre-written card class and creates a template using that
  var itemElem = document.createElement('div');
  var itemTemplate =
    '<div class="item" data-id="0">' +
    '<div class="item-content">'  +
    cardDiv +
    '</div>' +
    '</div>';
  itemElem.innerHTML = itemTemplate;
  grid.add(itemElem.firstChild);
  if (cardDiv.includes("ghost")) { // Initialise the ghost card, if that's what the card in question is
    ghost = grid.getItems(0)[0];
  }
}

// function gridToJSON() { // Returns all of the grid's item elements in a stringified format. Core component for saving
//   var items = grid.getItems().map(item => item.getElement());
//   var itemsToSave = [];
//   items.forEach(function(item) {
//     itemsToSave.push(item.firstElementChild.innerHTML);
//   });
//   return JSON.stringify(itemsToSave);
// }

// function load(layout) { // Loads cards that have already been created before
//   var itemsToLoad = JSON.parse(layout);
//   itemsToLoad.forEach(function(item) {
//     addSavedCard(item);
//   });
//   window.localStorage.setItem('layout', gridToJSON()); // Saves the grid's items
// }

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

// saveBtn.addEventListener('click', function(event) {
//   var file = new Blob([gridToJSON()], {
//     type: 'application/octet-stream'
//   });
//   saveAs(file, "SieveSaveFile");
// });
//
// loadBtn.addEventListener('change', function(e) {
//   var file = e.target.files[0];
//   if (!file) return;
//
//   var reader = new FileReader();
//   reader.onload = function(e) {
//     var contents = e.target.result;
//     grid.remove(grid.getItems(), {
//       removeElements: true
//     });
//     load(contents);
//   };
//   reader.readAsText(file);
// }), false;

saveBtn.addEventListener('click', function(event) {
  localStorage.clear();
  window.localStorage.setItem('savedTitles', titles);
  window.localStorage.setItem('savedComments', comments);
  window.localStorage.setItem('savedCodes', codes);
  window.localStorage.setItem('savedCards', data_layout);
  saveLayout(grid);
  console.log(window.localStorage.getItem('layout'));
  console.log(data_layout);
});

function serializeLayout(grid) {
  var itemIds = grid.getItems().map(function (item) {
    return item.getElement().getAttribute('data-id');
  });
  return JSON.stringify(itemIds);
}

function saveLayout(grid) {
  var layout = serializeLayout(grid);
  window.localStorage.setItem('layout', layout);

}

loadBtn.addEventListener('click', function(e) {
  loadCards();
});

function emptyArray(array){
  array.length = 0;
}

function emptyAll(){
  emptyArray(titles);
  emptyArray(comments);
  emptyArray(codes);
  emptyArray(data_layout);
}

function loadCards() {
  console.log(window.localStorage.getItem('savedCards'));
   // Creates a HTML element based on the data and adds it to the grid
  if (window.localStorage.getItem('savedCards').length > 1){
    removeItemsFromGrid();
    emptyAll();
    titles = window.localStorage.getItem('savedTitles').split(',');
    comments = window.localStorage.getItem('savedComments').split(',');
    codes = window.localStorage.getItem('savedCodes').split(',');
    data_layout = window.localStorage.getItem('savedCards').split(',');
  }
  for (i = 0; i < titles.length; i++){
    var itemElem = document.createElement('div');
      var itemTemplate =
        '<div class="item"' + 'data-id=' + data_layout[i] + '>' +
        '<div class="item-content">' +
        '<div class="card">' +
        '<p id="title">' + titles[i] + '</p>' +
        '<p id="comment">' + comments[i] + '</p>' +
        '<p id="code">' + codes[i] + '</p>' +
        '</div>' +
        '</div>' +
        '</div>';
        itemElem.innerHTML = itemTemplate;
        grid.add(itemElem.firstChild);
    }
  }

function saveLayout(grid) {
  var layout = serializeLayout(grid);
  window.localStorage.setItem('layout', layout);
}

function removeItemsFromGrid() {
          var items = grid.getItems();
          items.shift();
          grid.hide(items, {
            onFinish: function(hiddenItems) {
              grid.remove(hiddenItems, { removeElements: true });
            }
          });
        }

clearBtn.addEventListener('click', function(event) { // Removes all items, adds back the ghost, then saves the layout
  removeItemsFromGrid();
  emptyAll();
  // localStorage.clear();
});

sortBtn.addEventListener('click', function(e) {
  var currentItems = grid.getItems();
  var currentItemIds = currentItems.map(function (item) {
    return item.getElement().getAttribute('data-id')
  });
  var newItems = [];
  var itemId;
  var itemIndex;
  var layout = JSON.parse(window.localStorage.getItem('layout'));
  console.log(layout);
  console.log(currentItemIds);
  for (var i = 0; i < layout.length; i++) {
    itemId = layout[i];
    itemIndex = currentItemIds.indexOf(itemId);
    if (itemIndex > -1) {
      newItems.push(currentItems[itemIndex])
    }
  }
  grid.sort(newItems);
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
