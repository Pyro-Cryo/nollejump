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
class TF1 extends Enemy {
    static get image() { return Resource.getAsset(tfImg); }
    static get scale() { return 0.25; }
}