const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const socket = io()

const scoreEl = document.querySelector('#scoreEl')

const devicePixelRatio = window.devicePixelRatio || 1

canvas.width = 1024 * devicePixelRatio
canvas.height = 576 * devicePixelRatio

c.scale(devicePixelRatio,devicePixelRatio)

const x = canvas.width / 2
const y = canvas.height / 2

const frontendPlayers = {}
const frontendProjectials = {}

socket.on('updatePlayers', (BackendPlayers) =>{
  for (const id in BackendPlayers){
    const backendPlayer = BackendPlayers[id]
    //creates frontend player of one does't exist 
    if (!frontendPlayers[id]){
      frontendPlayers[id] = new Player({
        x: backendPlayer.x, 
        y: backendPlayer.y, 
        radius: 10, 
        color: backendPlayer.color,
        username: backendPlayer.username
      })
      
      //add player to leaderbord
      document.querySelector('#playerLabels').innerHTML += `<div data-id="${id}">${backendPlayer.username}: ${backendPlayer.score}</div>`

    } else{
      //updateleaderbord
      document.querySelector(`div[data-id="${id}"]`).innerHTML = `${backendPlayer.username}: ${backendPlayer.score}`
      document.querySelector(`div[data-id="${id}"]`).setAttribute('data-score', backendPlayer.score)
      //order leaderbord
      const parentDiv =  document.querySelector('#playerLabels')
      const childDivs = Array.from(parentDiv.querySelectorAll('div'))
      childDivs.sort((a, b)=>{
        const scoreA = Number(a.getAttribute('data-score'))
        const scoreB = Number(b.getAttribute('data-score'))
        return scoreB - scoreA
      })
      //removes old elements
      childDivs.forEach(div =>{
        parentDiv.removeChild(div)
      })
      //appends sorted elements
      childDivs.forEach(div=>{
        parentDiv.appendChild(div)
      })
      
      // if a player already exists and is the correct player
      if (id === socket.id) {
        frontendPlayers[id].x = backendPlayer.x
        frontendPlayers[id].y = backendPlayer.y

        const lastBackendInputIndex = playerInputs.findIndex((input) => {
          return backendPlayer.sequenceNumber === input.sequenceNumber
        })

        if (lastBackendInputIndex > -1)
          playerInputs.splice(0, lastBackendInputIndex + 1)

        playerInputs.forEach((input) => {
          frontendPlayers[id].x += input.dx
          frontendPlayers[id].y += input.dy
        })
      } else {
        // for all other players
        if (backendPlayer.usernamev !=='back_lagger'){
          gsap.to(frontendPlayers[id], {
            x: backendPlayer.x,
            y: backendPlayer.y,
            duration: 0.015,
            ease: 'linear'
          })
        }
      }
    }
  }

  //delete frontend players
  for (const id in frontendPlayers) {
    if (!BackendPlayers[id]){
      const divToDelete = document.querySelector(`div[data-id="${id}"]`)
      divToDelete.parentNode.removeChild(divToDelete)

      if(id === socket.id){
        document.querySelector('#usernameForm').style.display = 'block'
      }

      delete frontendPlayers[id]
    }
  }
})

socket.on('updateProjectials', (backendProjectials) =>{
  for (const id in backendProjectials) {
    const backendProjectial = backendProjectials[id]
    if (!frontendProjectials[id]){
      frontendProjectials[id] = new Projectile({
        x: backendProjectial.x, 
        y: backendProjectial.y, 
        radius: 5, 
        color: frontendPlayers[backendProjectial.playerId]?.color, 
        velocity: backendProjectial.velocity
      })
    }else {
      frontendProjectials[id].x += backendProjectials[id].velocity.x
      frontendProjectials[id].y += backendProjectials[id].velocity.y
    }
  }
  for (const id in frontendProjectials){
    if(!backendProjectials[id]){
      delete frontendProjectials[id]
    }
  }

})
//const enemies = []

/*
function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4

    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000)
}
*/
let animationId
//let score = 0
function animate() {
  animationId = requestAnimationFrame(animate)
  //c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.clearRect(0, 0, canvas.width, canvas.height)

  for (const id in frontendPlayers){
    const frontendPlayer = frontendPlayers[id]
    frontendPlayer.draw()
  }

  for (const id in frontendProjectials){
    const frontendProjectial = frontendProjectials[id]
    frontendProjectial.draw()
  }
  
/*
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index]

    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    //end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
    }

  }*/
}

animate()
const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const SPEED = 10
const playerInputs = []
let sequenceNumber = 0
setInterval(() => {
  if (keys.w.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED })
    if (frontendPlayers[socket.id].username !=='front_lagger'){
      frontendPlayers[socket.id].y -= SPEED
    }
    socket.emit('keydown', { keycode: 'KeyW', sequenceNumber })
  }

  if (keys.a.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 })
    if (frontendPlayers[socket.id].username !=='front_lagger'){
    frontendPlayers[socket.id].x -= SPEED
    }
    socket.emit('keydown', { keycode: 'KeyA', sequenceNumber })
  }

  if (keys.s.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED })
    if (frontendPlayers[socket.id].username !=='front_lagger'){
    frontendPlayers[socket.id].y += SPEED
    }
    socket.emit('keydown', { keycode: 'KeyS', sequenceNumber })
  }

  if (keys.d.pressed) {
    sequenceNumber++
    playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 })
    if (frontendPlayers[socket.id].username !=='front_lagger'){
    frontendPlayers[socket.id].x += SPEED
    }
    socket.emit('keydown', { keycode: 'KeyD', sequenceNumber })
  }
}, 15)

window.addEventListener('keydown', (event) => {
  if (!frontendPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = true
      break

    case 'KeyA':
      keys.a.pressed = true
      break

    case 'KeyS':
      keys.s.pressed = true
      break

    case 'KeyD':
      keys.d.pressed = true
      break
  }
})

window.addEventListener('keyup', (event) => {
  if (!frontendPlayers[socket.id]) return

  switch (event.code) {
    case 'KeyW':
      keys.w.pressed = false
      break

    case 'KeyA':
      keys.a.pressed = false
      break

    case 'KeyS':
      keys.s.pressed = false
      break

    case 'KeyD':
      keys.d.pressed = false
      break
  }
})
//spawnEnemies()

document.querySelector('#usernameForm').addEventListener('submit', (event) =>{
  event.preventDefault()
  document.querySelector('#usernameForm').style.display='none'
  socket.emit('initGame',{
    username: document.querySelector('#usernameInput').value,
    width: canvas.width, 
    height: canvas.height,
    devicePixelRatio
  })  
})