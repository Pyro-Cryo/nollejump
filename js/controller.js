// Aspect ratio: width / height
MAX_ASPECT_RATIO = 1 / 1;
MIN_ASPECT_RATIO = 1 / 2;
WIDTH_PX = 384;

class Controller {
	constructor() {
		this.canvas = document.getElementById("gameboard");
	}

	init(barHeight, margin) {
		this.setCanvasDimensions(barHeight, margin);
		window.addEventListener("resize", () => this.setCanvasDimensions(barHeight, margin));
	}

	setCanvasDimensions(barHeight, margin) {
		let height = document.documentElement.clientHeight - barHeight - margin;
		let width = Math.min(height * MAX_ASPECT_RATIO, document.documentElement.clientWidth - margin);
		height = Math.min(this.canvas.width / MIN_ASPECT_RATIO, height);

		const scale = width / WIDTH_PX;
		const height_px = Math.round(height / scale);
		this.canvas.width = WIDTH_PX;
		this.canvas.height = height_px;
		this.canvas.style = `transform: scale(${scale});`;

		// for debug purposes, draw a 100x100 rectangle
		const ctx = this.canvas.getContext("2d");
		ctx.fillStyle = "red";
		ctx.fillRect(50, 50, 100, 100);
	}
}