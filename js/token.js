class Token extends GameObject {
	constructor(x, y) {
		super(x, y);
		controller.player.addCollidible(this);
		this.level = null; // Assignas av regionen som spawnar objektet
	}

	onCollision(player) {
		this.despawn();
		this.level.tokenPickup(this.constructor);
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
cyberfohslog(`Laddat ${document.currentScript.src}`);
