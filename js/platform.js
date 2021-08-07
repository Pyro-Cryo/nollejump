const platformImg = Resource.addAsset("img/oneliner.png");
class Platform extends EffectObject {
	static get image() { return Resource.getAsset(platformImg); }
	static get scale() { return 0.1; }

	constructor(x, y) {
		super(x, y);
		if (this._imageDirty)	// Behövs verkligen det här?
			this.prerender();

		if (controller.player)
			controller.player.addCollidible(this);
	}

	/**
	 * 
	 * @param {JumpPlayer} player 
	 */
	onCollision(player) {
		// If the player was above us and is going down
		if (player.physics.vy < 0 && player.lastY - player.height / 2 >= this.y + this.height / 2)
			this.onPlayerBounce(player);
		else
			this.onPlayerPass(player);
	}

	onPlayerBounce(player) {
		player.y = this.y + this.height / 2 + player.height / 2;
		player.standardBounce();
	}

	onPlayerPass(player) {}

	update(delta) {
		super.update(delta);

		// Inte intuitivt uppenbart varför vi avstår om man inte screenwrappar
		// men tanken är att man ska kunna hoppa tillbaka
		if (controller.screenWrap)
			despawnIfBelowBottom(this);
	}

	draw(gameArea) {
		if (this._imageDirty) {
			const length = 1.41 * this.scale * Math.max(this.image.width, this.image.height);
			if (!gameArea.isInFrame(this.x, this.y, length, length, true))
				return;
		} else {
			if (!gameArea.isInFrame(this.x, this.y, this.width, this.height, true))
				return;
		}

		super.draw(gameArea);
		if (controller.screenWrap)
			drawScreenWrap(gameArea, this, super.draw.bind(this));
	}
}

class BasicMovingPlatform extends Platform {
	constructor(x, y) {
		super(x, y);
		new BasicAnimation(this)
			.set({x: x})
			.after(1).set({x: x - 100})
			.after(2).set({x: x + 100})
			.after(1).loop()
			.start();
	}

	update(delta) {
		super.update(delta);
		if (controller.screenWrap)
			screenWrap(this);
	}
}

class FakePlatform extends Platform {

	static get scale() { return 0.12; }

	onCollision(player) {
		if (player.physics.vy < 0 && player.lastY - player.height / 2 >= this.y + this.height / 2){
			this.physics = new PlayerPhysics(this);
		}
		this.onPlayerPass(player);
	}

}
