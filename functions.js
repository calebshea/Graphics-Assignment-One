"use strict";

var gl;
var canvas;
var bufferId;
var program;
var color;
var ucolor;
var targetCoor;
var centerCoor;
var movement;
var unhitTargets;
var movingTargets;
var isTargetHit;

window.onload = function init() {
    isTargetHit = new Array(5);
    movingTargets = false;
    canvas = document.getElementById("gl-canvas");
    canvas.style.cursor = "crosshair";

    gl = canvas.getContext('webgl2');
    if(!gl) {
        alert("WebGL isn't available");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    color = vec4(1, 1, 1, 1);

    ucolor = gl.getUniformLocation(program, "color");
    gl.uniform4fv(ucolor, color);

    makeTargets();

    unhitTargets = 5;

    window.addEventListener("keydown", function(event){
        if(event.key == "m") {
            if(!movingTargets) {
                movingTargets = true;
                window.setInterval(update, 20);
            }else{
                movingTargets = false;
            }
        }
    });

    canvas.addEventListener("mousedown", mouseDownListener);

    gl.viewport(0, 0, canvas.width, canvas.height);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    render();
};

function resetButton() {
    location.reload();
}

function makeTargets() {

    targetCoor = [];
    centerCoor = new Array(5);
    movement = new Array(5);

    for(var i = 0; i < 5; i++)
    {
        centerCoor[i] = new Array(2);
        centerCoor[i][0] = Math.random()*2-1;
        centerCoor[i][1] = Math.random()*2-1;
        movement[i] = new Array(2);
        movement[i][0] = (Math.random()*2-1)/70;
        movement[i][1] = (Math.random()*2-1)/70;
        for(var j = 0; j < centerCoor[i].length; j++)
        {
            if (centerCoor[i][j] > 0.9)
                centerCoor[i][j] = 0.9;
            else if (centerCoor[i][j] < -0.9)
                centerCoor[i][j] = -0.9;
        }
        targetCoor.push(vec4(centerCoor[i][0] - 0.1, centerCoor[i][1] - 0.1, 0, 1));
        targetCoor.push(vec4(centerCoor[i][0] - 0.1, centerCoor[i][1] + 0.1, 0, 1));
        targetCoor.push(vec4(centerCoor[i][0] + 0.1, centerCoor[i][1] + 0.1, 0, 1));
        targetCoor.push(vec4(centerCoor[i][0] + 0.1, centerCoor[i][1] - 0.1, 0, 1));
    }

    bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(targetCoor), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");

    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function mouseDownListener(event){
    var rect = canvas.getBoundingClientRect();
    var canvasY = event.clientY - rect.top;
    var flippedY = canvas.height - canvasY;

    var yCoor = 2 * flippedY / canvas.height - 1;

    var xCoor = 2 * (event.clientX - rect.left) / canvas.width - 1;

    for (var i = 0; i < 5; i++) {
        if (xCoor < centerCoor[i][0] + 0.1 && xCoor > centerCoor[i][0] - 0.1 &&
            yCoor < centerCoor[i][1] + 0.1 && yCoor > centerCoor[i][1] - 0.1 &&
            !isTargetHit[i]) {
            movement[i][0] = 0;
            movement[i][1] = 0;
            isTargetHit[i] = true;
            unhitTargets--;
        }

    }
}

function update(){
    if(movingTargets) {
        for (var i = 0; i < 5; i++) {
            if (centerCoor[i][0] + movement[i][0] < -0.9 || centerCoor[i][0] + movement[i][0] > 0.9)
                movement[i][0] *= -1;
            else if (centerCoor[i][1] + movement[i][1] < -0.9 || centerCoor[i][1] + movement[i][1] > 0.9)
                movement[i][1] *= -1;

            centerCoor[i][0] += movement[i][0];
            centerCoor[i][1] += movement[i][1];

            targetCoor[i * 4][0] += movement[i][0];
            targetCoor[i * 4][1] += movement[i][1];
            targetCoor[i * 4 + 1][0] += movement[i][0];
            targetCoor[i * 4 + 1][1] += movement[i][1];
            targetCoor[i * 4 + 2][0] += movement[i][0];
            targetCoor[i * 4 + 2][1] += movement[i][1];
            targetCoor[i * 4 + 3][0] += movement[i][0];
            targetCoor[i * 4 + 3][1] += movement[i][1];
        }

        var feedback = document.getElementById("feedback");
        feedback.innerHTML = "";
        if(unhitTargets == 0)
            var content = document.createTextNode("GAME OVER!! YOU WON!!");
        else
            var content = document.createTextNode(unhitTargets + " UNHIT TARGETS");
        feedback.appendChild(content);

        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(targetCoor), gl.STATIC_DRAW);

        requestAnimationFrame(render);
    }
}


function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_LOOP, 0, 4);
    gl.drawArrays(gl.LINE_LOOP, 4, 4);
    gl.drawArrays(gl.LINE_LOOP, 8, 4);
    gl.drawArrays(gl.LINE_LOOP, 12, 4);
    gl.drawArrays(gl.LINE_LOOP, 16, 4);
}