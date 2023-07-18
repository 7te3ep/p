import { initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase , ref , push , onValue , remove, get, off, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";    
const firebaseConfig = {
   apiKey: "AIzaSyCjmEkv5mrLhEoBYt-6UXq6vgRT_4J5vfQ",
   authDomain: "pixelwar-43efd.firebaseapp.com",
   projectId: "pixelwar-43efd",
   storageBucket: "pixelwar-43efd.appspot.com",
   messagingSenderId: "1031648884647",
   appId: "1:1031648884647:web:6778990d42b3e5e438a882"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app)
//await set(ref(database,`liste/${nom}`),{
//   quoi: quoi
//})
//onValue(ref(database, 'liste'),async (snapshot)=>{
//   const values = await snapshot.val()
//   remove(ref(database,`liste/${el.id}`))
//})
let canvas = document.getElementById("canvas")
let ctx = canvas.getContext("2d");

let cameraOffset = { x: window.innerWidth/2, y: window.innerHeight/2 }
let cameraZoom = 1
let MAX_ZOOM = 5
let MIN_ZOOM = 0.2
let SCROLL_SENSITIVITY = 0.0010


const rows = 200
const cols = 200
const cellSize = 10

let cellString = "n".repeat(40000)

const grid = []

for (let x = 0; x < rows; x ++){
   grid.push([])
   for (let y = 0; y < cols; y ++){
      grid[x].push(Math.random() < 0.5 ? ["red"] : ["blue"])
   }
}


function draw(){
   canvas.width = window.innerWidth
   canvas.height = window.innerHeight
   ctx.translate( window.innerWidth / 2, window.innerHeight / 2 )
   ctx.scale(cameraZoom, cameraZoom)
   ctx.translate( -window.innerWidth / 2 + cameraOffset.x, -window.innerHeight / 2 + cameraOffset.y )
   ctx.clearRect(0,0,canvas.width, canvas.height)

   ctx.beginPath()
   for (let x = 0; x < rows; x += 1){
      for (let y = 0; y < cols; y += 1){
         if (cellString[x*200+y] == "r"){
            ctx.fillStyle = "red"
            ctx.fillRect(x*cellSize, y*cellSize, cellSize,cellSize)
         } 
         else {
            ctx.rect(x*cellSize, y*cellSize, cellSize,cellSize)
         } 
         
      }  
   }
   ctx.stroke();
   ctx.closePath();
   requestAnimationFrame(draw)
}

canvas.addEventListener('click',(e)=>{
   let x = Math.floor(((e.clientX - (cameraOffset.x))* (1/cameraZoom))/cellSize)-2 
   let y = Math.floor(((e.clientY - (cameraOffset.y))* (1/cameraZoom))/cellSize)-2

   let index = x*200 + y
   console.log('Click pos',e.x);
   console.log("on offeset",(e.x - cameraOffset.x) );
   console.log("on zoom",(e.x - cameraOffset.x) * (1/cameraZoom));
   console.log("finish",Math.floor(((e.x - cameraOffset.x) * (1/cameraZoom))/cellSize)-2 );
   console.log('_____________________________');
   cellString = cellString.split('')
   cellString[index] = "r"
   cellString = cellString.join("")
})

function getEventLocation(e)
{
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }        
    }
}

function drawRect(x, y, width, height)
{
    ctx.fillRect( x, y, width, height )
}

function drawText(text, x, y, size, font)
{
    ctx.font = `${size}px ${font}`
    ctx.fillText(text, x, y)
}

let isDragging = false
let dragStart = { x: 0, y: 0 }

function onPointerDown(e)
{
   isDragging = true
   dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
   dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
   console.log(dragStart.x,dragStart.y,cameraZoom);
}

function onPointerUp(e)
{
    isDragging = false
    initialPinchDistance = null
    lastZoom = cameraZoom
}

function onPointerMove(e)
{
    if (isDragging)
    {
        cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
        cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
    }
}

function handleTouch(e, singleTouchHandler)
{
    if ( e.touches.length == 1 )
    {
        singleTouchHandler(e)
    }
    else if (e.type == "touchmove" && e.touches.length == 2)
    {
        isDragging = false
        handlePinch(e)
    }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e)
{
    e.preventDefault()
    
    let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
    
    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
    
    if (initialPinchDistance == null)
    {
        initialPinchDistance = currentDistance
    }
    else
    {
        adjustZoom( null, currentDistance/initialPinchDistance )
    }
}

function adjustZoom(zoomAmount, zoomFactor)
{
    if (!isDragging)
    {
        if (zoomAmount)
        {
            cameraZoom += zoomAmount
        }
        else if (zoomFactor)
        {
            cameraZoom = zoomFactor*lastZoom
        }
        
        cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
        cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
        
    }
}

canvas.addEventListener('mousedown', onPointerDown)
canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
canvas.addEventListener('mouseup', onPointerUp)
canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
canvas.addEventListener('mousemove', onPointerMove)
canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))

// Ready, set, go
draw()





   //ctx.beginPath();
   //ctx.lineWidth = 0.1;

   //for (let x = 0; x <= rows * cellSize; x += cellSize) {
   //    ctx.moveTo(x, 0);
   //    ctx.lineTo(x, rows * cellSize);
   //}
   //for (let y = 0; y <= cols * cellSize; y += cellSize) {
   //    ctx.moveTo(0, y);
   //    ctx.lineTo(cols * cellSize, y);
   //}
   //ctx.stroke();
   //ctx.closePath();