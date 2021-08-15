const platformImgs = Object.fromEntries([
	"normal", "green", "broken", "blue"
].map(file => [file, Resource.addAsset(`img/platforms/${file}.png`)]));
class Platform extends EffectObject {
	static get image() { return Resource.getAsset(platformImgs.normal); }
	static get scale() { return 0.2; }

	constructor(x, y) {
		super(x, y);
		if (this._imageDirty)	// Behövs verkligen det här?
			this.prerender();

		if (controller.player)
			controller.player.addCollidible(this);
	}

	despawnCheck(){
		// Inte intuitivt uppenbart varför vi avstår om man inte screenwrappar
		// men tanken är att man ska kunna hoppa tillbaka
		if (controller.screenWrap)
			despawnIfBelowBottom(this);
	}

	/**
	 * 
	 * @param {JumpPlayer} player 
	 */
	onCollision(player) {
		// If the player was above us and is going down
		if (player.physics.vy <= this.physics.vy && player.lastY - player.height / 2 >= this.y + this.height/2)
			this.onPlayerBounce(player);
		else
			this.onPlayerPass(player);
	}

	onPlayerBounce(player) {
		player.y = this.y + this.height / 2 + player.height / 2;
		player.standardBounce(this);
	}

	onPlayerPass(player) {}

	update(delta) {
		super.update(delta);

		this.despawnCheck();
	}

	draw(gameArea) {
		if (this._imageDirty) {
			const length = 1.41 * this.scale * Math.max(this.image.width, this.image.height);
			if (!gameArea.isInFrame(this.x, this.y, length, length, true))
				return;
		} else {
			if (!gameArea.isInFrame(this.x, this.y, this.width, this.height, true))
				return;
		}

		super.draw(gameArea);
		if (controller.screenWrap)
			drawScreenWrap(gameArea, this, super.draw.bind(this));
	}
}

class BasicMovingPlatform extends Platform {
	static get image() { return Resource.getAsset(platformImgs.green); }
	constructor(x, y, amplitude = 100, speed = 1) {
		super(x, y);
		this.path = [
			[x, y],
			[x + amplitude, y],
			[x, y],
			[x - amplitude, y],
			[x, y]
		];
		this.speed = speed / 1000; // Path steps / ms
		this.t = 0;
		this.interpolation = t => Splines.interpolateLinear(t, this.path);
	}

	update(delta) {
		super.update(delta);
		this.t = (this.t + delta * this.speed / (this.path.length - 1)) % 1;
		[this.x, this.y] = this.interpolation(this.t);

		if (controller.screenWrap)
			screenWrap(this);
	}
}

class DiscreteMovingPlatform extends BasicMovingPlatform {
	constructor(x, y, amplitude = 100, speed = 1, steps = null) {
		super(x, y, amplitude, speed);
		this.steps = steps || (this.path.length - 1);
		this.interpolation = t => Splines.interpolateLinear(
			Math.round(t * this.steps) / this.steps,
			this.path);
	}
}

class FakePlatform extends Platform {
	static get image() { return Resource.getAsset(platformImgs.broken); }

	onCollision(player) {
		if (player.physics.vy < 0 && player.lastY - player.height / 2 >= this.y + this.height / 2){
			this.physics = new StandardPhysics(this);
		}
		this.onPlayerPass(player);
	}

}

class GhostPlatform extends GameObject {

	static get innerPlatform() { return DynamicPlatform; }
	static get image() { return this.innerPlatform.image; }
	static get cooldown() { return 2000; }

	constructor(x,y){
		super(x,y);
		this.cdtimer = 0;
	}

	update(delta){
		super.update(delta);

		this.cdtimer -= delta;

		if (controller.gameArea.isInFrame(this.x, this.y) && this.cdtimer <= 0){
			let platform = new this.constructor.innerPlatform(
				this.x,
				controller.gameArea.canvasToGridY(960, true),
				(Math.random()-1/2) * Math.abs(this.x - controller.gameArea.gridWidth/2)/2,
				controller.player.physics.bounce_speed * (1.1-0.3*Math.random())
			);
			this.cdtimer += this.constructor.cooldown;
		}

		despawnIfBelowBottom(this);
	}

	draw(gameArea){
		// Nope
	}
}



class DynamicPlatform extends Platform {

	static get image() { return Resource.getAsset(platformImgs.blue); }

	get height() {
		return super.height * 3;
	}

	constructor(x,y,vx,vy){
		super(x,y);

		this.physics = new StandardPhysics(this);
		this.physics.gy /= 2;
		this.physics.setSpeed(vx, vy);

	}

	despawnCheck(){
		// Despawna inte om vi är påväg uppåt, vilket vi är när vi
		// precis spawnat 
		if (this.vy >= 0)
			return;

		super.despawnCheck();
	}

	onCollision(player) {
		// If the player was above us and is going down
		if (player.physics.vy <= this.physics.vy && player.lastY - player.height / 2 >= this.y - this.height/2)
			this.onPlayerBounce(player);
		else
			this.onPlayerPass(player);
	}

	onPlayerBounce(player) {
		super.onPlayerBounce(player);
		this.physics.vy -= player.physics.bounce_speed/2;
	}

}