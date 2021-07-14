const fruits = [
    "apple", "apple_green", "aubergine", "avocado", "banana", "cherry", "coconut",
    "grapes", "kiwi", "lemon", "mango", "melon", "orange", "peach", "pear",
    "pineapple", "strawberry", "watermelon",
    // För enkel utkommentering
    "tomato", "corn", "cucumber", "mushroom", 
].map(fruit => Resource.addAsset(`img/fruit/${fruit}.png`));
// Dessa borde kanske inte vara prerendered om de ska snurra hela tiden
class Pellet extends GameObject {
    constructor(x, y, xSpeed, ySpeed) {
        super(x, y, Resource.getAsset(fruits[Math.floor(Math.random() * fruits.length)]), 0, 0.15);
        this.angleVelocity = ((Math.random() + 0.5) * Math.PI / 180) * (Math.random() < 0.5 ? 1 : -1);
        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;
        this.yAcceleration = -0.003;
    }

    update(delta) {
        this.ySpeed += this.yAcceleration * delta;
        this.x += this.xSpeed * delta;
        this.y += this.ySpeed * delta;
        this.angle += this.angleVelocity * delta;

        for (const enemy of controller.enemies) {
            if (collisionCheckScreenWrap(this, enemy)) {
                enemy.onShot(this);
                this.despawn();
            }
        }

        if (this.y + this.height < controller.gameArea.bottomEdgeInGrid)
            this.despawn();
    }

    draw(gameArea) {
        super.draw(gameArea);

        drawScreenWrap(gameArea, this, super.draw.bind(this));
    }
}