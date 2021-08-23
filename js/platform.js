const platformImgs = Object.fromEntries([
	"normal", "green", "broken", "blue", "teal", "violet", "red", "gold"
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

class ScrollingPlatform extends Platform {
	static get image() { return Resource.getAsset(platformImgs.green); }
	constructor(x, y, speed = 100) {
		super(x, y);
		this.speed = speed;
	}
	update(delta) {
		super.update(delta);
		this.x += this.speed * delta / 1000;

		if (controller.screenWrap)
			screenWrap(this);
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

class CompanionCubePlatform extends Platform {
	static get image() { return Resource.getAsset(platformImgs.teal); }
	static get scale() { return 0.25; }
	constructor(x, y) {
		super(x, y);
		this.t = 1;
		this.path = null;
		this.speed = 1 / 1000;
		this.yIncrease = 150;
		this.yIncreaseVariation = 50;
	}

	update(delta) {
		super.update(delta);
		if (this.path) {
			this.t = Math.min(1, this.t + this.speed * delta);
			[this.x, this.y] = Splines.interpolateLinear(this.t, this.path);
			if (this.t === 1)
				this.path = null;
		}

		if (controller.screenWrap)
			screenWrap(this);
	}

	onPlayerBounce(player) {
		super.onPlayerBounce(player);
		let additionalIncrease = 0;
		player.effects.forEach(obj =>  {
			if (obj instanceof JumpBoost)
				additionalIncrease = this.yIncrease;
		});
		this.path = [
			[this.x, this.y],
			[Math.random() * controller.gameArea.gridWidth, this.y + this.yIncrease + additionalIncrease + this.yIncreaseVariation * (Math.random() * 2 - 1)]
		];
		this.t = 0;
	}
}

class CloakingPlatform extends Platform {
	static get image() { return Resource.getAsset(platformImgs.violet); }
	constructor(x, y) {
		super(x, y);
		this.cloakLimit = 0.6;
		this.uncloakLimit = 0.5;
		this.t = 0;
		this.alphaPath = null;
		this.alphaSpeed = 1 / 250;
	}

	update(delta) {
		super.update(delta);
		const t = (this.y - controller.gameArea.bottomEdgeInGrid) / controller.gameArea.gridHeight;
		const oldAlpha = this.alpha;
		if (this.alphaPath) {
			if (this.t === 1) {
				this.alphaPath = null;
				this.alpha = 0;
			} else {
				this.alpha = Splines.interpolateLinear(this.t, this.alphaPath)[0];
				this.t = Math.min(1, this.t + this.alphaSpeed * delta);
			}
		} else {
			if (t > this.cloakLimit)
				this.alpha = 1;
			else if (t < this.uncloakLimit)
				this.alpha = 0;
			else
				this.alpha = (t - this.uncloakLimit) / (this.cloakLimit - this.uncloakLimit);
		}
		if (this.alpha !== oldAlpha)
			this._imageDirty = true;
	}

	onPlayerBounce(player) {
		super.onPlayerBounce(player);
		this.alphaPath = [[0], [1], [0]];
		this.t = 0;
	}
}

class ScrollingCloakingPlatform extends CloakingPlatform {
	static get image() { return Resource.getAsset(platformImgs.violet); }
	constructor(x, y, speed = 100) {
		super(x, y);
		this.speed = speed;
	}
	update(delta) {
		super.update(delta);
		this.x += this.speed * delta / 1000;

		if (controller.screenWrap)
			screenWrap(this);
	}
}

class MagneticPlatform extends Platform {
	static get image() { return Resource.getAsset(platformImgs.gold); }
	static get scale() { return 0.22; }

	get height() {
		return super.height * 2;
	}

	constructor(x, y, repulsive=false, range=null) {
		super(x, y);
		this.repulsive = repulsive;
		if (this.repulsive)
			this.image = Resource.getAsset(platformImgs.red);
		this.range = range || controller.gameArea.gridWidth / 2;
		this.maxSpeed = 60 / this.range;
	}

	update(delta) {
		super.update(delta);

		if (controller.player && this.y + this.height >= controller.gameArea.bottomEdgeInGrid) {
			const yDist = controller.player.y - this.y;
			let xDist = controller.player.x - this.x;
			if (Math.abs(xDist) > Math.abs(xDist - controller.gameArea.gridWidth))
				xDist = xDist - controller.gameArea.gridWidth;
			let t = 1 - (xDist * xDist + yDist * yDist) / (this.range * this.range);
			if (t > 0) {
				t = Math.pow(t, 3 / 4);
				const theta = Math.atan2(yDist, xDist) + (this.repulsive ? Math.PI : 0);
				this.x += this.maxSpeed * t * delta * Math.cos(theta);
				this.y += this.maxSpeed * t * delta * Math.sin(theta);
			}
		}
		
		if (controller.screenWrap)
			screenWrap(this);
	}

	onCollision(player) {
		// If the player was above us and is going down
		if (player.physics.vy <= 0 && player.lastY - player.height / 2 >= this.y - this.height / 2)
			this.onPlayerBounce(player);
		else
			this.onPlayerPass(player);
	}
}

class GraphPlatform extends Platform {

	constructor(x,y,parent){
		super(x,y);

		this.parent = parent;
		this.revealed = false;
		if (this.parent === null)
			this.revealed = true;
		else{
			if (this.parent.children.length == 0)
				// we are the continuation node
				this.spawnSiblings(this.parent, controller.gameArea.gridWidth);
			this.parent.children.push(this);
		}
		this.children = [];
	}

	spawnSiblings(parent, screenwidth){
		while (Math.random() < 1/2){
			let x = Math.random()*screenwidth;
			let y = this.y + (Math.random()-1/2)*100;
			let p = new this.constructor(x,y,this.parent);
			p.revealed = true;
		}
	}

	onPlayerBounce(player){
		if (!this.revealed)
			return;

		this.children.forEach(child => child.reveal());
		super.onPlayerBounce(player);
	}

	reveal(){
		if (this.revealed)
			return;
		this.revealed = true;
		this.spawnSiblings();
	}

	despawnCheck(){
		if (this.children.some(child => {return controller.gameArea.isInFrame(child.x, child.y)}))
			return;
		super.despawnCheck();		
	}

	draw(gameArea){
		if (!this.revealed)
			return;

		super.draw(gameArea);
		this.children.forEach(child => {if (child.revealed) gameArea.line(this.x, this.y, child.x, child.y, 2)});
	}
}