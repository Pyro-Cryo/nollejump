class Background extends GameObject {
	constructor(x, y) {
		super(x, y, null, 0, 1, false);

		this.bufferHeight = 3000;
		this.nodes = 5;

		[this.currentImage, this.path] = BackgroundGenerator.createGraph(
			this.bufferHeight,
			JumpController.WIDTH_PX,
			this.nodes,
			null,
			true);
		
		[this.nextImage, this.path] = BackgroundGenerator.createGraph(
			this.bufferHeight,
			JumpController.WIDTH_PX,
			this.nodes,
			this.path,
			true);

		Controller.instance.registerObject(this, true, false);
	}

	draw(gameArea) {
		// super.draw() deliberately not called

		// TODO: fix the generator instead of rotating here
		gameArea.draw(this.currentImage, this.x, this.y, Math.PI, 1);
		gameArea.draw(this.nextImage, this.x, this.y + gameArea.unitHeight * this.bufferHeight, Math.PI, 1);
	}
}