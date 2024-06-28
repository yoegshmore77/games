let isDragging = false;
let lastMouseX;
let lastMouseY;
let currentRotationX = 0;
let currentRotationY = 0;

document.addEventListener("mousedown", onMouseDown);
document.addEventListener("mouseup", onMouseUp);
document.addEventListener("mousemove", onMouseMove);

let move_cube = setInterval(updateCubeRotation, 100);

function onMouseDown(event) {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

     move_cube = setInterval(updateCubeRotation, 100);
}

function onMouseUp(event) {
    isDragging = false;

    clearInterval(move_cube);
}

function onMouseMove(event) {
    if(isDragging) {
        let deltaX = event.clientX - lastMouseX;
        let deltaY = event.clientY - lastMouseY;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

        currentRotationY += deltaX * 0.5;
        //currentRotationX -= deltaY * 0.5;

    
        //updateCubeRotation();
    }
}


function updateCubeRotation() {

    let cube = document.querySelector(".cube");


    //let cube = document.querySelector(".cube");
    /*cube.style.transform = 
    `rotateX(${currentRotationX}deg)
    rotateY(${currentRotationY}deg)`;*/

    //cube.style.transform = `rotateY(${pos}deg)`;
    //cube.style.transform = `rotateY(${currentRotationX}deg)`;
    cube.style.transform = `rotateY(${currentRotationY}deg)`;
    
    
}


