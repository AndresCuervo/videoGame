var // Global variables!
width = 800,
height = width - 100,
bg = 0,
myHeight = height,
myWidth = width,
player,
keys = [],
friction = 0.8,
gravity = 0.4,
boxes = [],
dir,
maroon = {r: 85, g: 38, b: 56};
gray = {r: 50, g: 50, b: 50};
yellow = {r: 226, g: 227, b: 112};
red = {r: 191, g: 39, b: 64};

function box(x, y, width, height) {
    this.x = x,
    this.y = y,
    this.width = width,
    this.height = height,
    this.color = gray
}

// dimensions
function addStairs() {
    var
    xOffset = 20,
    yOffset = 38;

    for (var i = 0; i < 9; i++) {
        boxes.push( new box(
            width/1.65 + i * xOffset,
            height/2.5 + i * yOffset,
            50,
            10
        ));
        boxes[i].color = maroon;
    }
}

function makeTwo(x, y, width, height) {
    var prevLength = boxes.length;
    for( var i = 0; i < 2; i++ ){
    boxes.push( new box (
        x,
        y + i * 10,
        width,
        height
    ));
    }
    boxes[prevLength].color = maroon;
    boxes[prevLength + 1].color = red;
}

function getPrevBox() {
    // Return the box that was made 2 boxes ago,
    // because this function is to be used in conjuction
    // with add platforms, which makes two platforms at a time.
    return boxes[boxes.length - 2];
}

function addPlatforms() {
    var prevBox, gap;
    // make the top row of two-colored platforms: - -
    makeTwo( 10, height/3.2, width/1.8, 10 );
    prevBox = getPrevBox();
    gap = 120;
    makeTwo( prevBox.x + prevBox.width + gap, prevBox.y, width - prevBox.x - prevBox.width - gap, prevBox.height);
    // make the second row, the second platform being slightly higher: _ -
    makeTwo( 200, height/2, 220, 10 );
    prevBox = getPrevBox();
    gap = 200;
    makeTwo( prevBox.x + prevBox.width + gap, prevBox.y - 15, 100, prevBox.height);
    // Make the third row: -  _ -
    makeTwo( 150, height/1.5, 100, 10 );
    prevBox = getPrevBox();
    gap = 35;
    makeTwo( prevBox.x + prevBox.width + gap, prevBox.y + 40, 60, prevBox.height);
    prevBox = getPrevBox();
    gap = 40;
    makeTwo( prevBox.x + prevBox.width + gap, prevBox.y - 45, 100, prevBox.height);
}

addStairs();
addPlatforms();

boxes.push( new box (
    0,
    0,
    10,
    height
),
new box (
    0,
    height - 10,
    width,
    10
),
new box (
    width - 10,
    0,
    50,
    height
) );

function drawBoxes() {
    for (var i = 0; i < boxes.length; i++) {
        fill(boxes[i].color.r, boxes[i].color.g, boxes[i].color.b);
        rect(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height);
        var dir = collisionCheck(player, boxes[i]);
        if (dir === "l" || dir === "r") {
            player.velocity.x = 0;
            player.jumping = false;
        } else if (dir === "b") {
            player.grounded = true;
            player.jumping = false;
        } else if (dir === "t") {
            player.velocity.y *= -1;
        }
    }
}

function Entity(startingX, startingY, width, height) {
    this.x = startingX,
    this.y = startingY,
    this.width = width,
    this.height = height,
    this.speed = 3.5,
    // this.velocity = createVector(0, 0),
    this.velocity = {x: 0, y: 0},
    this.velocity.x = 0,
    this.velocity.y = 0,
    this.jumping = false,
    this.grounded = false,
    this.color = gray;
}

function updatePlayer() {
    var jumpKey = (keys[32] || keys[38]),
    leftKey = keys[37];
    rightKey = keys[39];
    // check keys
    if (jumpKey) {
        if (!player.jumping && player.grounded) {
            player.jumping = true;
            player.grounded = false;
            player.velocity.y = -player.speed * 2;
        }
    }
    if (rightKey) {
        if (player.velocity.x < player.speed) {
            player.velocity.x++;
        }
    }
    if (leftKey) {
        if (player.velocity.x > -player.speed) {
            player.velocity.x--;
        }
    }

    player.velocity.x *= friction;
    player.velocity.y += gravity;

    player.grounded = false;
    drawBoxes();

    if(player.grounded){
        player.velocity.y = 0;
    }

    player.x += player.velocity.x;
    player.y += player.velocity.y;

    fill(player.color.r, player.color.g, player.color.b);
    rect( player.x, player.y, player.width, player.height);
}

function setup() {
    createCanvas(myWidth, myHeight);
    background(bg);
    fill(0);
    strokeWeight(0);
    player = new Entity(width/5, myHeight/2, 10, 10);
    player.color = yellow;
}

function draw() {
    background(bg);
    updatePlayer();
}

function collisionCheck(shapeA, shapeB) {
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
    vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
    // add the half widths and half heights of the objects
    hWidths = (shapeA.width / 2) + (shapeB.width / 2),
    hHeights = (shapeA.height / 2) + (shapeB.height / 2),
    direction = null;

    // if the x and y vector are less than the half width or half height, they must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
        oY = hHeights - Math.abs(vY);
        if (oX >= oY) {
            if (vY > 0) {
                direction = "t";
                shapeA.y += oY;
            } else {
                direction = "b";
                shapeA.y -= oY;
            }
        } else {
            if (vX > 0) {
                direction = "l";
                shapeA.x += oX;
            } else {
                direction = "r";
                shapeA.x -= oX;
            }
        }
    }
    return direction;
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});

document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

function debug() {
    var textX = textY = 40,
    lineHeight = 15,
    messages = [];
    fill(255);

    messages.push("player.x: " + player.x + " player.y: " + player.y);
    messages.push("player.velocity.x: " + player.velocity.x + " player.velocity.y: " + player.velocity.y);
    messages.push("player.jumping: " + player.jumping);
    messages.push("player.doubleJumping: " + player.doubleJumping);
    messages.push("player.grounded: " + player.grounded);

    for (var i  = 0; i < messages.length; i++) {
        fill(0);
        text(messages[i], textX, textY + lineHeight * i);
    }
}
