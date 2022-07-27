
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

	constructor(x,y,register = true){
		super(x,y,null, null, null, register);
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

	register() {
		super.register();
		controller.player.addCollidible(this);
	}
}

class DisposedToken extends GameObject {

	constructor(object, powerup) {
		super(object.x - 4, object.y - 4, powerup.image, powerup.angle-Math.PI/8, powerup.scale);
		this.physics = new StandardPhysics(this);
		this.physics.setSpeed(object.physics.vx - 4*4, object.physics.vy - 4*4);
	}

	update(delta) {
		super.update(delta);
		despawnIfBelowBottom(this);
	}
}

const ovveimg = Resource.addAsset("img/ovve.png");
class Immortal extends PowerUp {

	static get image() { return Resource.getAsset(ovveimg); }
	static get scale() { return 0.24; }
	static get imgOffset() { return [0, -25]; }
	static get drawBefore() { return true; }
	static get cooldown() { return 10000; }
	static get prettyName() { return "Skyddsdräkt"; }

	init(player) {
		super.init(player);
		player.powers["shield"] = true;
	}

	remove(player) {
		player.powers["shield"] = false;
		super.remove(player);
	}
}

class ImmortalToken extends PowerupToken {
	static get powerup() { return Immortal; }
}

const bananashoesimg = Resource.addAsset("img/bananashoes.png");
class JumpBoost extends PowerUp {

	static get image() { return Resource.getAsset(bananashoesimg); }
	static get scale() { return 0.3; }
	static get prettyName() { return "Hopp-skor"; }
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

const albumimg = Resource.addAsset("img/album.png");
const musicnotesimgs = new Map(["a", "b", "c", "d", "e", "f"]
	.map(file => [file, Resource.addAsset(`img/note_${file}.png`)]));
class Rocket extends PowerUp {

	static get image() { return Resource.getAsset(albumimg); }
	static get scale() { return 0.25; }
	static get cooldown() { return 2500; }
	static get prettyName() { return "Raket-hit"; }

	init(player) {
		super.init(player);

		// player.addEffect(new Immortal());
		player.powers["shield"] = true;

 		this.prev = Object.assign({}, player.physics);
 		player.physics.gy = 0;
 		if(player.physics.vy < 0)
 			player.physics.vy = 0;
 		this.exhaustcooldown = 0;
	}

	update(player, delta) {
		player.physics.accelerate(0, 20, delta);
		this.exhaustcooldown += delta;

		if (this.exhaustcooldown >= 150 && Math.random() < 1/5) {
			let keys = Array.from(musicnotesimgs.keys());
			let img = Resource.getAsset(musicnotesimgs.get(keys[Math.floor(Math.random()*keys.length)]));
			let a = new GameObject(player.x, player.y, img, 
				(Math.random()-1/2)*30, 0.6*(1-0.5*Math.random()));
			if (Math.random() < 1/2)
				a.mirror = true;
			a.physics = new StandardPhysics(a);
			a.physics.setSpeed(player.vx + 50 * (Math.random() - 1/2), player.vy - 130 * (1-0.2*Math.random()));
			a.old_update = a.update;
			// Det här eftersom gameobjects inte despawnar per default om de är utanför skärmen
			a.update = function(dt){ this.old_update(dt); despawnIfBelowBottom(this); }.bind(a);
			this.exhaustcooldown = 0;
		}
		super.update(player, delta);
	}

	remove(player) {
		player.physics.gy = this.prev.gy;
		player.powers["shield"] = false;
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
	static get cooldown() { return 7500; }
	static get prettyName() { return "Vingar"; }
	static get imgOffset() { return [0, 0]; }
	static get drawBefore() { return true; }

	init(player) {
		super.init(player);

		player.keyActionMap.set("Space", JumpPlayer.ACTION_SPACEJUMP);
		player.isPressed.set(JumpPlayer.ACTION_SHOOT, false);
	}

	remove(player) {
		player.keyActionMap.set("Space", JumpPlayer.ACTION_SHOOT);
		player.isPressed.set(JumpPlayer.ACTION_SPACEJUMP, false);
		super.remove(player);
	}
}
class JumpShootToken extends PowerupToken {
	static get powerup() { return JumpShoot; }
}

