const _GRID_ORIGIN_REVERSE_X = 0b01;
const _GRID_ORIGIN_REVERSE_Y = 0b10;
const GRID_ORIGIN_UPPER_LEFT = 0;
const GRID_ORIGIN_LOWER_LEFT = _GRID_ORIGIN_REVERSE_Y;
const GRID_ORIGIN_UPPER_RIGHT = _GRID_ORIGIN_REVERSE_X;
const GRID_ORIGIN_LOWER_RIGHT = _GRID_ORIGIN_REVERSE_X | _GRID_ORIGIN_REVERSE_Y;

class GameArea {
    constructor(canvas, gridWidth, gridHeight, gridOrigin = GRID_ORIGIN_UPPER_LEFT) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.gridOrigin = gridOrigin;

        if (gridWidth === null && gridHeight === null) {
            this._usesGrid = false;
            this._gridWidth = this.canvas.width;
            this._gridHeight = this.canvas.height;

            this._unitWidth = 1;
            this._unitHeight = 1;
            this._scaleFactor = 1;
        }
        else if (gridWidth !== null && gridHeight !== null) {
            this._usesGrid = true;
            this._gridWidth = gridWidth;
            this._gridHeight = gridHeight;

            this._unitWidth = Math.abs(this.gridToCanvasX(1) - this.gridToCanvasX(0));
            this._unitHeight = Math.abs(this.gridToCanvasY(1) - this.gridToCanvasY(0));
            this._scaleFactor = Math.sqrt((Math.pow(this.unitWidth, 2) + Math.pow(this.unitHeight, 2)) / 2);
        }
        else {
            throw new Error(`Either set both gridWidth and gridHeight to null, or neither: ${gridWidth} x ${gridHeight}`);
        }

        // Draw offset in canvas units
        this.drawOffsetX = 0;
        this.drawOffsetY = 0;
    }

    set width(value) {
        this.canvas.width = value;
        if (!this.usesGrid)
            this._gridWidth = value;
    }
    get width() {
        return this.canvas.width;
    }

    set height(value) {
        this.canvas.height = value;
        if (!this.usesGrid)
            this._gridHeight = value;
    }
    get height() {
        return this.canvas.height;
    }

    get unitWidth() {
        return this._unitWidth;
    }

    get unitHeight() {
        return this._unitHeight;
    }

    get scaleFactor() {
        return this._scaleFactor;
    }

    get usesGrid() {
        return this._usesGrid;
    }

    set gridWidth(value) {
        this._gridWidth = value;
        if (!this._usesGrid)
            this.canvas.width = value;
    }
    get gridWidth() {
        return this._gridWidth;
    }

    set gridHeight(value) {
        this._gridHeight = value;
        if (!this._usesGrid)
            this.canvas.height = value;
    }
    get gridHeight() {
        return this._gridHeight;
    }

    // TODO: borde dessa räkna med drawOffset? Jag lutar åt ja
    gridToCanvasX(x) {
        if (this.gridOrigin & _GRID_ORIGIN_REVERSE_X)
            return this.canvas.width * (1 - (x + 0.5) / this._gridWidth);
        else
            return this.canvas.width * (x + 0.5) / this._gridWidth;
    }
    gridToCanvasY(y) {
        if (this.gridOrigin & _GRID_ORIGIN_REVERSE_Y)
            return this.canvas.height * (1 - (y + 0.5) / this._gridHeight);
        else
            return this.canvas.height * (y + 0.5) / this._gridHeight;
    }

    canvasToGridX(x) {
        if (this.gridOrigin & _GRID_ORIGIN_REVERSE_X)
            return (1 - x / this.canvas.width) * this._gridWidth - 0.5;
        else
            return x / this.canvas.width * this._gridWidth - 0.5;
    }
    canvasToGridY(y) {
        if (this.gridOrigin & _GRID_ORIGIN_REVERSE_Y)
            return (1 - y / this.canvas.height) * this._gridHeight - 0.5;
        else
            return y / this.canvas.height * this._gridHeight - 0.5;
    }

    get leftEdgeInGrid() {
        return this.canvasToGridY(this.drawOffsetY);
    }
    get rightEdgeInGrid() {
        return this.canvasToGridY(this.canvas.width - this.drawOffsetY);
    }

    get topEdgeInGrid() {
        return this.canvasToGridY(this.drawOffsetY);
    }
    get bottomEdgeInGrid() {
        return this.canvasToGridY(this.canvas.height - this.drawOffsetY);
    }

    resetDrawOffset() {
        this.drawOffsetX = 0;
        this.drawOffsetY = 0;
    }

    centerCameraOn(_x, _y, horizontally = true, vertically = true) {
        if (horizontally)
            this.drawOffsetX = -this.gridToCanvasX(_x) + this.canvas.width / 2;
        if (vertically)
            this.drawOffsetY = -this.gridToCanvasY(_y) + this.canvas.height / 2;
    }

    keepInFrame(_x, _y, width = 0, height = null, marginTop = 0, marginRight = null, marginBottom = null, marginLeft = null) {
        if (height === null)
            height = width;
        if (marginRight === null)
            marginRight = marginTop;
        if (marginBottom === null)
            marginBottom = marginTop;
        if (marginLeft === null)
            marginLeft = marginRight;

        const xLeft = this.gridToCanvasX(_x) - width * this._unitWidth / 2;
        const xRight = this.gridToCanvasX(_x) + width * this._unitWidth / 2;
        const yTop = this.gridToCanvasY(_y) - height * this._unitWidth / 2;
        const yBottom = this.gridToCanvasY(_y) + height * this._unitWidth / 2;

        if (xLeft + this.drawOffsetX < marginLeft)
            this.drawOffsetX = -xLeft + marginLeft;
        else if (this.canvas.width - (xRight + this.drawOffsetX) < marginRight)
            this.drawOffsetX = -xRight - marginRight + this.canvas.width;
        if (yTop + this.drawOffsetY < marginTop)
            this.drawOffsetY = -yTop + marginTop;
        else if (this.canvas.height - (yBottom + this.drawOffsetY) < marginBottom)
            this.drawOffsetY = -yBottom - marginBottom + this.canvas.height;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draws an image centered around (x, y) with the specified angle (in radians) and scale
    draw(image, _x, _y, angle, scale, considerOffset = true) {
        const x = this.gridToCanvasX(_x) + considerOffset * this.drawOffsetX;
        const y = this.gridToCanvasY(_y) + considerOffset * this.drawOffsetY;
        if (!angle) {
            if (scale == 1)
                this.context.drawImage(
                    image,
                    Math.floor(x - image.width / 2), Math.floor(y - image.height / 2)
                );
            else
                this.context.drawImage(
                    image,
                    Math.floor(x - image.width * scale / 2), Math.floor(y - image.height * scale / 2),
                    Math.floor(image.width * scale), Math.floor(image.height * scale)
                );
        }
        else {
            this.context.translate(Math.floor(x), Math.floor(y));
            this.context.rotate(angle);
            if (scale == 1)
                this.context.drawImage(
                    image,
                    - Math.floor(image.width / 2), - Math.floor(image.height / 2)
                );
            else
                this.context.drawImage(
                    image,
                    -Math.floor(image.width * scale / 2), -Math.floor(image.height * scale / 2),
                    Math.floor(image.width * scale), Math.floor(image.height * scale)
                );
            this.context.rotate(-angle);
            this.context.translate(-x, -y);
        }
    }

    // Draws a subimage from an image, centered around (x, y) with the specified angle (in radians) and scale
    drawSubimage(image, subimageIndex, subimageWidth, _x, _y, angle, scale, considerOffset) {
        const x = this.gridToCanvasX(_x) + considerOffset * this.drawOffsetX;
        const y = this.gridToCanvasY(_y) + considerOffset * this.drawOffsetY;
        if (!angle) {
            this.context.drawImage(
                image,
                subimageIndex * subimageWidth, 0,
                subimageWidth, image.height,
                x - subimageWidth * scale / 2, y - image.height * scale / 2,
                image.width * scale, image.height * scale
            );
        } else {
            this.context.translate(x, y);
            this.context.rotate(angle);
            this.context.drawImage(
                image,
                subimageIndex * subimageWidth, 0,
                subimageWidth, image.height,
                -subimageWidth * scale / 2, -image.height * scale / 2,
                subimageWidth * scale, image.height * scale
            );
            this.context.rotate(-angle);
            this.context.translate(-x, -y);
        }
    }

    disc(_x, _y, radius = 1, color = "#000000", considerOffset = true) {
        const x = this.gridToCanvasX(_x) + considerOffset * this.drawOffsetX;
        const y = this.gridToCanvasY(_y) + considerOffset * this.drawOffsetY;
        const fillStyle = this.context.fillStyle;
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.arc(x, y, radius * this._scaleFactor, 0, 2 * Math.PI);
        this.context.fill();
        this.context.fillStyle = fillStyle;
    }

    square(_x, _y, side = 1, color = "#000000", considerOffset = true) {
        this.rect(_x, _y, side, side, color, considerOffset);
    }

    rect(_x, _y, width = 1, height = 1, color = "#000000", considerOffset = true) {
        const x = this.gridToCanvasX(_x) - width / 2 + considerOffset * this.drawOffsetX;
        const y = this.gridToCanvasY(_y) - height / 2 + considerOffset * this.drawOffsetY;
        const fillStyle = this.context.fillStyle;
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width * this.unitWidth, height * this.unitHeight);
        this.context.fillStyle = fillStyle;
    }

    bar(_x, _y, offset, length, width, ratio, fgColor = "#FF0000", bgColor = "#00FF00", considerOffset = true) {
        const x = this.gridToCanvasX(_x) + considerOffset * this.drawOffsetX;
        const y = this.gridToCanvasY(_y) + considerOffset * this.drawOffsetY;
        offset *= this.unitHeight;
        length *= this.unitWidth;
        const fillStyle = this.context.fillStyle;
        this.context.fillStyle = bgColor;
        this.context.fillRect(x - length / 2, y + offset, length, width);
        this.context.fillStyle = fgColor;
        this.context.fillRect(x - length / 2, y + offset, length * ratio, width);
        this.context.fillStyle = fillStyle;
    }
}