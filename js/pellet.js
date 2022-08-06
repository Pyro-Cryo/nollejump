// const fruits = [
//     "apple", "apple_green", "aubergine", "avocado", "banana", "cherry", "coconut",
//     "grapes", "kiwi", "lemon", "mango", "melon", "orange", "peach", "pear",
//     "pineapple", "strawberry", "watermelon",
//     // För enkel utkommentering
//     "tomato", "corn", "cucumber", "mushroom", 
// ].map(fruit => Resource.addAsset(`img/fruit/${fruit}.png`));
const fruits = [
    "arrow", "aubergine", "beating", "black", "blue", "bow", "brown",
    "diary", "double", "drops", "evil", "eyes", "flushed", "furry",
    "gals", "gleaming", "green", "guys", "hearteyes", "heartmouth",
    "hot", "kiss", "letter", "manyhearts", "orange", "orbit", "peach",
    "purple", "recursive", "red", "sign_language", "straight", "ugh",
    "white", "wink", "wink_p", "yellow",
].map(fruit => Resource.addAsset(`img/hearts/${fruit}.png`));
// Dessa borde kanske inte vara prerendered om de ska snurra hela tiden
class Pellet extends GameObject {
    constructor(x, y, xSpeed, ySpeed) {
        super(x, y, Resource.getAsset(fruits[Math.floor(Math.random() * fruits.length)]), 0, 0.15);
        this.angleVelocity = ((Math.random() * 0.7 + 0.1) * Math.PI / 180) * (Math.random() < 0.5 ? 1 : -1);
        
        this.physics = new StandardPhysics(this);
        this.physics.setSpeed(xSpeed, ySpeed);
    }

    update(delta) {
        super.update(delta);
        this.angle += this.angleVelocity * delta;

        for (const enemy of controller.enemies) {
            if (collisionCheckScreenWrap(this, enemy)) {
                enemy.onShot(this);
                controller.stats.shots[enemy.enemyType]++;
                this.despawn();
            }
        }

        if (despawnIfBelowBottom(this))
            controller.stats.shots.miss++;
        if (controller.screenWrap)
            screenWrap(this);
    }

    draw(gameArea) {
        super.draw(gameArea);
        if (controller.screenWrap)
            drawScreenWrap(gameArea, this, super.draw.bind(this));
    }
}
