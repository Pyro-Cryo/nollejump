const platformImg = Resource.addAsset("img/oneliner.png");
class Platform extends EffectObject {
	static get image() { return Resource.getAsset(platformImg); }
	static get scale() { return 0.1; }
	static get despawnMargin() { return 100; }

	constructor(x, y) {
		super(x, y);
		this.despawnMargin = this.constructor.despawnMargin;
		if (this._imageDirty)
			this.prerender();
	}

	/**
	 * 
	 * @param {JumpPlayer} player 
	 */
	onCollision(player) {
		// If the player was above us and is going down
		if (player.speedVertical < 0 && player.lastY - player.height / 2 >= this.y + this.height / 2)
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

		if (this.y < controller.gameArea.bottomEdgeInGrid - this.despawnMargin)
			this.despawn();
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
		// Screen wrapping
		if (this.x - this.width < controller.gameArea.leftEdgeInGrid) {
			this.x += controller.gameArea.gridWidth;
			super.draw(gameArea);
			this.x -= controller.gameArea.gridWidth;
		} else if (this.x + this.width >= controller.gameArea.rightEdgeInGrid) {
			this.x -= controller.gameArea.gridWidth;
			super.draw(gameArea);
			this.x += controller.gameArea.gridWidth;
		}
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

		if (this.x < controller.gameArea.leftEdgeInGrid) {
			this.x += controller.gameArea.gridWidth;
		} else if (this.x >= controller.gameArea.rightEdgeInGrid) {
			this.x -= controller.gameArea.gridWidth;
		}
	}
}