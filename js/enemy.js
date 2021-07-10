class Enemy extends GameObject {
    constructor(x, y) {
        super(x, y);
        controller.player.addCollidible(this);
    }

    /**
     * When in contact with the player
     * @param {JumpPlayer} player 
     */
    onCollision(player) {
        player.collidibles.clear();
        new BasicAnimation(player)
            .set({angle: 0})
            .after(0.5).set({angle: Math.random() < 0.5 ? 2 * Math.PI : -2 * Math.PI})
            .loop().start();
        console.log("death by föhs");
    }
    
    onShot(pellet) {
        this.despawn();
        controller.enemies = controller.enemies.filter(obj => obj.id != null)
    }
}

const tfImg = Resource.addAsset("img/tf.png");
class TF1 extends Enemy {
    static get image() { return Resource.getAsset(tfImg); }
    static get scale() { return 0.25; }
}