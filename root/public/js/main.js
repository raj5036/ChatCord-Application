const chatForm=document.getElementById("chat-form");
const chatMessages=document.querySelector(".chat-messages");
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');

//Get Username And Room From The QueryString
const {username,room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
});
console.log(`Username:${username},Room:${room}`)
const socket=io();

//Join the chatroom
socket.emit('joinRoom',{username,room});
//Get And Update Rooms And Users Accordingly
socket.on('roomUser',({room,users})=>{
    outputRoomName(room);
    outputUsersName(users);
});

socket.on('message',message=>{
    console.log(message);
    outputMessage(message);

    //Scroll Down On Getting New Message
    chatMessages.scrollTop=chatMessages.scrollHeight;
});

chatForm.addEventListener('submit',(event)=>{
    event.preventDefault();

    const msg=event.target.elements.msg.value;
    //console.log(msg);
    //Emit Messege to Server
    socket.emit('chatMessage',msg);

    event.target.elements.msg.value="";
    event.target.elements.msg.focus();
});

//Output The Message To DOM
function outputMessage(message){
    const div=document.createElement("div");
    div.classList.add("message");
    div.innerHTML=`
        <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">
            ${message.text}
        </p>
        `;
    document.querySelector(".chat-messages").appendChild(div);
}
function outputRoomName(room){
    roomName.innerText=room;
}
function outputUsersName(users){
    userList.innerHTML=`
        ${users.map(user=>` <li>${user.username} </li> `).join()}
    `;
}