let ledW = 96;
let ledH = 64;
let ledS = 20;
let ledOffset = 1;
let canvas;
let Width = ledW * ledS + (ledW + 1) * ledOffset;
let Height = ledH * ledS + (ledH + 1) * ledOffset;
let colorpicker;

class Pos {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


function setup() {
    canvas = createCanvas(Width, Height, P2D)
    init_arrays()
    setInterval(update_matrix, 500)
    noStroke()
    document.addEventListener("mousedown", mouse_handler)
    colorpicker = document.getElementById('colorpicker')
}

let leds = [];
let pos = [];

function draw() {
    background(100)
    draw_matrix()
}

function draw_matrix() {
    for (let i = 0; i < ledW; i++) {
        for (let j = 0; j < ledH; j++) {
            fill(hex_to_rgb(leds[i][j]))
            rect(pos[i][j].x, pos[i][j].y, ledS, ledS)
        }
    }
}

function init_arrays() {
    for (let i = 0; i < ledW; i++) {
        leds[i] = []
        pos[i] = []
        for (let j = 0; j < ledH; j++) {
            leds[i].push(0)
            pos[i].push(new Pos(ledOffset + i * (ledS + ledOffset), ledOffset + j * (ledS + ledOffset)))
        }
    }
}

function update_matrix(){
    let xhr = new XMLHttpRequest()
    xhr.open('GET', '/api/get')
    xhr.send()
    xhr.onload = function () {
        let doc = JSON.parse(xhr.response)
        for (let i = 0; i < ledW*ledH; i++) {
            leds[doc[i]["x"]][doc[i]["y"]] = rgb_to_hex(doc[i]["col"]["r"], doc[i]["col"]["g"], doc[i]["col"]["b"])
        }
    }
}

function mouse_handler(event){
    console.log(event)
    if (mouseX <= ledOffset || mouseX >= Width-ledOffset)
        return
    if (mouseY <= ledOffset || mouseY >= Height-ledOffset)
        return
    let x;
    let y;
    for (let i = 0; i < ledW; i++) {
        for (let j = 0; j < ledH; j++) {
            if (mouseX >= pos[i][j].x
                && mouseX <= pos[i][j].x + ledS
                && mouseY >= pos[i][j].y
                && mouseY <= pos[i][j].y + ledS) {
                x = i;
                y = j;
                break
            }
        }
    }
    if (x != undefined && y != undefined){
        if (!event.ctrlKey) {
            let val = Number(colorpicker.value.replace('#', '0x'));
            let r = hex_to_rgb(val)[0];
            let g = hex_to_rgb(val)[1];
            let b = hex_to_rgb(val)[2];
            send('/api/set/' + x + '/' + y + '/' + r + '/' + g + '/' + b)
        }
        else {
            send('/api/set/' + x + '/' + y + '/' + 0 + '/' + 0 + '/' + 0)
        }
    }
}

function send(url) {
    let xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.send()
}

function rgb_to_hex(r, g, b) {
    return (r << 16) | (g << 8) | (b)
}

function hex_to_rgb(val) {
    return [(val >> 16) & 0xff, (val >> 8) & 0xff, (val & 0xff)]
}
