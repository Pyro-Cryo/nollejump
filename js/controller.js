// Aspect ratio: width / height
const MAX_ASPECT_RATIO = 1 / 1;
const MIN_ASPECT_RATIO = 1 / 2;
const WIDTH_PX = 384;

class Controller {
	constructor() {
		this.canvas = document.getElementById("gameboard");
		this.canvasContainer = document.getElementById("gameboardContainer");
	}

	init(barHeight, margin) {
		this.setCanvasDimensions(barHeight, margin);
		window.addEventListener("resize", () => this.setCanvasDimensions(barHeight, margin));
	}

	setCanvasDimensions(barHeight, margin) {
		const maxHeightPx = document.documentElement.clientHeight - barHeight - margin;
		const maxWidthPx = document.documentElement.clientWidth - margin;

		// Limit the width to not exceed MAX_ASPECT_RATIO
		const targetWidthPx = Math.min(maxHeightPx * MAX_ASPECT_RATIO, maxWidthPx);
		// Limit the height to not exceed MIN_ASPECT_RATIO
		const targetHeightPx = Math.min(targetWidthPx / MIN_ASPECT_RATIO, maxHeightPx);

		// Achieve the desired width by scaling the canvas
		const scale = targetWidthPx / WIDTH_PX;
		// Compute the unscaled height
		const height_px = Math.round(targetHeightPx / scale);
		
		this.canvas.width = WIDTH_PX;
		this.canvas.height = height_px;
		this.canvas.style = `transform: scale(${scale});`;
		
		this.canvasContainer.style = `height: ${targetHeightPx}px;`;

		// for debug purposes, draw a 100x100 rectangle
		const ctx = this.canvas.getContext("2d");
		ctx.fillStyle = "red";
		ctx.fillRect(50, 50, 100, 100);
	}
}