let state = "red";
let running = false;
let rushHour = false;
let pedestrianRequested = false;

let lightDurations = {
    green: 5000,
    yellow: 2000,
    red: 5000
};

let carSpeed = 2;

const redLight = document.querySelector(".red");
const yellowLight = document.querySelector(".yellow");
const greenLight = document.querySelector(".green");

const pedSignal = document.getElementById("pedSignal");

const car1 = document.getElementById("car1");
const car2 = document.getElementById("car2");

function updateLights() {
    redLight.classList.remove("active");
    yellowLight.classList.remove("active");
    greenLight.classList.remove("active");

    if (state === "red") redLight.classList.add("active");
    if (state === "yellow") yellowLight.classList.add("active");
    if (state === "green") greenLight.classList.add("active");
}

function cycleLights() {
    if (!running) return;

    if (pedestrianRequested && state !== "green") {
        pedestrianRequested = false;
        pedestrianWalk();
        return;
    }

    if (state === "red") {
        state = "green";
        updateLights();
        setTimeout(cycleLights, lightDurations.green);
    } else if (state === "green") {
        state = "yellow";
        updateLights();
        setTimeout(cycleLights, lightDurations.yellow);
    } else {
        state = "red";
        updateLights();
        setTimeout(cycleLights, lightDurations.red);
    }
}

function pedestrianWalk() {
    state = "red";
    updateLights();

    pedSignal.classList.add("walk");
    pedSignal.classList.remove("stop");
    pedSignal.textContent = "WALK";

    setTimeout(() => {
        pedSignal.classList.add("stop");
        pedSignal.classList.remove("walk");
        pedSignal.textContent = "STOP";

        cycleLights();
    }, 4000);
}

document.getElementById("pedBtn").onclick = () => {
    pedestrianRequested = true;
};

let carPos1 = -80;
let carPos2 = -200;

function moveCars() {
    if (!running) return;

    if (state === "green") {
        carPos1 += carSpeed;
        carPos2 += carSpeed;
    }

    if (carPos1 > window.innerWidth) carPos1 = -100;
    if (carPos2 > window.innerWidth) carPos2 = -200;

    car1.style.left = carPos1 + "px";
    car2.style.left = carPos2 + "px";

    requestAnimationFrame(moveCars);
}

document.getElementById("startBtn").onclick = () => {
    running = true;
    cycleLights();
    moveCars();
};

document.getElementById("pauseBtn").onclick = () => {
    running = false;
};

document.getElementById("resetBtn").onclick = () => {
    location.reload();
};

document.getElementById("rushBtn").onclick = () => {
    rushHour = !rushHour;

    if (rushHour) {
        lightDurations.red = 7000;
        carSpeed = 4;
        alert("Rush hour mode ON");
    } else {
        lightDurations.red = 5000;
        carSpeed = 2;
        alert("Rush hour mode OFF");
    }
};
