const platformImg = Resource.addAsset("img/oneliner.png");
class Platform extends EffectObject {
	static get image() { return Resource.getAsset(platformImg); }
	static get scale() { return 0.1; }
	static get despawnMargin() { return 100; }

	constructor(x, y) {
		super(x, y);
		this.despawnMargin = this.constructor.despawnMargin;
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
}