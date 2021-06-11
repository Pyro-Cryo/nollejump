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

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    //Draws an image centered around (x, y) with the specified angle (in radians) and scale
    draw(image, _x, _y, angle, scale) {
        let x = this.gridToCanvasX(_x);
        let y = this.gridToCanvasY(_y);
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

    //Draws a subimage from an image, centered around (x, y) with the specified angle (in radians) and scale
    drawSubimage(image, subimageIndex, subimageWidth, _x, _y, angle, scale) {
        let x = this.gridToCanvasX(_x);
        let y = this.gridToCanvasY(_y);
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

    disc(_x, _y, radius, color = "#000000") {
        let x = this.gridToCanvasX(_x);
        let y = this.gridToCanvasY(_y);
        let fillStyle = this.context.fillStyle;
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.arc(x, y, radius * this._scaleFactor, 0, 2 * Math.PI);
        this.context.fill();
        this.context.fillStyle = fillStyle;
    }

    square(_x, _y, color = "#000000") {
        let x = this.gridToCanvasX(_x - 0.5);
        let y = this.gridToCanvasY(_y - 0.5);
        let fillStyle = this.context.fillStyle;
        this.context.fillStyle = color;
        this.context.fillRect(x, y, this.unitWidth, this.unitHeight);
        this.context.fillStyle = fillStyle;
    }

    bar(_x, _y, offset, length, width, ratio, fgColor = "#FF0000", bgColor = "#00FF00") {
        let x = this.gridToCanvasX(_x);
        let y = this.gridToCanvasY(_y);
        offset *= this.unitHeight;
        length *= this.unitWidth;
        let fillStyle = this.context.fillStyle;
        this.context.fillStyle = bgColor;
        this.context.fillRect(x - length / 2, y + offset, length, width);
        this.context.fillStyle = fgColor;
        this.context.fillRect(x - length / 2, y + offset, length * ratio, width);
        this.context.fillStyle = fillStyle;
    }
}