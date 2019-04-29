function displayDate() {
  jQuery('<div/>', {
    id: 'some-id',
    class: 'some-class',
    title: 'now this div has a title!'
}).appendTo('#left-events');
}
document.getElementById("myBtn").addEventListener("click", displayDate);
