class Enemy extends EffectObject {
    constructor(x, y) {
        super(x, y);
        controller.player.addCollidible(this);
        controller.enemies.push(this);
        this.health = 1;
    }

    /**
     * When in contact with the player
     * @param {JumpPlayer} player 
     */
    onCollision(player) {
        player.damage();
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
}

const tfImg = Resource.addAsset("img/tf.png");
const ofImg = Resource.addAsset("img/of.png");
const sfImg = Resource.addAsset("img/sf.png");

class Boss extends Enemy {
    constructor(x, y) {
        super(x, y);
        this.hasEntered = false;
        this.hoverDistance = 100; // units
        this.hoverProgress = 0;
        this.arrivingSpeed = this.hoverDistance / 1000; // units / ms
    }
    
    arrive() {}
    leave() {}

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