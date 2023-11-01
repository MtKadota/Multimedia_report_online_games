const { Socket } = require('dgram')
const express = require('express')
const app = express()

// socket.io setup
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server, {pingInterval: 2000, pingTimeout:5000 })

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const backendPlayers = { }
const backendProjectials = {}

const speed = 10
const Radius = 10
const projectial_rad = 5
let projectileId = 0 

io.on('connection', (socket) => {
  console.log("a user connected")

  io.emit('updatePlayers', backendPlayers)

  socket.on('shoot',({x,y,angle}) => {
    projectileId++
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }
    backendProjectials[projectileId] = {
      x, 
      y, 
      velocity,
      playerId: socket.id
    }
  })
  
  //game init
  socket.on('initGame', ({username,width, height, devicePixelRatio})=>{
    backendPlayers[socket.id] = {
      x: 500 * Math.random(),
      y: 500 * Math.random(),
      color: `hsl(${360*Math.random()}, 100%, 50%)`,
      sequenceNumber: 0,
      score: 0,
      username
    }
    backendPlayers[socket.id].canvas = {
      width,
      height
    }

    if (devicePixelRatio > 1){
      backendPlayers[socket.id].radius = 2 * Radius
    }
  })

  socket.on('disconnect', (reason)=>  {
    console.log(reason)
    delete backendPlayers[socket.id]
    io.emit('updatePlayers', backendPlayers)
  })

  socket.on('keydown', ({keycode, sequenceNumber})=>{
    backendPlayers[socket.id].sequenceNumber = sequenceNumber
    
    switch(keycode){
      case 'KeyW':
        backendPlayers[socket.id].y -= speed
        break
  
      case 'KeyA':
        backendPlayers[socket.id].x -= speed
        break
      
      case 'KeyS':
        backendPlayers[socket.id].y += speed
        break
  
      case 'KeyD':
        backendPlayers[socket.id].x += speed 
        break
    }
  })

  console.log(backendPlayers)
})

//backend tick
setInterval(()=>{

  //projectial update
  for (const id in backendProjectials){
    const backendprojectial = backendProjectials[id]
    backendprojectial.x += backendprojectial.velocity.x
    backendprojectial.y += backendprojectial.velocity.y

    if (backendprojectial.x - projectial_rad >= backendPlayers[backendProjectials[id].playerId]?.canvas?.width ||
      backendprojectial.x + projectial_rad < 0 ||
      backendprojectial.y - projectial_rad >= backendPlayers[backendProjectials[id].playerId]?.canvas?.height ||
      backendprojectial.y + projectial_rad < 0
    ){
      delete backendProjectials[id]
      continue
    }

    for (const playerId in backendPlayers) {
      const backendPlayer = backendPlayers[playerId]

      const Distnace = Math.hypot(
        backendProjectials[id].x - backendPlayer.x, 
        backendProjectials[id].y - backendPlayer.y
        )
      //colision detection
      if (Distnace < projectial_rad + backendPlayer.radius - (projectial_rad*.5) && 
        backendProjectials[id].playerId !== playerId){
        if (backendPlayers[backendProjectials[id].playerId])
          backendPlayers[backendProjectials[id].playerId].score++

        delete backendProjectials[id]
        delete backendPlayers[playerId]
        break
        
      }
    }
  }

  io.emit('updatePlayers', backendPlayers)
  io.emit("updateProjectials", backendProjectials)
}, 15)

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log('hello')