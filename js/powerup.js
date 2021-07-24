
class PowerUp extends BaseEffect {
	
	static get maxInvocations() { return 1; }

	init(){
		super.init();
		this.apply();
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

	onCollision(player) {

		player.addEffect(new this.constructor.powerup());

	}

}


const aubimg = Resource.addAsset("img/fruit/aubergine.png");
class JumpBoost extends PowerUp {

	static get image() { return Resource.getAsset(aubimg); }
	static get scale() { return 0.3; }

	apply(object) {
 		this.prev = Object.assign({}, object.physics);
 		object.physics.bounce_speed *= 2;
	}

	remove(object) {
		this.prev.vx = object.physics.vx;
		this.prev.vy = object.physics.vy;
		object.physics = this.prev;

		super.remove(object);
	}

}

class JumpBoostToken extends PowerupToken {

	static get powerup() { return JumpBoost; };

}