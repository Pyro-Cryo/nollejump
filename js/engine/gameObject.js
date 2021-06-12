/**
 * Represents an object with a sprite that can be rotated, scaled or otherwise updated.
 */
class PrerenderedObject {
	// The object's sprite
	static get image() { return null; }
	// The object's sprite's default angle
	static get angle() { return 0; }
	// The minimum angle change for the object to be re-rendered
	static get angleDeltaDegrees() { return 5; }
	// The object's sprite's scale
	static get scale() { return 1; }

	// TODO: Add mirroring logic if needed
	constructor(image = null, angle = null, scale = null, angleDeltaDegrees = null) {
		this.image = image === null ? this.constructor.image : image;
		this._lastDrawnAngle = null;
		this.angle = angle === null ? this.constructor.angle : angle;
		this.scale = scale === null ? this.constructor.scale : scale;
		this.angleDeltaDegrees = angleDeltaDegrees === null ? this.constructor.angleDeltaDegrees : angleDeltaDegrees;
		this._mirror = false;
		// this.mirror = false;

		this._imageDirty = true;
	}

	set image(value) {
		this._image = value;
		this._imageDirty = true;
	}
	get image() {
		return this._image;
	}

	set scale(value) {
		this._scale = value;
		this._imageDirty = true;
	}
	get scale() {
		return this._scale;
	}

	set angle(value) {
		//if (Math.abs(value) > Math.PI / 2)
		//	value -= Math.sign(value) * Math.PI;

		this._angle = value;
		if (this._lastDrawnAngle !== null && Math.abs(this._angle - this._lastDrawnAngle) < this.angleDeltaDegrees * Math.PI / 180)
			return;
		this._imageDirty = true;
	}
	get angle() {
		return this._angle;
	}

	set mirror(value) {
		if (this._mirror === value)
			return;
		this._mirror = value;
		this._imageDirty = true;
	}
	get mirror() {
		return this._mirror;
	}

	/**
	 * Draw the object, re-rendering it if dirty
	 * @param {GameArea} gameArea 
	 * @param {Number} x 
	 * @param {Number} y 
	 */
	draw(gameArea, x, y) {
		if (this._imageDirty)
			this.prerender();
		if (this.imagecache === null)
			return;
		if (this.imagecache.width === 0 || this.imagecache.height === 0)
			return;
		gameArea.draw(this.imagecache, x, y, 0, 1);
	}

	/**
	 * Render the sprite so that it can be drawn without any overhead.
	 */
	prerender() {
		if (this.image === null || (this.image instanceof Image && !this.image.complete)) {
			this.imagecache = null;
			console.warn("Trying to prerender null or non-loaded object");
			return;
		}
		if (!this.imagecache)
			this.imagecache = document.createElement("canvas");
		else
			this.imagecontext.clearRect(0, 0, this.imagecache.width, this.imagecache.height);

		this.imagecache.height = Math.ceil((this.image.height * Math.abs(Math.cos(this.angle)) + this.image.width * Math.abs(Math.sin(this.angle))) * this.scale);
		this.imagecache.width = Math.ceil((this.image.height * Math.abs(Math.sin(this.angle)) + this.image.width * Math.abs(Math.cos(this.angle))) * this.scale);
		this.imagecontext = this.imagecache.getContext("2d");

		this.imagecontext.translate(this.imagecache.width / 2, this.imagecache.height / 2);
		this.imagecontext.rotate(this.angle);

		// if (this.mirror) {
		// 	this.imagecontext.translate(this.imagecache.width, 0);
		// 	this.imagecontext.scale(-1, 1);
		// }

		this.imagecontext.drawImage(
			this.image, -this.image.width * this.scale / 2, -this.image.height * this.scale / 2,
			this.image.width * this.scale, this.image.height * this.scale
		);

		this._imageDirty = false;
		this._lastDrawnAngle = this.angle;
	}
}

class GameObject extends PrerenderedObject {
	constructor(x, y, image = null, angle = null, scale = null, register = true) {
		super(image, angle, scale);
		this.x = x;
		this.y = y;
		this.id = null;

		this.despawnTimer = -1;

		if (register)
			Controller.instance.registerObject(this);
	}

	update(delta) {
		if (this.despawnTimer >= 0) {
			if (--this.despawnTimer <= 0) {
				this.despawn();
			}
		}
	}

	/**
	 * Draw the object
	 * @param {GameArea} gameArea 
	 */
	draw(gameArea) {
		super.draw(gameArea, this.x, this.y);
	}

	despawn() {
		this.id = null;
	}
}

class EffectObject extends GameObject {
	constructor(x, y, image = null, angle = null, scale = null, register = true) {
		super(x, y, image, angle, scale, register);
		// Status effects currently affecting this object
		this.effects = new Set();
	}

	update(delta) {
		// Apply status effects
		this.effects.forEach(function (obj) {
			obj.update(this);
		}.bind(this));

		super.update(delta);
	}

	draw(gameArea) {
		super.draw(gameArea);
		
		var index = 0;
		this.effects.forEach(function (obj) {
			index = obj.draw(this, gameArea, index);
		}.bind(this));
	}

	addEffect(effect) {
		for (var it = this.effects.values(), val = null; val = it.next().value;) {
			if (val.constructor === effect.constructor) {
				val.cdtime = effect.cooldown;
				return;
			}
		}

		this.effects.add(effect);
		effect.init(this);
	}

	removeEffect(effect) {
		this.effects.delete(effect);
	}
}

class BaseEffect extends PrerenderedObject {
	static get maxInvocations() { return 10; }
	static get image() { return null; }
	static get scale() { return 1; }

	constructor(cooldown) {
		super(null, 1, 0);

		this.image = this.constructor.image;
		this.scale = this.constructor.scale;

		this.cooldown = cooldown;
		this.cdtime = this.cooldown;
		this.timesinitialized = 0;

		this.invocations = 0;
	}

	init(object) {
		this.timesinitialized++;
	}

	update(object) {
		if (this.cdtime-- <= 0) {
			this.cdtime = this.cooldown;
			this.apply(object);

			if (++this.invocations >= this.constructor.maxInvocations)
				this.remove(object);
		}
	}

	draw(object, gameArea, index) {
		let x = object.x + 0.5 - 0.3 * index;
		let y = object.y - 0.5;

		super.draw(gameArea, x, y);
		return index + 1;
	}

	apply(object) {}

	remove(object) {
		object.removeEffect(this);
	}
}