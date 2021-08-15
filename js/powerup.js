
class PowerUp extends BaseEffect {
	
	static get maxInvocations() { return 1; }
	static get imgOffset() { return [0, -25]; }
	static get angle() { return 0; }
	static get prettyName() { return "Powerup"; }


	remove(object) {
		super.remove(object);
		new DisposedToken(object, this);
	}
}

class PowerupToken extends GameObject {

	static get powerup() { throw Exception("No powerup defined"); }
	static get image() { return this.powerup.image; }
	static get scale() { return this.powerup.scale; }
	static get angle() { return this.powerup.angle; }

	constructor(x, y){
		super(x, y); 
		controller.player.addCollidible(this);
	}

	update(delta){
		super.update(delta);
		despawnIfBelowBottom(this);
	}

	onCollision(player) {
		if (this.constructor.powerup.name in controller.stats.powerups)
			controller.stats.powerups[this.constructor.powerup.prettyName]++;
		else
			controller.stats.powerups[this.constructor.powerup.prettyName] = 1;
		player.addEffect(new this.constructor.powerup());
		this.despawn();
	}
}

class DisposedToken extends GameObject {

	constructor(object, powerup) {
		super(object.x - 4, object.y - 4, powerup.image, powerup.angle-Math.PI/8, powerup.scale);
		this.physics = new StandardPhysics(this);
		this.physics.setSpeed(object.physics.vx - 4, object.physics.vy - 4);
	}

	update(delta) {
		super.update(delta);
		despawnIfBelowBottom(this);
	}
}

// const appleImg = Resource.addAsset("img/fruit/apple.png");
class Immortal extends PowerUp {

	// static get image() { return Resource.getAsset(appleImg); }
	// static get scale() { return 0.1; }
	static get cooldown() { return 5000; }
	static get prettyName() { return "Osårbarhet"; }

	init(player) {
		super.init(player);
		// if (player.lives !== -1){
		// 	this.lives = player.lives;
	 // 		player.lives = -1;
		// }
		player.powers["shield"] = true;
	}

	remove(player) {
		// if (player.lives == -1)
		// 	player.lives = this.lives;
		player.powers["shield"] = false;
		super.remove(player);
	}

	draw(gameArea) {}
}

const bananashoesimg = Resource.addAsset("img/bananashoes.png");
class JumpBoost extends PowerUp {

	static get image() { return Resource.getAsset(bananashoesimg); }
	static get scale() { return 0.3; }
	static get prettyName() { return "Hopp-boost"; }
	static get imgOffset() { return [0, -25]; }
	static get drawBefore() { return true; }
	static get cooldown() { return 20000; }

	init(player) {
		super.init(player);
 		this.prev = Object.assign({}, player.physics);
 		player.physics.bounce_speed *= 1.25;
 		player.physics.gy *= 0.9;
 		player.powers["shoes"] = true;
	}

	remove(player) {
		player.physics.bounce_speed = this.prev.bounce_speed;
		player.physics.gy = this.prev.gy;
		player.powers["shoes"] = false;
		super.remove(player);
	}
}

class JumpBoostToken extends PowerupToken {
	static get powerup() { return JumpBoost; };
}

const orangeimg = Resource.addAsset("img/fruit/orange.png");
class Rocket extends PowerUp {

	static get image() { return Resource.getAsset(orangeimg); }
	static get scale() { return 0.1; }
	static get cooldown() { return 2200; }
	static get prettyName() { return "Raket"; }

	init(player) {
		super.init(player);

		player.addEffect(new Immortal());

 		this.prev = Object.assign({}, player.physics);
 		player.physics.gy = 0;
 		if(player.physics.vy < 0)
 			player.physics.vy = 0;
	}

	update(player, delta) {
		player.physics.accelerate(0, 20, delta);
		super.update(player, delta);
	}

	remove(player) {
		player.physics.gy = this.prev.gy;
		super.remove(player);
	}
}

class RocketToken extends PowerupToken {
	static get powerup() { return Rocket; }
}

const wingsimg = Resource.addAsset("img/wings.png");
class JumpShoot extends PowerUp {
	static get image() { return Resource.getAsset(wingsimg); }
	static get scale() { return 0.17; }
	static get cooldown() { return 10000; }
	static get prettyName() { return "Vingar"; }
	static get imgOffset() { return [0, 0]; }
	static get drawBefore() { return true; }

	init(player) {
		super.init(player);

		controller.player.keyActionMap.set("Space", JumpPlayer.ACTION_SPACEJUMP);
		controller.player.isPressed.set(JumpPlayer.ACTION_SHOOT, false);
	}

	remove(player) {
		controller.player.keyActionMap.set("Space", JumpPlayer.ACTION_SHOOT);
		controller.player.isPressed.set(JumpPlayer.ACTION_SPACEJUMP, false);
		super.remove(player);
	}
}
class JumpShootToken extends PowerupToken {
	static get powerup() { return JumpShoot; }
}

