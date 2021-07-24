
class PowerUp extends BaseEffect {
	
	

}

class PowerupToken extends GameObject {

	static get powerup() { throw Exception("No powerup defined"); }

	constructor(x, y){
		controller.player.addCollidible(this);
	}

	onCollision(player) {

		player.addEffect(new this.constructor.powerup()());

	}

}