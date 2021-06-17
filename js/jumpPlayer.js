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
			[CAMERA_TRACKING_INFRAME, 100, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
			null,
			null,
			null,
			false
		);
		this.speedHorizontal = 0;
		this.maxSpeedHorizontal = 0.8;
		this.accelerationHorizontal = 0.003;
		this.decayHorizontal = 0.004;

		this.speedVertical = -0.1;
		this.accelerationVertical = 0.003;
		this.jumpSpeed = 1.5;

		this.lastX = x;
		this.lastY = y;

		this.collidibles = new LinkedList();
		controller.registerObject(this, false, true);
	}

	standardBounce() {
		this.speedVertical = -this.jumpSpeed;
	}

	// TODO: implement shooting
	shoot() {
		this.standardBounce();
	}

	addCollidible(gameObject) {
		this.collidibles.push(gameObject);
	}

	// TODO: bör kolla även andra sidan skärmen vid screen wrapping
	collisionCheck() {
		for (const obj of this.collidibles.filterIterate(obj => obj.id !== null)) {
			if (Math.abs(this.x - obj.x) <= (this.width + obj.width) / 2
					&& Math.abs(this.y - obj.y) <= (this.height + obj.height) / 2) {
				obj.onCollision(this);
			}
		}
	}

	translate(dx, dy){
		super.translate(dx, dy);
		this.lastX += dx;
		this.lastY += dy;
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
			this.shoot();
		}

		this.speedVertical += this.accelerationVertical * delta;
		this.x += this.speedHorizontal * delta;
		this.y += this.speedVertical * delta;
		
		// Trillar man ner förlorar man
		if (this.y >= controller.gameArea.drawOffsetY + controller.gameArea.gridHeight + 3 * this.height / controller.gameArea.unitHeight) {
			this.despawn();
			alert("ded");
		}
		
		// Screen wrapping
		if (this.x >= controller.gameArea.gridWidth) {
			this.x -= controller.gameArea.gridWidth;
		} else if (this.x < 0) {
			this.x += controller.gameArea.gridWidth;
		}

		this.collisionCheck();
		this.lastX = this.x;
		this.lastY = this.y;
	}

	draw(gameArea) {
		super.draw(gameArea);

		// Screen wrapping
		if (this.x - this.width < 0) {
			this.x += controller.gameArea.gridWidth;
			super.draw(gameArea);
			this.x -= controller.gameArea.gridWidth;
		} else if (this.x + this.width >= controller.gameArea.gridWidth) {
			this.x -= controller.gameArea.gridWidth;
			super.draw(gameArea);
			this.x += controller.gameArea.gridWidth;
		}
	}
}