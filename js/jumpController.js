// Aspect ratio: width / height
const MAX_ASPECT_RATIO = 1 / 1;
const MIN_ASPECT_RATIO = 1 / 2;
const WIDTH_PX = 384;

class JumpController extends Controller {
	constructor() {
		super(document.getElementById("gameboard"), 10, 10);
		this.canvasContainer = document.getElementById("gameboardContainer");
	}

	begin(barHeight, margin) {
		super.begin();
		this.setCanvasDimensions(barHeight, margin);
		window.addEventListener("resize", () => this.setCanvasDimensions(barHeight, margin));
	}

	setCanvasDimensions(barHeight, marginHorizontal, marginVertical = null) {
		if (marginVertical === null)
			marginVertical = marginHorizontal;
		const maxHeightPx = document.documentElement.clientHeight - barHeight - marginVertical * 2;
		const maxWidthPx = document.documentElement.clientWidth - marginHorizontal * 2;

		// Limit the width to not exceed MAX_ASPECT_RATIO
		const targetWidthPx = Math.min(maxHeightPx * MAX_ASPECT_RATIO, maxWidthPx);
		// Limit the height to not exceed MIN_ASPECT_RATIO
		const targetHeightPx = Math.min(targetWidthPx / MIN_ASPECT_RATIO, maxHeightPx);

		// Achieve the desired width by scaling the canvas
		const scale = targetWidthPx / WIDTH_PX;
		// Compute the unscaled height
		const height_px = Math.round(targetHeightPx / scale);
		
		this.gameArea.canvas.width = WIDTH_PX;
		this.gameArea.canvas.height = height_px;
		this.gameArea.canvas.style = `transform: scale(${scale});`;
		
		this.canvasContainer.style = `height: ${targetHeightPx}px;`;

		// for debug purposes, draw a 100x100 rectangle
		//const ctx = this.canvas.getContext("2d");
		//ctx.fillStyle = "red";
		//ctx.fillRect(50, 50, 100, 100);
	}
}