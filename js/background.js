class Background extends GameObject {
	constructor(x, y) {
		super(x, y, null, 0, 1, false);

		this.bufferHeight = 3000;
		this.nodes = 5;
		this.parallax = 0.4;

		[this.currentImage, this.path] = BackgroundGenerator.createGraph(
			JumpController.WIDTH_PX,
			Math.ceil(this.bufferHeight * controller.gameArea.unitWidth),
			this.nodes,
			null,
			true);
		
		[this.nextImage, this.path] = BackgroundGenerator.createGraph(
			JumpController.WIDTH_PX,
			Math.ceil(this.bufferHeight * controller.gameArea.unitWidth),
			this.nodes,
			this.path,
			true);

		this.isRendering = false;

		controller.registerObject(this, true, false);
		this.offsetPrev = controller.gameArea.drawOffsetY;
	}

	draw(gameArea) {
		// super.draw() deliberately not called

		this.y -= (1 - this.parallax) * (controller.gameArea.drawOffsetY - this.offsetPrev);
		this.offsetPrev = controller.gameArea.drawOffsetY;
		
		gameArea.draw(this.currentImage, this.x, this.y, 0, 1);
		gameArea.draw(this.nextImage, this.x, this.y + this.bufferHeight, 0, 1);
		
		if (!this.isRendering && !gameArea.isInFrame(this.x, this.y, this.currentImage.width / gameArea.unitWidth, this.currentImage.height / gameArea.unitHeight)) {
			this.isRendering = true;
			console.log("start render");
			setTimeout(() => {
				let newNext;
				[newNext, this.path] = BackgroundGenerator.createGraph(this.currentImage, null, this.nodes, this.path, true);
				this.currentImage = this.nextImage;
				this.nextImage = newNext;
				this.y += this.bufferHeight;
				this.isRendering = false;
				console.log("stop render");
			}, 0);
		}
	}
}