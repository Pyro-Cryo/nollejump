class Token extends GameObject {
	static get despawnIfBelowBottom() { return true; }
	constructor(x, y, trackedObj = null, register = true) {
		super(x, y, null, null, null, register);
		this.level = null; // Assignas av regionen som spawnar objektet
		this.trackedObj = trackedObj;
		this.xOffset = x;
		this.yOffset = y;
		if (this.trackedObj) {
			this.x = this.trackedObj.x + this.xOffset;
			this.y = this.trackedObj.y + this.yOffset;
		}
	}

	onCollision(player) {
		this.despawn();
		this.level.tokenPickup(this.constructor);
	}

	update(delta) {
		super.update(delta);
		if (this.trackedObj) {
			this.x = this.trackedObj.x + this.xOffset;
			this.y = this.trackedObj.y + this.yOffset;
		}

		if (controller.screenWrap)
			screenWrap(this);

		// Så inte Ingenjörsfärdigheter smälter min cpu
		if (this.constructor.despawnIfBelowBottom)
			despawnIfBelowBottom(this); 
	}

	draw(gameArea) {
		super.draw(gameArea);
		if (controller.screenWrap)
			drawScreenWrap(gameArea, this, super.draw.bind(this));
	}

	register() {
		super.register();
		controller.player.addCollidible(this);
	}
}

const homeworkImg = Resource.addAsset("img/page_green.png");
class Homework extends Token {
	static get image() { return Resource.getAsset(homeworkImg); }
	static get scale() { return 0.25; }
	// Så Morris kan spela också
	static get angle() { return 10 * Math.PI / 180; }
}

const ksImg = Resource.addAsset("img/page_blue.png");
class KS extends Token {
	static get image() { return Resource.getAsset(ksImg); }
	static get scale() { return 0.25; }
	static get angle() { return -10 * Math.PI / 180; }
}

const tentaImg = Resource.addAsset("img/page_red.png");
class Tenta extends Token {
	static get image() { return Resource.getAsset(tentaImg); }
	static get scale() { return 0.25; }
	static get angle() { return 0; }
}

class YeetedTenta extends Tenta {
	static get despawnIfBelowBottom() { return false; }
	
	constructor(x,y,vx,vy){
		super(x,y);

		this.physics = new StandardPhysics(this);
		this.physics.gy /= 2;
		this.physics.setSpeed(vx, vy);
		this.angularVelocity = (Math.random() * 0.01 + 0.005) * (Math.random() < 0.5 ? 1 : -1);
	}

	update(delta) {
		super.update(delta);
		this.angle += this.angularVelocity * delta;
		
		if (this.vy < 0)
			despawnIfBelowBottom(this);
	}

	draw(gameArea) {
		super.draw(gameArea);
		if (controller.screenWrap)
			drawScreenWrap(gameArea, this, super.draw.bind(this));
	}
}

const winImg = Resource.addAsset("img/win.png");
class StudentHat extends Token {
	static get image() { return Resource.getAsset(winImg); }
	static get scale() { return 0.25; }

	constructor(x, y, trackedObj = null) {
		super(x, y, trackedObj);
		this.hasBeenPickedUp = false;
	}

	onCollision(player) {
		if (!this.hasBeenPickedUp) {
			this.hasBeenPickedUp = true;
			this.despawnTimer = 300;
			controller.playerWon();
		}
	}
}