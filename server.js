const express=require('express');
const app=express();
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const formatMessage=require('./Utils/messages');
const {userJoin,getCurrentUser,userleaves,getRoomUsers}=require('./Utils/users');

const server=http.createServer(app);
const io=socketio(server);

//Set Static Folder
app.use(express.static(path.join(__dirname,'public')));

//Run When Client Connects
io.on('connection',socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user=userJoin(socket.id,username,room);
        socket.join(user.room);
        //Welcome the current User
        socket.emit('message',formatMessage('ChatCord Bot','Welcome to the ChatCord!'));

        //Broadacst To Others When User Connects
        socket.broadcast.to(user.room).emit('message',formatMessage('ChatCord Bot',`${user.username} Has Joined The Chat`));
    
        //Set Users And Rooms
        io.to(user.room).emit('roomUser',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });
   

    //Listen For chatMessage

    socket.on('chatMessage',(msg)=>{
        const user=getCurrentUser(socket.id);
        //console.log(msg);
        io.to(user.room).emit('message',formatMessage(`${user.username}`,msg));
    });
    //Run When Client Disconnects
    socket.on('disconnect',()=>{
        const user=userleaves(socket.id);
        if(user){
            io.to(user.room).emit('message',
                                formatMessage('ChatCord Bot',`${user.username} has left the chat`)
            );
             //Set Users And Rooms
            io.to(user.room).emit('roomUser',{
                room:user.room,
                users:getRoomUsers(user.room)
            });
        }
    });
});




const PORT=process.env.PORT || 3000 ;
server.listen(PORT,()=>{
    console.log(`Server started on localhost:${PORT }`);
});
