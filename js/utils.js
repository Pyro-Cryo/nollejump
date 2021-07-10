function screenWrap(obj) {
    if (obj.x >= controller.gameArea.rightEdgeInGrid) {
        obj.x -= controller.gameArea.gridWidth;
    } else if (obj.x < controller.gameArea.leftEdgeInGrid) {
        obj.x += controller.gameArea.gridWidth;
    }
}

function drawScreenWrap(gameArea, obj, superDraw) {
    if (obj.x - obj.width < gameArea.leftEdgeInGrid) {
        obj.x += gameArea.gridWidth;
        superDraw(gameArea);
        obj.x -= gameArea.gridWidth;
    } else if (obj.x + obj.width >= gameArea.rightEdgeInGrid) {
        obj.x -= gameArea.gridWidth;
        superDraw(gameArea);
        obj.x += gameArea.gridWidth;
    }
}

function collisionCheckScreenWrap(obj, other) {
    return (Math.abs(obj.x - other.x) <= (obj.width + other.width) / 2
        || Math.abs(obj.x - other.x) >= controller.gameArea.gridWidth - (obj.width + other.width) / 2)
        && Math.abs(obj.y - other.y) <= (obj.height + other.height) / 2;
}