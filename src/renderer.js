const
ipc      = require('electron').ipcRenderer,

syncBtn  = document.querySelector('#syncBtn'),
asyncBtn = document.querySelector('#asyncBtn');

let replyDiv = document.querySelector('#reply');

syncBtn.addEventListener('click', () => {
 let
 reply = ipc.sendSync('synMessage','A sync message to main');
 replyDiv.innerHTML = reply;
 console.log(reply);
});

asyncBtn.addEventListener('click', () => {
 ipc.send('aSynMessage','A async message to main')
});

ipc.on('asynReply', (event, args) => {
 replyDiv.innerHTML = args;
 console.log(args);
});
