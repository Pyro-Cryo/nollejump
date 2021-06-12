const ActionGoLeft = 1;
const ActionGoRight = 2;
const ActionShoot = 3;
const cornImg = Resource.addAsset("img/corn.png");
class JumpPlayer extends Player {
	static get image() { return Resource.getAsset(cornImg); }

	constructor(x, y) {
		super(
			x,
			y,
			new Map([
				["KeyA", ActionGoLeft],
				["ArrowLeft", ActionGoLeft],
				["KeyD", ActionGoRight],
				["ArrowRight", ActionGoRight],
				["Space", ActionShoot]
			]),
			[CAMERA_TRACKING_INFRAME, 100, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
		);
		this.speedHorizontal = 0;
		this.maxSpeedHorizontal = 0.8;
		this.accelerationHorizontal = 0.005;
		this.decayHorizontal = 0.012;

		this.speedVertical = -0.1;
		this.accelerationVertical = 0.003;
		this.jumpSpeed = 1.5;
	}

	update(delta) {
		super.update(delta);

		if (this.isPressed.get(ActionGoRight)) {
			this.speedHorizontal = Math.min(
				this.speedHorizontal + this.accelerationHorizontal * delta,
				this.maxSpeedHorizontal);
		}
		if (this.isPressed.get(ActionGoLeft)) {
			this.speedHorizontal = Math.max(
				this.speedHorizontal - this.accelerationHorizontal * delta,
				-this.maxSpeedHorizontal);
		}
		if (!this.isPressed.get(ActionGoLeft) && !this.isPressed.get(ActionGoRight)) {
			this.speedHorizontal = Math.sign(this.speedHorizontal) * Math.max(0, Math.abs(this.speedHorizontal) - this.decayHorizontal * delta);
		}

		if (this.isPressed.get(ActionShoot)) {
			// TODO: implement shooting
			this.speedVertical = -this.jumpSpeed;
		}

		this.speedVertical += this.accelerationVertical * delta;
		this.x += this.speedHorizontal * delta;
		this.y += this.speedVertical * delta;
		
		// TODO: hoppa på plattformar istället
		if (this.y >= controller.gameArea.gridHeight - 100)
			this.speedVertical = -this.jumpSpeed;
		
		// Screen wrapping
		if (this.x >= controller.gameArea.gridWidth) {
			this.x -= controller.gameArea.gridWidth;
		} else if (this.x < 0) {
			this.x += controller.gameArea.gridWidth;
		}
	}

	draw(gameArea) {
		super.draw(gameArea);

		// Screen wrapping
		if (this.x - this.imagecache.width < 0) {
			this.x += controller.gameArea.gridWidth;
			super.draw(gameArea);
			this.x -= controller.gameArea.gridWidth;
		} else if (this.x + this.imagecache.width >= controller.gameArea.gridWidth) {
			this.x -= controller.gameArea.gridWidth;
			super.draw(gameArea);
			this.x += controller.gameArea.gridWidth;
		}
	}
}