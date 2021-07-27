const ctfysImg = Resource.addAsset("img/ctfys.jpg");
class CTFYSRight extends GameObject {
    static get image() { return Resource.getAsset(ctfysImg); }
    static get scale() { return 0.35; }

    constructor(x, y) {
        super(x, y);
    }

    update(delta) {
        super.update(delta);
        
		if (controller.screenWrap)
            despawnIfBelowBottom(this);
    }
}

const ctmatImg = Resource.addAsset("img/ctmat.jpg");
class CTMATLeft extends CTFYSRight {
    static get image() { return Resource.getAsset(ctmatImg); }
}

class Hint extends GameObject {
    constructor(x, y, text, angle = null, scale = null, font = null, color = null, trackedObj = null) {
        const _x = (trackedObj === null ? 0 : trackedObj.x) + x;
        const _y = (trackedObj === null ? 0 : trackedObj.y) + y;
        super(_x, _y, null, angle, scale, false);
        this.xOffset = x;
        this.yOffset = y;
        this.trackedObj = trackedObj;
        this._text = text;
        this._font = font;
        this._color = color;
        this._textDirty = true;
        controller.registerObject(this, false, true);
    }

    static get text() {
        return this._text;
    }

    static set text(value) {
        this._text = value;
        this._imageDirty = true;
        this._textDirty = true;
    }

    static get font() {
        return this._font;
    }

    static set font(value) {
        this._font = value;
		this._imageDirty = true;
        this._textDirty = true;
    }

    static get color() {
        return this._color;
    }

    static set color(value) {
        this._color = value;
		this._imageDirty = true;
        this._textDirty = true;
    }

    update(delta) {
        super.update(delta);
        if (this.trackedObj !== null) {
            this.x = this.trackedObj.x + this.xOffset;
            this.y = this.trackedObj.y + this.yOffset;
        }
    }

    prerender() {
        if (this._textDirty) {
            if (this.image)
                this.image.getContext("2d").clearRect(0, 0, this.image.width, this.image.height);
            else
                this.image = document.createElement("canvas");
            let ctx = this.image.getContext("2d");
            ctx.font = this._font;
            // ctx.textAlign = "center";
            // ctx.textBaseline = "bottom";
            const metrics = ctx.measureText(this._text);
            this.image.width = metrics.width;
            if (metrics.hasOwnProperty("actualBoundingBoxAscent") && metrics.hasOwnProperty("actualBoundingBoxDescent"))
                this.image.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
            else {
                const match = this._font.match(/([\d.]+)px/);
                if (match)
                    this.image.height = match[1];
                else
                    throw new Error("Could not compute height");
            }
            ctx = this.image.getContext("2d");
            ctx.fillStyle = this._color;
            ctx.font = this._font;
            ctx.textBaseline = "bottom";
            
            ctx.fillText(this._text, 0, this.image.height);
            this._textDirty = false;
        }

        super.prerender();
    }

    // prerender() {
    //     if (!this.imagecache)
	// 		this.imagecache = document.createElement("canvas");
	// 	else
    //         this.imagecontext.clearRect(0, 0, this.imagecache.width, this.imagecache.height);
        
    //     this.imagecontext = this.imagecache.getContext("2d");
    //     this.imagecontext.font = this._font;
    //     this.imagecontext.textAlign = "center";
    //     this.imagecontext.textBaseline = "middle";
    //     const metrics = this.imagecontext.measureText(this._text);
    //     const width = metrics.width;
    //     const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        
	// 	this.imagecache.width = Math.ceil((height * Math.abs(Math.sin(this.angle)) + width * Math.abs(Math.cos(this.angle)))/* * this.scale*/);
    //     this.imagecache.height = Math.ceil((height * Math.abs(Math.cos(this.angle)) + width * Math.abs(Math.sin(this.angle)))/* * this.scale*/);
    //     this.imagecontext = this.imagecache.getContext("2d");
        
	// 	this.imagecontext.translate(this.imagecache.width / 2, this.imagecache.height / 2);
    //     this.imagecontext.rotate(this.angle);
        
    //     this.imagecontext.fillStyle = this._color;
    //     this.imagecontext.font = this._font;
    //     this.imagecontext.textAlign = "center";
    //     this.imagecontext.textBaseline = "middle";

    //     console.log(width, height, metrics, this.imagecache.style.lineHeight);
    //     this.imagecontext.fillText(this._text, 0, 0);
    //     // this.imagecontext.fillRect(-this.imagecache.width / 2, this.imagecache.height / 2, 5, 5);
    //     document.body.appendChild(this.imagecache);
    //     this.imagecache.style = "border: 1px solid red";

	// 	this._imageDirty = false;
	// 	this._lastDrawnAngle = this.angle;
    // }
}