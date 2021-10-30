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

	constructor(x, y, repulsive = false, range = null) {
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

class VectorFieldArrow extends GameObject {
	get width() { return 48; }
	get height() { return 48; }

	constructor(x, y, xAcc, yAcc, compensateGravity = true) {
		super(x, y, null, Math.atan2(-yAcc, xAcc));
		this.xAcc = xAcc;
		this.yAcc = yAcc;
		this.totalAcc = Math.sqrt(xAcc * xAcc + yAcc * yAcc);
		this.color = Background.toColor(Splines.interpolateLinear(
			Math.min(1, Math.max(0, (this.yAcc + 2 * Math.abs(GRAVITY)) / Math.abs(4 * GRAVITY))),
			[
				[255, 50, 50],
				[50, 50, 50],
				[100, 200, 50]
			]));

		if (controller.player)
			controller.player.addCollidible(this);
		this.compensateGravity = compensateGravity;
	}

	prerender() {
		if (this.image)
			this.image.getContext("2d").clearRect(0, 0, this.image.width, this.image.height);
		else
			this.image = document.createElement("canvas");
		this.image.width = 48;
		this.image.height = 16;
		let ctx = this.image.getContext("2d");
		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 3;
		
		ctx.beginPath();
		if (this.totalAcc === 0) {
			ctx.arc(this.image.width / 2, this.image.height / 2, 3, 0, 2 * Math.PI);
			ctx.fill();
		} else {
			const x = Math.max(7, Math.min(22, 22 * this.totalAcc / Math.abs(4 * GRAVITY)));
			ctx.moveTo(this.image.width / 2 - x, this.image.height / 2);
			ctx.lineTo(this.image.width / 2 + x - ctx.lineWidth, this.image.height / 2);
			ctx.stroke();
			ctx.moveTo(this.image.width / 2 + x - 10, this.image.height * 0.9);
			ctx.lineTo(this.image.width / 2 + x + 4 - ctx.lineWidth, this.image.height / 2);
			ctx.lineTo(this.image.width / 2 + x - 10, this.image.height * 0.1);
			ctx.closePath();
			ctx.fill();
		}

		super.prerender();
	}

	onCollision(player) {
		player.physics.tempAcc(this.xAcc, this.compensateGravity * -GRAVITY + this.yAcc);
	}

	update(delta) {
		despawnIfBelowBottom(this);
	}
}

class GraphPlatform extends Platform {

	constructor(x,y,parent,siblings=[]){
		super(x,y);

		this.parent = parent;
		this.revealed = false;
		this.bounced = false;
		if (this.parent === null)
			this.revealed = true;
		else
			this.parent.children.push(this);
		
		this.children = [];
		this.tokens = [];
		this.toSpawn = siblings; // Yes

		// tillgängliga  x-koordinater
		const screenwidth = controller.gameArea.gridWidth;
		const slots = Math.floor(screenwidth/this.width)+1;
		let pos = [];
		for (var i = 0; i < slots/2+1; i++) {
			let x = Math.floor(screenwidth * (i+1/2)/(slots/2+1));
			// Ta bort vår egen pos så ingen platform spawnar direkt ovanför oss
			if (Math.abs(x - this.x) <= screenwidth*2/slots)
				continue;
			pos.push(x);
		}

		// Shuffle by sorting randomly.
		this.pos = pos.sort((a,b) => Math.random()-1/2);

		if (siblings.length > pos.length)
			throw Exception("Cannot have this many children");

	}

	spawnSiblings(parent){

		for (var i = 0; i < this.pos.length; i++) {
			let x = this.pos.pop();
			let y = this.y + (Math.random()-0.4)*90;
			let p = new this.constructor(x,y,this.parent);
			p.revealed = true;


			// Tror det är bäst att Helmer aldrig läser den här delen
			// av koden....
			if (this.toSpawn.length > 0){
				let t = this.toSpawn.pop();
				let token = null;
				if (t.prototype instanceof Token){
					token = new t(p.pos.pop(), p.y + 300+Math.random()*100, null, false);
					token.level = controller.currentLevel;
				}
				else {
					token = new t(p.pos.pop(), p.y + 300+Math.random()*100, false);
				}
				p.tokens.push(token);
			}

			// Se till så att alla våra tokens placeras ut nånstans
			if (this.toSpawn.length == 0 && Math.random() < 1/2)
				break;
		}
	}


	onPlayerBounce(player){
		if (!this.revealed)
			return;

		if (!this.bounced){
			this.children.forEach(child => {if (child.reveal) child.reveal()});
			this.tokens.forEach(token => { if (!token.id) token.register()});
			this.bounced = true;
		}

		super.onPlayerBounce(player);
	}

	reveal(){
		if (this.revealed)
			return;
		this.revealed = true;
		this.spawnSiblings(this.parent);
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
		this.children.forEach(child => {if (child.revealed === undefined || child.revealed) gameArea.line(this.x, this.y, child.x, child.y, 2)});
		this.tokens.forEach(t => { if (t.id) gameArea.line(this.x, this.y, t.x, t.y, 2)});
	}
}

class MovingGraphPlatform extends GraphPlatform {

	static get image() { return BasicMovingPlatform.image; }

	constructor(x, y, parent, siblings=[], amplitude = 100, speed = 1) {
		super(x, y, parent, siblings);
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

class AngledPlatform extends Platform {
	constructor(x, y, angle, movingAngle = null) {
		super(x, y);
		const amplitude = 100;
		const speed = 1;
		if (movingAngle !== null) {
			this.image = Resource.getAsset(platformImgs.green);
			this.path = [
				[x, y],
				[x + amplitude * Math.cos(angle + movingAngle), y - amplitude * Math.sin(angle + movingAngle)],
				[x, y],
				[x - amplitude * Math.cos(angle + movingAngle), y + amplitude * Math.sin(angle + movingAngle)],
				[x, y]
			];
			this.speed = speed / 1000; // Path steps / ms
			this.t = 0;
			this.interpolation = t => Splines.interpolateLinear(t, this.path);
		}
		this.angle = angle;
	}

	update(delta) {
		super.update(delta);
		if (this.interpolation) {
			this.t = (this.t + delta * this.speed / (this.path.length - 1)) % 1;
			[this.x, this.y] = this.interpolation(this.t);

			if (controller.screenWrap)
				screenWrap(this);
		}
	}

	onCollision(player) {
		// If the player was above us and is going down
		let xdiff = (player.x - this.x);
		if (controller.gameArea.gridWidth - Math.abs(xdiff) < Math.abs(xdiff))
			xdiff = controller.gameArea.gridWidth - xdiff;
		if (player.physics.vy - Math.sin(this.angle) * player.physics.vx <= this.physics.vy && player.lastY - player.height / 2 >= this.y - Math.sin(this.angle) * xdiff)
			this.onPlayerBounce(player, xdiff);
		else
			this.onPlayerPass(player);
	}

	onPlayerBounce(player, xdiff) {
		// player.y = this.y + this.height * Math.cos(this.angle) / 4 - Math.sin(this.angle) * xdiff + player.height / 2;
		player.physics.vy = player.physics.bounce_speed * Math.cos(this.angle);
		player.physics.tempSpeedX += player.physics.bounce_speed * Math.sin(this.angle);
	}
}

// Ja, de här skulle bara ärvt från varann...
class LaserColumn extends GameObject {
	static get image() { return null; }
	static get scale() { return Platform.scale; }
	get width() { return 251 * this.scale; }
	get height() { return controller.gameArea.gridHeight / 8; }

	constructor(x, y, path = null, speed = 1, color = [100, 200, 50, 0.4]) {
		super(x, y);
		this.color = color && Background.toColor(color);

		this.path = LASER_DEFAULT_PATHS[path] || path;
		if (this.path instanceof Function)
			this.path = this.path(this);
		this.speed = speed / 1000; // Path steps / ms
		this.t = 0;
		this.trueScale = this.scale;
	}

	draw(gameArea, screenWrap = true) {
		if (this.color && gameArea.isInFrame(this.x, this.y, this.width, this.height, false)) {
			gameArea.rect(this.x, gameArea.bottomEdgeInGrid + gameArea.gridHeight / 2, this.width, gameArea.gridHeight, this.color);
		}
		
		if (screenWrap)
			drawScreenWrap(gameArea, this, (gA) => this.draw(gA, false));
	}

	update(delta) {
		super.update(delta);
		if (this.path) {
			this.t = (this.t + delta * this.speed / (this.path.length - 1)) % 1;
			[this.x, this.y, this.trueScale] = Splines.interpolateLinear(this.t, this.path);
		}

		const distUntilOut = this.y + this.height / 2 - controller.gameArea.bottomEdgeInGrid;
		const distIn = controller.gameArea.topEdgeInGrid - (this.y - this.height / 2);
		let scaleFadeMultiplier;
		if (distIn < this.height)
			scaleFadeMultiplier = distIn / this.height;
		else
			scaleFadeMultiplier = distUntilOut / this.height;
		this.scale = this.trueScale * Math.max(0, Math.min(1, scaleFadeMultiplier));

		if (controller.screenWrap)
			screenWrap(this);

		if (this.y < controller.gameArea.bottomEdgeInGrid - controller.gameArea.gridHeight)
			this.despawn();
	}
}

class LaserRow extends GameObject {
	static get image() { return null; }
	static get scale() { return Platform.scale; }
	get width() { return controller.gameArea.gridWidth; }
	get height() { return 34 * this.scale; }

	constructor(x, y, path = null, speed = 1, color = [100, 200, 50, 0.5]) {
		super(x, y);
		this.color = color && Background.toColor(color);

		this.path = LASER_DEFAULT_PATHS[path] || path;
		if (this.path instanceof Function)
			this.path = this.path(this);
		this.speed = speed / 1000; // Path steps / ms
		this.t = 0;
		
		if (controller.player)
			controller.player.addCollidible(this);
	}

	onCollision(player) {
		if (!this.scale || this.y + this.height < controller.gameArea.bottomEdgeInGrid)
			return;
		for (const object of controller.objects) {
			// Must also intersect with a column
			if (!(object instanceof LaserColumn))
				continue;
			if (!object.scale || !controller.gameArea.isInFrame(object.x, object.y, object.width, object.height))
				continue;
			if (!(Math.abs(controller.player.x - object.x) <= (controller.player.width + object.width) / 2
			|| Math.abs(controller.player.x - object.x) >= controller.gameArea.gridWidth - (controller.player.width + object.width) / 2))
				continue;
			// If the player was above us and is going down
			if (player.physics.vy <= this.physics.vy && player.lastY - player.height / 2 >= this.y) {
				player.y = this.y + this.height / 2 + player.height / 2;
				player.standardBounce(this);
				break;
			}
		}
	}

	update(delta) {
		super.update(delta);
		if (this.path) {
			this.t = (this.t + delta * this.speed / (this.path.length - 1)) % 1;
			[this.x, this.y, this.scale] = Splines.interpolateLinear(this.t, this.path);
		}

		if (controller.screenWrap)
			screenWrap(this);
		
		if (this.y < controller.gameArea.bottomEdgeInGrid - controller.gameArea.gridHeight)
			this.despawn();
	}

	draw(gameArea) {
		if (this.color && gameArea.isInFrame(this.x, this.y, this.width, this.height, false)) {
			gameArea.rect(gameArea.gridWidth / 2, this.y, gameArea.gridWidth, this.height, this.color);
		}
	}
}

const LASER_DEFAULT_PATHS = {
	movingX: obj => [
		[obj.x, obj.y, obj.scale],
		[obj.x + 100, obj.y, obj.scale],
		[obj.x, obj.y, obj.scale],
		[obj.x - 100, obj.y, obj.scale],
		[obj.x, obj.y, obj.scale]
	],
	movingY: obj => [
		[obj.x, obj.y, obj.scale],
		[obj.x, obj.y + 100, obj.scale],
		[obj.x, obj.y, obj.scale],
		[obj.x, obj.y - 100, obj.scale],
		[obj.x, obj.y, obj.scale]
	],
	modulated: obj => [
		[obj.x, obj.y, obj.scale],
		[obj.x, obj.y, 0],
		[obj.x, obj.y, 0],
		[obj.x, obj.y, obj.scale],
		[obj.x, obj.y, obj.scale * 2],
		[obj.x, obj.y, obj.scale]
	],
	modulatedMoveX: obj => [
		[obj.x, obj.y, obj.scale],
		[obj.x + 100, obj.y, obj.scale * 0.5],
		[obj.x + 200, obj.y, 0],
		[obj.x + 100, obj.y, obj.scale * 0.5],
		[obj.x, obj.y, obj.scale],
		[obj.x - 100, obj.y, obj.scale * 1.5],
		[obj.x - 200, obj.y, obj.scale * 2],
		[obj.x - 100, obj.y, obj.scale * 1.5],
		[obj.x, obj.y, obj.scale]
	]
};