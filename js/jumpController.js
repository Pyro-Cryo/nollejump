class JumpController extends Controller {
	static WIDTH_PX = 384;
	static HEIGHT_PX = JumpController.WIDTH_PX * 15 / 9;
	static STORAGE_PREFIX = "nollejump_";
	constructor(statusGraph) {
		super("gameboard");
		this.canvasContainer = document.getElementById("gameboardContainer");
		this.gameArea.width = JumpController.WIDTH_PX;
		this.gameArea.height = JumpController.HEIGHT_PX;
		this.gameArea.gridOrigin = GameArea.GRID_ORIGIN_LOWER_LEFT;

		this.statusGraph = statusGraph;
		this.currentLevel = null;
		this.stateProperties = ["ctfys", "levelIndex", "nDeaths"];
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
			const trimQuotes = function (s) {
				if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"')
					return s.substring(1, s.length - 1);
				else
					return s;
			};

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
		// Usch fy skriv aldrig sån här kod igen
		this.setCanvasDimensions(barHeight, margin, margin / 2); // Första tar bort scrollbar
		this.setCanvasDimensions(barHeight, margin, margin / 2); // Andra sätter rätt värden
		window.addEventListener("resize", () => this.setCanvasDimensions(barHeight, margin, margin / 2));
		super.startDrawLoop();
	}

	onAssetLoadUpdate(progress, total) {
		this.setMessage(`Laddar (${progress}/${total}) ...`);
	}

	onAssetsLoaded() {
		super.onAssetsLoaded();
		this.clearOnDraw = false;
		this.setMessage(`Laddat klart`);
		this.startDrawLoop(64, 16);
		this.loadState();
		this.spawnPlayer();
		this.startLevel();
		this.togglePause();
		
		document.getElementById("resumeButton").addEventListener("click", e => {
			this.togglePause();
			e.preventDefault();
		}, true);
		document.getElementById("respawnButton").addEventListener("click", e => {
			this.objects.clear();
			this.gameArea.resetDrawOffset();
			this.spawnPlayer();
			this.startLevel();
			document.getElementById("deathmenu").classList.add("hidden");
			e.preventDefault();
		}, true);
		const restartButtons = document.getElementsByClassName("restartButton");
		for (let i = 0; i < restartButtons.length; i++)
			restartButtons.item(i).addEventListener("click", e => {
				if (window.confirm("Är du säker på att du vill börja om från alla första början?")) {
					this.clearState();
					this.loadState(); // Laddar defaultstate
					this.objects.clear();
					this.gameArea.resetDrawOffset();
					this.spawnPlayer();
					this.startLevel();
					if (this.isPaused) // Pausmenyn är uppe
						this.togglePause();
					else // Deathmenyn är uppe
						document.getElementById("deathmenu").classList.add("hidden");
				}
				e.preventDefault();
			}, true);
	}

	setLevelMessage() {
		this.setMessage(`${this.currentLevel.code} ${this.currentLevel.name}`);
	}

	setScores() {
		const populateImages = !document.getElementById("homeworkToken").src;
		let nScores = 0;
		for (const type of [Homework, KS, Tenta]) {
			if (populateImages) {
				const imgElement = document.getElementById(type.name.toLowerCase() + "Token");
				imgElement.src = type.image.src;
				imgElement.style = `transform: rotate(${type.angle}rad)`;
			}

			const scoreElement = document.getElementById(type.name.toLowerCase() + "Score");
			const current = this.currentLevel[type.name.toLowerCase() + "Current"];
			const needed = this.currentLevel[type.name.toLowerCase() + "Needed"];
			if (needed > 0) {
				if (scoreElement.parentElement.classList.contains("hidden")) {
					scoreElement.parentElement.classList.remove("hidden");
				}
				if (current >= needed)
					scoreElement.innerText = "\u2713";
				else
					scoreElement.innerText = `${current}/${needed}`;
				nScores++;
			} else {
				if (!scoreElement.parentElement.classList.contains("hidden")) {
					scoreElement.parentElement.classList.add("hidden");
				}
				scoreElement.innerText = "";
			}
		}

		// Se till att det är en rimlig textstorlek
		const scoreContainer = document.getElementById("scoreContainer");
		for (const n of [1, 2, 3]) {
			if (n !== nScores && scoreContainer.classList.contains("scores" + n))
				scoreContainer.classList.remove("scores" + n);
		}
		if (!scoreContainer.classList.contains("scores" + nScores))
			scoreContainer.classList.add("scores" + nScores);
	}

	setCanvasDimensions(barHeight, marginHorizontal, marginVertical = null) {
		if (marginVertical === null)
			marginVertical = marginHorizontal;
		const maxWidthPx = document.documentElement.clientWidth - marginHorizontal * 2;
		const maxHeightPx = document.documentElement.clientHeight - barHeight - marginVertical * 2;
		const wScale = maxWidthPx / JumpController.WIDTH_PX;
		const hScale = maxHeightPx / JumpController.HEIGHT_PX;
		const scale = Math.min(wScale, hScale);

		// Varifrån kommer de magiska siffrorna? Det du!
		if (maxWidthPx < JumpController.WIDTH_PX - 30) {
			const leftpad = marginHorizontal + Math.max(maxWidthPx - 300, 0) / 2;
			this.gameArea.canvas.style = `transform: scale(${scale}); position: absolute; left: ${leftpad}px; transform-origin: left top;`;
			this.canvasContainer.style = `height: ${scale * JumpController.HEIGHT_PX}px; position: relative;`;
		} else {
			this.gameArea.canvas.style = `transform: scale(${scale});`;
			this.canvasContainer.style = `height: ${scale * JumpController.HEIGHT_PX}px;`;
		}
	}

	loadState() {
		const defaultState = {
			// TODO: ctfys kanske null innan man valt spår eller nåt
			ctfys: true,
			levelIndex: 0,
			nDeaths: 0,
		};
		let data = window.localStorage.getItem(JumpController.STORAGE_PREFIX + "state");
		if (data)
			data = JSON.parse(data);
		else
			data = defaultState;
		
		for (const prop of this.stateProperties) {
			if (!data.hasOwnProperty(prop))
				console.warn(`Property ${prop} missing in saved state`);
			this[prop] = data[prop];
		}
		console.log("Loaded state", JSON.stringify(data));
	}

	saveState() {
		const data = {};
		for (const prop of this.stateProperties)
			data[prop] = this[prop];

		window.localStorage.setItem(JumpController.STORAGE_PREFIX + "state", JSON.stringify(data));
		console.log("Saved state", JSON.stringify(data));
	}

	clearState() {
		window.localStorage.removeItem(JumpController.STORAGE_PREFIX + "state");
	}

	spawnPlayer() {
		// Täck botten med plattformar så man inte instadör
		this.enemies = [];
		this.player = new JumpPlayer(this.gameArea.gridWidth / 2, 100);
		const platWidth = Platform.image.width * Platform.scale / this.gameArea.unitWidth;
		const startingPlatforms = new Region()
			.spawn(
				Platform,
				Math.ceil(controller.gameArea.gridWidth / platWidth),
				(elapsed, spawnHistory, level) => [
					spawnHistory.length * platWidth,
					10
				])
			.immediately();
		startingPlatforms.next();
	}

	playerDied() {
		this.nDeaths++;
		this.saveState();
		document.getElementById("deathmenu").classList.remove("hidden");
	}

	onPlay() {
		super.onPlay();
		document.getElementById("pausemenu").classList.add("hidden");
	}

	onPause() {
		super.onPause();
		document.getElementById("pausemenu").classList.remove("hidden");
	}

	startLevel(y = null) {
		if (this.levelIndex === 0)
			this.currentLevel = Level.tutorial();
		else {
			const code = (this.ctfys ? Level.ctfysLevels : Level.ctmatLevels)[this.levelIndex - 1];
			this.currentLevel = Level.levels.get(code)();
		}
		if (y === null) {
			this.currentLevel.warmup();
			// TODO: Borde kanske också skötas i level
			this.background = new Background(this.gameArea.gridWidth / 2, 0);
		}
		else
			this.currentLevel.init(y, this.gameArea.gridHeight / 2);
		this.setLevelMessage();
		this.setScores();
	}

	update(delta) {
		super.update(delta);
		// level.update() returnerar true när den tar slut
		if (this.currentLevel.update()) {
			this.levelIndex++;
			this.saveState();
			this.startLevel(this.currentLevel.yCurrent);
		}
	}

	/*draw() {
		super.draw();
		
		// Debug snowman
		const x = this.gameArea.width / 2;
		const y = this.gameArea.height - 100;
		const radius = 50;

		this.gameArea.disc(x, y, radius, "lightgrey");
		this.gameArea.disc(x, y - radius * 2 * 0.7, radius * 0.9, "lightgrey");
		this.gameArea.disc(x, y - radius * 2 * 1.3, radius * 0.8, "lightgrey");

		this.gameArea.disc(x - radius * 0.3, y - radius * 2 * 1.4, radius * 0.1, "black");
		this.gameArea.disc(x + radius * 0.3, y - radius * 2 * 1.4, radius * 0.1, "black");

		this.gameArea.rect(x, y - radius * 2 * 1.25, radius * 0.08, radius * 0.4, "orange");

		this.gameArea.rect(x - radius * 1.65, y - radius * 2 * 0.7, radius * 1.5, radius * 0.08, "black");
		this.gameArea.rect(x + radius * 1.65, y - radius * 2 * 0.7, radius * 1.5, radius * 0.08, "black");
	}*/
}

class cheat {
	/**
	 * Kan togglas
	 */
	static get slowmo() {
		controller.fastForwardFactor = 1 / controller.fastForwardFactor;
		controller.toggleFastForward();
	}

	static get godmode() {
		const addCollidible = controller.player.addCollidible.bind(controller.player);
		controller.player.addCollidible = obj => obj instanceof Enemy ? null : addCollidible(obj);
		for (const item of controller.player.collidibles.filterIterate(obj => !(obj instanceof Enemy)))
			;
	}

	static get jumpshoot() {
		const shoot = controller.player.shoot.bind(controller.player);
		controller.player.shoot = () => {
			shoot();
			if (controller.player.physics.vy < 0)
				controller.player.standardBounce();
		};
	}

	static get darkmode() {
		document.body.classList.add("dark");
		controller.background.dark = true;
		Background.dark = true;
	}
};