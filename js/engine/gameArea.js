class GameArea {
    constructor(canvas, gridWidth, gridHeight) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");

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

            this._unitWidth = this.gridToCanvasX(1) - this.gridToCanvasX(0);
            this._unitHeight = this.gridToCanvasY(1) - this.gridToCanvasY(0);
            this._scaleFactor = Math.sqrt((Math.pow(this.unitWidth, 2) + Math.pow(this.unitHeight, 2)) / 2);
        }
        else {
            throw new Error(`Either set both gridWidth and gridHeight to null, or neither: ${gridWidth} x ${gridHeight}`);
        }

        // Draw offset in grid coordinate units
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

    gridToCanvasX(x) {
        return (x + 0.5) * this.canvas.width / this._gridWidth;
    }
    gridToCanvasY(y) {
        return (y + 0.5) * this.canvas.height / this._gridHeight;
    }

    canvasToGridX(x) {
        return (x * this._gridWidth / this.canvas.width) - 0.5;
    }
    canvasToGridY(y) {
        return (y * this._gridHeight / this.canvas.height) - 0.5;
    }

    resetDrawOffset() {
        this.drawOffsetX = 0;
        this.drawOffsetY = 0;
    }

    centerCameraOn(_x, _y, horizontally = true, vertically = true) {
        if (horizontally)
            this.drawOffsetX = _x - this.gridWidth / 2;
        if (vertically)
            this.drawOffsetY = _y - this.gridHeight / 2;
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

        const xLeft = this.gridToCanvasX(_x - width / 2);
        const xRight = this.gridToCanvasX(_x + width / 2);
        const yTop = this.gridToCanvasY(_y - height / 2);
        const yBottom = this.gridToCanvasY(_y + height / 2);

        if (xLeft - this.drawOffsetX < marginLeft) {
            this.drawOffsetX = xLeft - marginLeft;
        }
        else if (this.drawOffsetX + this.canvas.width - xRight < marginRight) {
            this.drawOffsetX = xRight + marginRight - this.canvas.width;
        }
        if (yTop - this.drawOffsetY < marginTop)
            this.drawOffsetY = yTop - marginTop;
        else if (this.drawOffsetY + this.canvas.height - yBottom < marginBottom)
            this.drawOffsetY = yBottom + marginBottom - this.canvas.height;
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draws an image centered around (x, y) with the specified angle (in radians) and scale
    draw(image, _x, _y, angle, scale, considerOffset = true) {
        const x = this.gridToCanvasX(_x - considerOffset * this.drawOffsetX);
        const y = this.gridToCanvasY(_y - considerOffset * this.drawOffsetY);
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
        const x = this.gridToCanvasX(_x - considerOffset * this.drawOffsetX);
        const y = this.gridToCanvasY(_y - considerOffset * this.drawOffsetY);
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
        const x = this.gridToCanvasX(_x - considerOffset * this.drawOffsetX);
        const y = this.gridToCanvasY(_y - considerOffset * this.drawOffsetY);
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
        const x = this.gridToCanvasX(_x - width / 2 - considerOffset * this.drawOffsetX);
        const y = this.gridToCanvasY(_y - height / 2 - considerOffset * this.drawOffsetY);
        const fillStyle = this.context.fillStyle;
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width * this.unitWidth, height * this.unitHeight);
        this.context.fillStyle = fillStyle;
    }

    bar(_x, _y, offset, length, width, ratio, fgColor = "#FF0000", bgColor = "#00FF00", considerOffset = true) {
        const x = this.gridToCanvasX(_x - considerOffset * this.drawOffsetX);
        const y = this.gridToCanvasY(_y - considerOffset * this.drawOffsetY);
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