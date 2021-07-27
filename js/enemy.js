class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        controller.player.addCollidible(this);
        controller.enemies.push(this);
    }

    /**
     * When in contact with the player
     * @param {JumpPlayer} player 
     */
    onCollision(player) {
        player.damage();
    }
    
    onShot(pellet) {
        this.despawn();
        controller.enemies = controller.enemies.filter(obj => obj.id != null)
    }

    despawn() {
        super.despawn();
        controller.enemies = controller.enemies.filter(e => e !== this);
    }
}

const tfImg = Resource.addAsset("img/tf.png");
class TFPassive extends Enemy {
    static get image() { return Resource.getAsset(tfImg); }
    static get scale() { return 0.25; }
}
const ofImg = Resource.addAsset("img/of.png");
class OFPassive extends Enemy {
    static get image() { return Resource.getAsset(ofImg); }
    static get scale() { return 0.25; }
}
const sfImg = Resource.addAsset("img/sf.png");
class SFPassive extends Enemy {
    static get image() { return Resource.getAsset(sfImg); }
    static get scale() { return 0.25; }
}