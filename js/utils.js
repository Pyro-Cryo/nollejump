"use strict";
function screenWrap(obj) {
    if (obj.x >= controller.gameArea.rightEdgeInGrid) {
        obj.x -= controller.gameArea.gridWidth;
        return true;
    } else if (obj.x < controller.gameArea.leftEdgeInGrid) {
        obj.x += controller.gameArea.gridWidth;
        return true;
    }
    return false;
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
    const xDiff = Math.abs(obj.x - other.x);
    const halfWidthSum = (obj.width + other.width) / 2;
    return (xDiff <= halfWidthSum || xDiff >= controller.gameArea.gridWidth - halfWidthSum)
        && Math.abs(obj.y - other.y) <= (obj.height + other.height) / 2;
}

function despawnIfBelowBottom(obj, margin = 3) {
    if (obj.y + (obj.height || 0) * margin / 2 < controller.gameArea.bottomEdgeInGrid) {
        obj.despawn();
        return true;
    }
    return false;
}
