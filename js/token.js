class Token extends GameObject {
	constructor(x, y, trackedObj = null) {
		super(x, y);
		controller.player.addCollidible(this);
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
		if (this.trackedObj) {
			this.x = this.trackedObj.x + this.xOffset;
			this.y = this.trackedObj.y + this.yOffset;
		}
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