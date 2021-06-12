// Aspect ratio: width / height
const MAX_ASPECT_RATIO = 2 / 3;
const MIN_ASPECT_RATIO = 1 / 2;
const WIDTH_PX = 384;

class JumpController extends Controller {
	constructor() {
		super("gameboard");
		this.canvasContainer = document.getElementById("gameboardContainer");
	}

	startDrawLoop(barHeight, margin) {
		this.setCanvasDimensions(barHeight, margin);
		window.addEventListener("resize", () => this.setCanvasDimensions(barHeight, margin));
		super.startDrawLoop();
	}

	onAssetLoadUpdate(progress, total) {
		this.setMessage(`Loaded ${progress}/${total}`);
	}

	onAssetsLoaded() {
		super.onAssetsLoaded();
		this.startDrawLoop(64, 16);
		this.player = new JumpPlayer(this.gameArea.gridWidth / 2, this.gameArea.gridHeight / 2);

		const platWidth = Platform.image.width * Platform.scale;
		// const platHeight = Platform.image.height * Platform.scale;
		for (let x = 0; x < this.gameArea.gridWidth; x += platWidth)
			this.player.addCollidible(new Platform(x + platWidth / 2, this.gameArea.gridHeight - 40));
		
		for (let y = this.gameArea.gridHeight - 40; y > -10000; y -= 200)
			this.player.addCollidible(new Platform(
				Math.random() * (this.gameArea.width - platWidth / 2) + platWidth / 2,
				y));

		this.togglePause();

		this.setMessage(`Loading complete`);
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
		
		this.gameArea.width = WIDTH_PX;
		this.gameArea.height = height_px;
		this.gameArea.canvas.style = `transform: scale(${scale});`;
		
		this.canvasContainer.style = `height: ${targetHeightPx}px;`;
	}

	draw() {
		super.draw();
		
		// Debug snowman
		/*const x = this.gameArea.width / 2;
		const y = this.gameArea.height - 100;
		const radius = 50;

		this.gameArea.disc(x, y, radius, "lightgrey");
		this.gameArea.disc(x, y - radius * 2 * 0.7, radius * 0.9, "lightgrey");
		this.gameArea.disc(x, y - radius * 2 * 1.3, radius * 0.8, "lightgrey");

		this.gameArea.disc(x - radius * 0.3, y - radius * 2 * 1.4, radius * 0.1, "black");
		this.gameArea.disc(x + radius * 0.3, y - radius * 2 * 1.4, radius * 0.1, "black");

		this.gameArea.rect(x, y - radius * 2 * 1.25, radius * 0.08, radius * 0.4, "orange");

		this.gameArea.rect(x - radius * 1.65, y - radius * 2 * 0.7, radius * 1.5, radius * 0.08, "black");
		this.gameArea.rect(x + radius * 1.65, y - radius * 2 * 0.7, radius * 1.5, radius * 0.08, "black");*/
	}
}