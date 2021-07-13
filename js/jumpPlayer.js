const cornImg = Resource.addAsset("img/corn.png");
class JumpPlayer extends Player {
	static get image() { return Resource.getAsset(cornImg); }
	
	static ACTION_GO_LEFT = 1;
	static ACTION_GO_RIGHT = 2;
	static ACTION_SHOOT = 3;

	constructor(x, y) {
		super(
			x,
			y,
			new Map([
				["KeyA", JumpPlayer.ACTION_GO_LEFT],
				["ArrowLeft", JumpPlayer.ACTION_GO_LEFT],
				["KeyD", JumpPlayer.ACTION_GO_RIGHT],
				["ArrowRight", JumpPlayer.ACTION_GO_RIGHT],
				["Space", JumpPlayer.ACTION_SHOOT]
			]),
			[
				Player.CAMERA_TRACKING_INFRAME,
				100, // Margin top
				Number.NEGATIVE_INFINITY, // Margin right
				Number.NEGATIVE_INFINITY, // Margin bottom
				Number.NEGATIVE_INFINITY // Margin left
			],
			null,
			null,
			null,
			false
		);
		this.speedHorizontal = 0;
		this.maxSpeedHorizontal = 0.8;
		this.accelerationHorizontal = 0.004;
		this.decayHorizontal = 0.003;

		this.speedVertical = 0.1;
		this.accelerationVertical = -0.003;
		this.jumpSpeed = 1.5;

		this.lastX = x;
		this.lastY = y;

		this.shootCooldown = 0;
		this.shootCooldownTime = 40; //ms, rimligare med 400 typ
		controller.gameArea.canvas.addEventListener("click", e => {
			this.shoot();
			e.preventDefault();
		}, true);

		this.collidibles = new LinkedList();
		controller.registerObject(this, false, true);

		this.useTiltControls = true;
	}

	standardBounce() {
		this.speedVertical = this.jumpSpeed;
	}

	shoot() {
		if (!this.shootCooldown) {
			const t = (this.y - controller.gameArea.bottomEdgeInGrid) / controller.gameArea.gridHeight;
			new Pellet(
				this.x,
				this.y,
				(Math.random() - 0.5) * 0.6,
				1.7 + t * (0.8 - 1.7));
			this.shootCooldown = this.shootCooldownTime;
		}
	}

	addCollidible(gameObject) {
		this.collidibles.push(gameObject);
	}

	collisionCheck() {
		for (const obj of this.collidibles.filterIterate(obj => obj.id !== null)) {
			if (collisionCheckScreenWrap(this, obj)) {
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

		if (this.useTiltControls) {
			this.speedHorizontal = this.deviceTilt * this.maxSpeedHorizontal;
		}

		if (this.isPressed.get(JumpPlayer.ACTION_GO_RIGHT)) {
			this.useTiltControls = false;
			this.speedHorizontal = Math.min(
				this.speedHorizontal + this.accelerationHorizontal * delta,
				this.maxSpeedHorizontal);
		}
		if (this.isPressed.get(JumpPlayer.ACTION_GO_LEFT)) {
			this.useTiltControls = false;
			this.speedHorizontal = Math.max(
				this.speedHorizontal - this.accelerationHorizontal * delta,
				-this.maxSpeedHorizontal);
		}
		if (!this.isPressed.get(JumpPlayer.ACTION_GO_LEFT) && !this.isPressed.get(JumpPlayer.ACTION_GO_RIGHT)) {
			this.speedHorizontal = Math.sign(this.speedHorizontal) * Math.max(0, Math.abs(this.speedHorizontal) - this.decayHorizontal * delta);
		}

		if (this.isPressed.get(JumpPlayer.ACTION_SHOOT))
			this.shoot();

		this.speedVertical += this.accelerationVertical * delta;
		this.x += this.speedHorizontal * delta;
		this.y += this.speedVertical * delta;
		
		// Trillar man ner förlorar man
		if (this.y <= controller.gameArea.bottomEdgeInGrid - 2 * this.height) {
			this.despawn();
			console.log("ded");
		}
		
		screenWrap(this);

		this.collisionCheck();
		this.lastX = this.x;
		this.lastY = this.y;

		this.shootCooldown = Math.max(0, this.shootCooldown - delta);
	}

	draw(gameArea) {
		super.draw(gameArea);

		// Screen wrapping
		drawScreenWrap(gameArea, this, super.draw.bind(this));
	}
}