let _JumpPlayer_ACTION_GO_LEFT = 1;
let _JumpPlayer_ACTION_GO_RIGHT = 2;
let _JumpPlayer_ACTION_SHOOT = 3;
let _JumpPlayer_ACTION_SPACEJUMP = 4;
let _JumpPlayer_SCREENWRAP_TRACKING = [
	Player.CAMERA_TRACKING_INFRAME,
	400, // Margin top
	Number.NEGATIVE_INFINITY, // Margin right
	Number.NEGATIVE_INFINITY, // Margin bottom
	Number.NEGATIVE_INFINITY // Margin left
];
let _JumpPlayer_NON_SCREENWRAP_TRACKING = [
	Player.CAMERA_TRACKING_INFRAME,
	100, // Margin top = JumpController.WIDTH_PX / 4
	100, // Margin right
	100, // Margin bottom
	100, // Margin left
]

const jenniejanImg = Resource.addAsset("img/jenniejan.png");
class JumpPlayer extends Player {
	static get image() { return Resource.getAsset(jenniejanImg); }
	static get scale() { return 0.25; }
	
	static get ACTION_GO_LEFT() { return _JumpPlayer_ACTION_GO_LEFT;}
	static set ACTION_GO_LEFT(value) { _JumpPlayer_ACTION_GO_LEFT = value;}
	static get ACTION_GO_RIGHT() { return _JumpPlayer_ACTION_GO_RIGHT;}
	static set ACTION_GO_RIGHT(value) { _JumpPlayer_ACTION_GO_RIGHT = value;}
	static get ACTION_SHOOT() { return _JumpPlayer_ACTION_SHOOT;}
	static set ACTION_SHOOT(value) { _JumpPlayer_ACTION_SHOOT = value;}
	static get ACTION_SPACEJUMP() { return _JumpPlayer_ACTION_SPACEJUMP;}
	static set ACTION_SPACEJUMP(value) { _JumpPlayer_ACTION_SPACEJUMP = value;}
	static get SCREENWRAP_TRACKING() { return _JumpPlayer_SCREENWRAP_TRACKING;}
	static set SCREENWRAP_TRACKING(value) { _JumpPlayer_SCREENWRAP_TRACKING = value;}
	static get NON_SCREENWRAP_TRACKING() { return _JumpPlayer_NON_SCREENWRAP_TRACKING;}
	static set NON_SCREENWRAP_TRACKING(value) { _JumpPlayer_NON_SCREENWRAP_TRACKING = value;}

	constructor(x, y) {
		super(
			x,
			y,
			new Map([
				["KeyA", JumpPlayer.ACTION_GO_LEFT],
				["ArrowLeft", JumpPlayer.ACTION_GO_LEFT],
				["KeyD", JumpPlayer.ACTION_GO_RIGHT],
				["ArrowRight", JumpPlayer.ACTION_GO_RIGHT],
				["Space", JumpPlayer.ACTION_SHOOT],
				[null, JumpPlayer.ACTION_SPACEJUMP]
			]),
			controller.screenWrap ? JumpPlayer.SCREENWRAP_TRACKING : JumpPlayer.NON_SCREENWRAP_TRACKING,
			null,
			null,
			null,
			false
		);

		this.accelerationHorizontal = 40;
		this.physics = new PlayerPhysics(this);

		this.lastX = x;
		this.lastY = y;

		this.shootCooldown = 0;
		this.shootCooldownTime = 250;

		this.spaceJumpCooldown = 0;
		this.spaceJumpCDTime = 500;

		controller.gameArea.canvas.addEventListener("click", e => {
			if (this.deviceTiltAvailable) {
				if (this.keyActionMap.get("Space") === JumpPlayer.ACTION_SHOOT)
					this.shoot();
				else
					this.spaceJump();
				e.preventDefault();
			}
		}, true);

		this.collidibles = new LinkedList();
		this.isDying = false;
		controller.registerObject(this, false, true);

		this.lives = 1;

		this.powers = {
			"shoes": false, 
			"shield": false,
		};

	}

	standardBounce(object) {
		this.y = object.y + object.height/2 + this.height/2;
		if (object === null) 
			this.physics.bounceObject(new PhysicsNull());
		else 
			this.physics.bounceObject(object.physics);
	}

	spaceJump() {
		if(this.physics.vy < 0 && this.spaceJumpCooldown <= 0 && !this.isDying) {
			this.physics.bounceObject(new PhysicsNull());
			this.spaceJumpCooldown += this.spaceJumpCDTime;
		}
	}

	shoot() {
		if (!this.shootCooldown) {
			const t = (this.y - controller.gameArea.bottomEdgeInGrid) / controller.gameArea.gridHeight;
			let xSpeed = ((Math.random() - 0.5) * 0.6) * 80 + this.physics.vx;
			let ySpeed = (2 + t * (1.2 - 2)) * 80 + this.physics.vy * (this.physics.vy > 0 ? 0.8 : 0);
			if (this.angle)
				[xSpeed, ySpeed] = [xSpeed * Math.cos(this.angle) + ySpeed * Math.sin(this.angle), -xSpeed * Math.sin(this.angle) + ySpeed * Math.cos(this.angle)];
			if (this.isDying) {
				xSpeed *= 0.8;
				ySpeed *= 0.8;
			}
			new Pellet(this.x, this.y, xSpeed, ySpeed);
			this.shootCooldown = this.shootCooldownTime;
		}
	}

	addCollidible(gameObject) {
		this.collidibles.push(gameObject);
	}

	collisionCheck() {
		if (this.isDying)
			return;
		for (const obj of this.collidibles.filterIterate(obj => obj.id !== null)) {
			if (controller.screenWrap ? collisionCheckScreenWrap(this, obj) : this.collisionCheckRectangular(obj)) {
				obj.onCollision(this);
			}
		}
	}

	damage() {
		if (this.lives !== -1 && --this.lives == 0)
			this.die();
	}

	onEnemyCollision(enemy){

		if (this.powers["shield"]) 
			return;
		if (this.powers["shoes"] && this.vy < 0 && this.lastY >= enemy.y){

			this.standardBounce(enemy);
			const toRemove = [];
			this.effects.forEach(obj => obj instanceof JumpBoost ? toRemove.push(obj) : null);
			toRemove.forEach(obj => obj.remove(this));
			return;
		}

		this.damage();
	}

	die() {
		this.isDying = true;
		new BasicAnimation(this)
			.set({angle: 0})
			.after(0.5).set({angle: Math.random() < 0.5 ? 2 * Math.PI : -2 * Math.PI})
			.loop().start();
	}

	translate(dx, dy){
		super.translate(dx, dy);
		this.lastX += dx;
		this.lastY += dy;
	}

	update(delta) {
		super.update(delta);

		if (this.deviceTiltAvailable)
			this.physics.setSpeed(this.deviceTilt * this.physics.max_vx, this.physics.vy);
		else {
			if (this.isPressed.get(JumpPlayer.ACTION_GO_RIGHT)) {
				this.physics.accelerate(this.accelerationHorizontal, 0, delta);
			}
			if (this.isPressed.get(JumpPlayer.ACTION_GO_LEFT)) {
				this.physics.accelerate(-this.accelerationHorizontal, 0, delta);
			}

			if (this.isPressed.get(JumpPlayer.ACTION_SHOOT))
				this.shoot();

			if (this.isPressed.get(JumpPlayer.ACTION_SPACEJUMP))
				this.spaceJump();
		}

		
		// Trillar man ner förlorar man
		if (this.y <= (controller.screenWrap ? controller.gameArea.bottomEdgeInGrid : 0) - 2 * this.height) {
			controller.playerDied();
			this.despawn();
		}
		if (controller.screenWrap)
			if (screenWrap(this))
				controller.stats.screenWraps++;

		this.collisionCheck();
		this.lastX = this.x;
		this.lastY = this.y;

		this.shootCooldown = Math.max(0, this.shootCooldown - delta);
		this.spaceJumpCooldown = Math.max(0, this.spaceJumpCooldown - delta);
	}

	draw(gameArea) {
		super.draw(gameArea);

		if (controller.screenWrap)
			drawScreenWrap(gameArea, this, super.draw.bind(this));
	}
}

class MirrorPlayer extends JumpPlayer {

	constructor(x,y) {
		super(x,y);
		this.vx = controller.player.vx;
		this.vy = controller.player.vy;
		this.collidibles = controller.player.collidibles;
	}

	update(delta) {
		super.update(delta);
		this.x = controller.gameArea.gridWidth - controller.player.x;
	}

	damage() {
		controller.player.damage();
	}

	die() {
		super.die();
		controller.player.die();
	}

}

const GRAVITY = -18;
class StandardPhysics extends Physics {

	constructor(object) {
		super(object);

		this.gy = GRAVITY;

		this.max_vx = 100;
		this.max_vy = 300;
	}
}

class PlayerPhysics extends StandardPhysics {

	constructor(object){
		super(object);
		this.bounce_speed = 125;
		this.linear_decay_x = 0.7;
		this.proportional_decay_x = 0.55;
		this._tempAccX = 0;
		this._tempAccY = 0;
	}

	bounceObject(other) {
		if (controller.currentLevel.code in controller.stats.bounces)
			controller.stats.bounces[controller.currentLevel.code]++;
		else
			controller.stats.bounces[controller.currentLevel.code] = 1;

		this.vy = this.bounce_speed + other.vy/3;
		// this.vx += this.bounce_speed * Math.sin(other.angle);
	}

	tempAcc(dx, dy) {
		this._tempAccX = dx;
		this._tempAccY = dy;
	}

	update(dt) {
		if (this._tempAccX || this._tempAccY) {
			this.accelerate(this._tempAccX, this._tempAccY, dt);
			this._tempAccX = 0;
			this._tempAccY = 0;
		}
		return super.update(dt);
	}
}