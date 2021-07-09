class JumpController extends Controller {
	// Aspect ratio: width / height
	static MAX_ASPECT_RATIO = 2 / 3;
	static MIN_ASPECT_RATIO = 1 / 2;
	static WIDTH_PX = 384;
	constructor(statusGraph) {
		super("gameboard");
		this.canvasContainer = document.getElementById("gameboardContainer");
		this.gameArea.gridOrigin = GameArea.GRID_ORIGIN_LOWER_LEFT;

		this.statusGraph = statusGraph;
	}

	static get defaultStatusGraph() {
		return [["Föhseriet", 2], ["Fadderiet", 0], ["nØllan", -2]];
	}

	// Hämtar inte denna med övriga assets pga att den failar om man testar utan att hosta en server lokalt
	static async loadStatusGraph() {
		try {
			const response = await Resource.load(
				"https://docs.google.com/spreadsheets/d/e/2PACX-1vSmx5deoelJokU0Q0SmiCdnegZnEnJM8AuhEMq33rT1mk_9I0WidCpnMPYzovkkfReUgd8V8G8NP8VV/pub?gid=512844469&single=true&output=csv",
				String);

			// TODO: gör/använd en ordentlig CSV-parser för det här uppfyller inte alls specen
			const matches = Array.from(response.matchAll(/^(("[^"]*")+|[^,]*),(("[^"]*")+|[^,]*)$/gm));
			function trimQuotes(s) {
				if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"')
					return s.substring(1, s.length - 1);
				else
					return s;
			}

			const statusGraph = matches.map(match => [
				trimQuotes(match[1]).trim(),
				trimQuotes(match[3]).trim()
					.replace(",", ".")
					.replace("−", "-") // tack google forms
					* 1
			]);

			console.log("Fetched status graph:", statusGraph);
			return statusGraph;
			
		} catch (response) {
			// console.log(response);
			// console.log("Using default status graph:", this.defaultStatusGraph);
			if (response instanceof TypeError && response.message == "Failed to fetch")
				console.warn("Kunde inte hämta statusgrafen. Prova att starta en server med ex. 'python -m http.server' i nollejump-mappen.");
			return this.defaultStatusGraph;
		}
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
		this.background = new Background(this.gameArea.gridWidth / 2, 0);
		this.clearOnDraw = false;

		const platWidth = Platform.image.width * Platform.scale;
		// const platHeight = Platform.image.height * Platform.scale;
		for (let x = 0; x < this.gameArea.gridWidth; x += platWidth)
			this.player.addCollidible(new Platform(x + platWidth / 2, 40));
		
		for (let y = 240; y < 10000; y += 200) {
			let platformType = Platform;
			if (y % 1000 === 440)
				platformType = BasicMovingPlatform;
			this.player.addCollidible(new platformType(
				Math.random() * (this.gameArea.width - platWidth / 2) + platWidth / 2,
				y));
			}

		this.togglePause();
		this.setMessage(`Loading complete`);
	}

	setCanvasDimensions(barHeight, marginHorizontal, marginVertical = null) {
		if (marginVertical === null)
			marginVertical = marginHorizontal;
		const maxHeightPx = document.documentElement.clientHeight - barHeight - marginVertical * 2;
		const maxWidthPx = document.documentElement.clientWidth - marginHorizontal * 2;

		// Limit the width to not exceed MAX_ASPECT_RATIO
		const targetWidthPx = Math.min(maxHeightPx * JumpController.MAX_ASPECT_RATIO, maxWidthPx);
		// Limit the height to not exceed MIN_ASPECT_RATIO
		const targetHeightPx = Math.min(targetWidthPx / JumpController.MIN_ASPECT_RATIO, maxHeightPx);

		// Achieve the desired width by scaling the canvas
		const scale = targetWidthPx / JumpController.WIDTH_PX;
		// Compute the unscaled height
		const height_px = Math.round(targetHeightPx / scale);
		
		this.gameArea.width = JumpController.WIDTH_PX;
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

class cheat {
	static get slowmo() {
		controller.fastForwardFactor = 1 / controller.fastForwardFactor;
		controller.toggleFastForward();
	}
};