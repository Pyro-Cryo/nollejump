class Enemy extends EffectObject {
    constructor(x, y, register = true) {
        super(x, y, null, null, null, register);
        this.health = 1;
    }

    /**
     * When in contact with the player
     * @param {JumpPlayer} player 
     */
    onCollision(player) {
        player.onEnemyCollision(this);
    }
    
    onShot(pellet) {
        if (--this.health <= 0)
            this.despawn();
    }

    despawn() {
        super.despawn();
        controller.enemies = controller.enemies.filter(e => e !== this);
    }

    update() {
        super.update();
        if (this.y + this.height < controller.gameArea.bottomEdgeInGrid)
            this.despawn();
    }

    register() {
        super.register();
        controller.player.addCollidible(this);
        controller.enemies.push(this);
    }
}

const tfImg = Resource.addAsset("img/tf.png");
const ofImg = Resource.addAsset("img/of.png");
const sfImg = Resource.addAsset("img/sf.png");

class Boss extends Enemy {
    constructor(x, y, register = true) {
        super(x, y, register);
        this.hasEntered = false;
        this.hoverDistance = 100; // units
        this.hoverProgress = 0;
        this.arrivingSpeed = this.hoverDistance / 1000; // units / ms
    }
    
    arrive() {}
    leave() {
        this.despawn();
    }

    update(delta) {
        super.update(delta);

        if (!this.hasEntered && this.y - this.height / 2 < controller.gameArea.topEdgeInGrid)
            this.hasEntered = true;

        if (this.hasEntered) {
            if (this.despawnTimer === -1) {
                const prev = this.hoverProgress;
                this.hoverProgress = Math.min(
                    this.hoverDistance,
                    this.hoverProgress + this.arrivingSpeed * delta);
                if (prev < this.hoverDistance && this.hoverProgress == this.hoverDistance)
                    this.arrive();
            }
            else
                this.hoverProgress -= this.arrivingSpeed * delta;
            this.y = controller.gameArea.topEdgeInGrid - this.hoverProgress + this.height / 2;
        }
    }

    onShot(pellet) {
        if (this.despawnTimer === -1 && --this.health <= 0) {
            this.despawnTimer = this.hoverDistance / this.arrivingSpeed;
            this.leave();
        }
    }
}

class TFPassive extends Enemy {
    static get image() { return Resource.getAsset(tfImg); }
    static get scale() { return 0.25; }
    get enemyType() { return "TF"; }
}
class OFPassive extends Enemy {
    static get image() { return Resource.getAsset(ofImg); }
    static get scale() { return 0.25; }
    get enemyType() { return "OF"; }
}
class SFPassive extends Enemy {
    static get image() { return Resource.getAsset(sfImg); }
    static get scale() { return 0.25; }
    get enemyType() { return "SF"; }
}

class OFBoss extends Boss {
    static get image() { return Resource.getAsset(ofImg); }
    static get scale() { return 0.25; }
    get enemyType() { return "OF"; }
}
class SFBoss extends Boss {
    static get image() { return Resource.getAsset(sfImg); }
    static get scale() { return 0.25; }
    get enemyType() { return "SF"; }
}

class OFFlipScreen extends OFBoss {
    arrive() {
        controller.flipX = true;
        controller.setCanvasDimensions(controller.barHeight, controller.margin, controller.margin / 2);
    }
    leave() {
        controller.flipX = false;
        controller.setCanvasDimensions(controller.barHeight, controller.margin, controller.margin / 2);
    }
    despawn() {
        super.despawn();
        if (controller.flipX) 
            this.leave();
    }
}

class SFFlappyBird extends SFBoss {
    constructor(x, y) {
        super(x, y);
        this.addEffect(new Hardhat());
        this.wavesLeft = 5;
        this.cooldownTime = 10000;
        this.cooldownTimer = -1;
    }
    spawnWave() {
        const gapStart = Math.floor(Math.random() * 5) + 1;
        const gapSize = 4; //Math.floor(4.5 - gapStart / 2);
        if (this.wavesLeft-- === 0) {
            this.leave();
            this.cooldownTimer = -1;
            return;
        }
        let i = 0; 
        for (let y = controller.gameArea.bottomEdgeInGrid + this.height / 2; y < controller.gameArea.topEdgeInGrid; y += this.height * 1.2) {
            if (i < gapStart)
                new TFFlappy(controller.gameArea.gridWidth + this.width * 1.2, y);
            else if (i >= gapStart + gapSize)
                new OFFlappy(controller.gameArea.gridWidth + this.width * 1.2, y);
            i++;
        }
        this.cooldownTimer += this.cooldownTime;
    }
    arrive() {
        this.leftSideFlappies = [];
        let i = 0;
        for (let y = controller.gameArea.bottomEdgeInGrid + this.height / 2; y < controller.gameArea.topEdgeInGrid; y += this.height * 1.2) {
            this.leftSideFlappies.push(new (i % 2 ? TFFlappy : OFFlappy)(-this.width * 1.2, y));
            i++;
        }
        this.spawnWave();
    }
    leave() {
        this.leftSideFlappies.forEach(flappy => {
            flappy.path.reverse();
            flappy.t = 0;
            flappy.goingLeft = true;
        });
        super.leave();
    }
    update(delta) {
        super.update(delta);
        if (this.cooldownTimer !== -1) {
            this.cooldownTimer -= delta;
            if (this.cooldownTimer <= 0)
                this.spawnWave();
        }
    }
}

const hardhatImg = Resource.addAsset("img/hat.png");
class Hardhat extends BaseEffect {
    static get image() { return Resource.getAsset(hardhatImg); }
    static get maxInvocations() { return 1; }
    static get scale() { return 0.5; }
    static get imgOffset() { return [0, 25]; }
    static get cooldown() { return 120000; }

    constructor(healthBoost = 100) {
        super();
        this.healthBoost = healthBoost;
    }

    init(object) {
        object.health += this.healthBoost;
    }
    remove(object) {
        object.health -= this.healthBoost;
        if (object.health <= 0)
            object.onShot(null);
    }
}

class TFHardhat extends TFPassive {
    constructor(x, y) {
        super(x, y);
        this.addEffect(new Hardhat());
    }
}
class OFHardhat extends OFPassive {
    constructor(x, y) {
        super(x, y);
        this.addEffect(new Hardhat());
    }
}
class SFHardhat extends SFPassive {
    constructor(x, y) {
        super(x, y);
        this.addEffect(new Hardhat());
    }
}

class TFFlappy extends TFHardhat {
    constructor(x, y) {
        super(x, y);
        this.yOffset = y - controller.gameArea.bottomEdgeInGrid;
        if (this.x < 0) {
            this.path = [
                [x],
                [40]
            ];
            this.speed = 1 / 1000; // Path steps / ms
            this.goingLeft = false;
        } else {
            this.path = [
                [x],
                [-300 / this.scale]
            ];
            this.speed = 1 / (1000 * controller.gameArea.gridWidth / 12);
            this.goingLeft = true;
        }
		this.t = 0;
		this.interpolation = t => Splines.interpolateLinear(t, this.path);
    }

	update(delta) {
        super.update(delta);
        if (this.t !== 1) {
            this.t = Math.min(1, this.t + delta * this.speed / (this.path.length - 1));
            this.x = this.interpolation(this.t)[0];
        }
        if (this.x < -this.width / 2 && this.goingLeft)
            this.despawn();
        this.y = controller.gameArea.bottomEdgeInGrid + this.yOffset;
    }
    
    onCollision(player) {
        if (!this.goingLeft || this.x > this.width / 2)
            super.onCollision(player);
    }
}
class OFFlappy extends TFFlappy {
    static get image() { return Resource.getAsset(ofImg); }
    static get scale() { return 0.25; }
    get enemyType() { return "OF"; }
}
