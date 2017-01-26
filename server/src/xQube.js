const io = require('socket.io').listen(8080);
var obj = this;
const cowsay = require('cowsay');
const colors = require('colors');
global.Logger = require('./modules/Logger');
global.Commands = require('./modules/Commands');
global.readline = require('readline');
global.rl = readline.createInterface(process.stdin, process.stdout);
var userList = [];

function CubeObject(x, y, z, w, h, d, color) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.h = h;
    this.d = d;
    this.color = color;
}

function CameraObject(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

function CubeCollection(id, CamObj, CubeObj) {
    this.id = id;
    this.CamObj = CamObj;
    this.CubeObj = CubeObj;
    this.CubeObj2 = {};
}

function xQube() {
    this.commands = new Commands(this).start();
}

xQube.prototype.start = function() {
    Logger.white(cowsay.say({
        text : "x³ ( xQube )",
        e : "oO",
        T : "U "
    }));

    Logger.prompt(this.handleCommand.bind(this));
    Logger.info("x³ v1.00 server online!".green);
    Logger.info("x³ authors: Sean Oberoi and Stas Darevskiy ".green);
    Logger.info("Copyright (c) 2016-2017 Mile High Interactive, LLC".green);
}

xQube.prototype.handleCommand = function(data) {
	this.commands.parse(data);
	Logger.prompt(this.handleCommand.bind(this));
}

io.sockets.on('connection', function (socket) {
    
    socket.on('newObj', function(kek) {
      var id = socket.id;
      var camId = id + "Cam";
      var cubeId = id + "Cube";
      var uId = "user" + id;        
      userList.push(id);
      obj[camId] = new CameraObject(0, 0, 4);
      obj[cubeId] = new CubeObject(0, 0, 0, 5, 5, 5, "rgb(174, 129, 255)");
      obj[uId] = new CubeCollection(id, obj[camId], obj[cubeId]);        
    
      console.log("Built new Cube Object with ID: " + obj[uId].id) + "\n";
      
      console.log("UserList: " + userList);
    });
    
    socket.on('disconnect', function () {
        var userInArr = userList.indexOf(socket.id);
       
        if (userInArr > -1) {
            userList.splice(userInArr, 1);
            console.log("Client: " + socket.id + " has disconnected!");
        } else {
            console.log("Couldnt disconnect client: " + socket.id);  
        }
       
       socket.broadcast.emit('deleteGridObj', socket.id);
       console.log("UserList: " + userList);
    
    });
    
    socket.on('updatePos', function(data) {
        var xx = 0;
        var zz = 0;
        var speed = 4;
        var key = data.key;
        
        if (key == 'w') {
          zz -= speed;
        }
        
        if (key == 's') {
          zz += speed;
        }
        
        if (key == 'a') {
          xx -= speed;
        }
        
        if (key == 'd') {
          xx += speed;
        }
        
        var id = socket.id;
        var camId = id + "Cam";
        var cubeId = id + "Cube";
        var uId = "user" + id;
        
        obj[camId].x = obj[camId].x + xx;
        obj[camId].z = obj[camId].z + zz;
        
        obj[cubeId].x = obj[cubeId].x + xx;
        obj[cubeId].z = obj[cubeId].z + zz;
        
        var camPos = "gridPos[ x: {" + obj[camId].x + "}|| y:{ " + obj[camId].y + "}|| z: {" + obj[camId].z + "} ]";
        var camDebug = "Camera" + ": " + camPos;
        
        var cubePos = "gridPos[ x: {" + obj[cubeId].x + "}|| y:{ " + obj[cubeId].y + "}|| z: {" + obj[cubeId].z + "} ]";
        var cubeDebug = "Cube" + ": color{" + obj[cubeId].color + "} || " + cubePos;
        
       // console.log(camDebug + "\n" + cubeDebug);
      
        socket.emit('move', obj[uId]);
        
    });
    
    socket.on('getUserList', function() {
      
      var nmID = "user" + socket.id; 
      var unmID = obj[nmID];
      var unmIDe = unmID.id;
      var unmIDCube = unmID.CubeObj;
      
      socket.broadcast.emit('returnUserList', unmIDe, unmIDCube);
    
    });

});


module.exports = xQube;