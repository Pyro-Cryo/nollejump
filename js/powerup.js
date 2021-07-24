
class PowerUp extends BaseEffect {
	
	static get maxInvocations() { return 1; }
	static get imgOffset() { return [0, -25]; }
	static get angle() { return 0; }

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

	onCollision(player) {

		player.addEffect(new this.constructor.powerup());
		this.despawn();
	}
}


const aubimg = Resource.addAsset("img/fruit/aubergine.png");
class JumpBoost extends PowerUp {

	static get image() { return Resource.getAsset(aubimg); }
	static get scale() { return 0.2; }
	static get cooldown() { return 5000; }

	init(object) {
		super.init(object);
 		this.prev = Object.assign({}, object.physics);
 		object.physics.bounce_speed *= 1.5;
	}

	remove(object) {
		object.physics.bounce_speed = this.prev.bounce_speed;
		super.remove(object);
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

	init(object) {
		super.init(object);
 		this.prev = Object.assign({}, object.physics);
 		object.physics.gy = 0;
 		object.physics.vy = 0;
	}

	update(object, delta) {
		object.physics.accellerate(0, 20, delta);
		super.update(object, delta);
	}

	remove(object) {
		object.physics.gy = this.prev.gy;
		super.remove(object);
	}
}

class RocketToken extends PowerupToken {
	static get powerup() { return Rocket; }
}