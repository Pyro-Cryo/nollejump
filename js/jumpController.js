let _JumpController_WIDTH_PX = 576;
let _JumpController_HEIGHT_PX = _JumpController_WIDTH_PX * 15 / 9;
let _JumpController_STORAGE_PREFIX = "nollejump_";

class JumpController extends Controller {
	static get WIDTH_PX() { return _Splines_WIDTH_PX;}
	static set WIDTH_PX(value) { _JumpController_WIDTH_PX = value;}
	static get HEIGHT_PX() { return _Splines_HEIGHT_PX;}
	static set HEIGHT_PX(value) { _JumpController_HEIGHT_PX = value;}
	static get STORAGE_PREFIX() { return _Splines_STORAGE_PREFIX;}
	static set STORAGE_PREFIX(value) { _JumpController_STORAGE_PREFIX = value;}
	constructor(statusGraph) {
		super("gameboard");
		this.canvasContainer = document.getElementById("gameboardContainer");
		this.gameArea.width = JumpController.WIDTH_PX;
		this.gameArea.height = JumpController.HEIGHT_PX;
		this.gameArea.gridOrigin = GameArea.GRID_ORIGIN_LOWER_LEFT;

		this.statusGraph = statusGraph;
		/** @type {Level} */
		this.currentLevel = null;
		this.stateProperties = ["ctfys", "levelIndex", "stats"];
		this._screenWrap = true;
	}

	set screenWrap(value) {
		this._screenWrap = value;
		if (value) {
			this.player.setCameraTracking(...JumpPlayer.SCREENWRAP_TRACKING);
			this.clearOnDraw = false;
		}
		else {
			this.clearOnDraw = true;
			this.player.setCameraTracking(...JumpPlayer.NON_SCREENWRAP_TRACKING);
		}
	}

	get screenWrap() {
		return this._screenWrap;
	}

	static get defaultStatusGraph() {
		return ["nØllan","/","/","-∞","/","-273,16","-π","0","e","42","Vanliga människor","/","/","Andra teknologer","1/ɛ","Fysiker","∞","/","Gud","/","Föhseriet"];
	}

	// Hämtar inte denna med övriga assets pga att den failar om man testar utan att hosta en server lokalt
	static async loadStatusGraph() {
		try {
			const response = await Resource.load(
				"https://docs.google.com/spreadsheets/d/e/2PACX-1vSZ-xcmOYMcJKxy8RkIlD3yqccYAm1Ogr4TsPMQqL2P7UXX1YtbVTN2KAuTqvLq2bY_nBVBihJDJwD7/pub?gid=1414378941&single=true&output=csv",
				String);

			const statusGraph = response.split("\n").slice(1).map(s => s.trim()).map(s =>
				s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"' ? s.substr(1, s.length - 2) : s
			);
			console.log("Hämtade statusgrafen");
			return statusGraph;
			
		} catch (response) {
			// console.log(response);
			// console.log("Using default status graph:", this.defaultStatusGraph);
			if (response instanceof TypeError && response.message == "Failed to fetch")
				console.warn("Kunde inte hämta statusgrafen. Prova att starta en server med ex. 'python -m http.server' i nollejump-mappen.");
			return this.defaultStatusGraph;
		}
	}

	get approximateProgress() {
		return (this.levelIndex + this.currentLevel.approximateProgress) / ((this.ctfys ? Level.ctfysLevels : Level.ctmatLevels).length + 1);
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
		this.setupElements();
		if (this.ctfys === null)
			document.getElementById("choicemenu").classList.remove("hidden");
		else
			this.togglePause();
	}

	setupElements() {
		// Resumeknappen på paussidan
		document.getElementById("resumeButton").addEventListener("click", e => {
			this.togglePause();
			e.preventDefault();
		}, true);
		// Respawnknappen ("försök igen") på du dog-sidan
		document.getElementById("respawnButton").addEventListener("click", e => {
			this.objects.clear();
			this.delayedRenderObjects = [];
			this.gameArea.resetDrawOffset();
			this.spawnPlayer();
			this.startLevel();
			document.getElementById("deathmenu").classList.add("hidden");
			e.preventDefault();
		}, true);
		// Restartknappar finns på både paus- och dogsidan
		const restartButtons = document.getElementsByClassName("restartButton");
		for (let i = 0; i < restartButtons.length; i++)
			restartButtons.item(i).addEventListener("click", e => {
				if (window.confirm("Är du säker på att du vill börja om från alla första början?")) {
					this.clearState();
					this.loadState(); // Laddar defaultstate
					this.objects.clear();
					this.delayedRenderObjects = [];
					this.gameArea.resetDrawOffset();
					this.spawnPlayer();
					this.startLevel();
					if (!this.isPaused) { // Dödsmenyn är uppe
						document.getElementById("deathmenu").classList.add("hidden");
						super.onPause(); // Pausa utan att öppna pausmenyn
					} else // Pausmenyn är uppe
						document.getElementById("pausemenu").classList.add("hidden");
					document.getElementById("choicemenu").classList.remove("hidden");
				}
				e.preventDefault();
			}, true);
		// CTFYS-knappen
		document.getElementById("ctfysButton").addEventListener("click", e => {
			this.ctfys = true;
			this.saveState();
			this.togglePause();
			document.getElementById("choicemenu").classList.add("hidden");
			e.preventDefault();
		}, true);
		// CTMAT-knappen
		document.getElementById("ctmatButton").addEventListener("click", e => {
			this.ctfys = false;
			this.saveState();
			this.togglePause();
			document.getElementById("choicemenu").classList.add("hidden");
			e.preventDefault();
		}, true);

		// Token-ikonerna i topbaren
		for (const type of [Homework, KS, Tenta]) {
			const imgElement = document.getElementById(type.name.toLowerCase() + "Token");
			imgElement.src = type.image.src;
			imgElement.style = `transform: rotate(${type.angle}rad)`;
		}

		document.body.addEventListener("keydown", e => {
			if (e.code === "Escape") {
				if (!this.isPaused) {
					let noneOpen = true;
					const pauseMenus = document.getElementsByClassName("pausemenu");
					for (let i = 0; i < pauseMenus.length; i++)
						noneOpen &= pauseMenus.item(i).classList.contains("hidden");
					if (noneOpen) {
						document.getElementById("playButton").click();
						e.preventDefault();
					}
				} else if (!document.getElementById("pausemenu").classList.contains("hidden")) {
					document.getElementById("resumeButton").click();
					e.preventDefault();
				}
			}
		}, true);
	}

	setLevelMessage() {
		if (this.levelIndex === 0)
			this.setMessage(`${this.currentLevel.code}: ${this.currentLevel.name}`);
		else
			this.setMessage(`${this.currentLevel.code} ${this.currentLevel.name}`);
	}

	setScores() {
		let nScores = 0;
		for (const type of [Homework, KS, Tenta]) {
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
			ctfys: null,
			levelIndex: 0,
			stats: {
				deaths: {
					// populeras med kurskod: antal
				},
				bounces: {
					// populeras med kurskod: antal
				},
				powerups: {
					// populeras med typ av powerup: antal
				},
				shots: {
					"OF": 0,
					"SF": 0,
					"TF": 0,
					"butler": 0,
					"miss": 0,
				},
				screenWraps: 0,
				distance: 0,
			}
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
		// console.log("Loaded state", data);
	}

	saveState() {
		const data = {};
		for (const prop of this.stateProperties)
			data[prop] = this[prop];

		window.localStorage.setItem(JumpController.STORAGE_PREFIX + "state", JSON.stringify(data));
		// console.log("Saved state", data);
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
		if (this.currentLevel.code in this.stats.deaths)
			this.stats.deaths[this.currentLevel.code]++;
		else
			this.stats.deaths[this.currentLevel.code] = 1;
		this.saveState();
		document.getElementById("deathmenu").classList.remove("hidden");
		ScoreReporter.report(false);
	}

	onPlay() {
		super.onPlay();
		document.getElementById("pausemenu").classList.add("hidden");
	}

	onPause() {
		super.onPause();
		document.getElementById("pausemenu").classList.remove("hidden");
		this.funFacts();
	}

	funFacts() {
		const pausemenuinfo = document.getElementById("pausemenuinfo");
		while (pausemenuinfo.hasChildNodes())
			pausemenuinfo.removeChild(pausemenuinfo.lastChild);
		// Fyll på med rolig info
		// \u00AD = soft hyphen, kan användas för att avstava långa ord
		const tidbits = [
			// visste du att...
			"tomater är bär",
			"tomatplantan är en slags potatisväxt",
			'Potatisakademien har mottot "för potatisen i tiden"',
			"potatisens dag infaller den 26 oktober",
			"hallon är stenfrukter",
			"ananaser är så kallade fruktförband",
			"äpplen är falska frukter",
			"potatis också kallas jordpäron",
			"avokado också kallas alligatorpäron eller advokatpäron",
			'ordet "avokado" kommer från aztekernas språk och betyder "testikel"',
			"avokador är bär, liksom gurkor",
			"nötter är äkta frukter",
			"om du inte har A-vitaminbrist förbättrar inte morötter synen - det är en myt som spreds av brittiska flygvapnet under andra världskriget för att dölja att de uppfunnit radarn",
			"örter är växter med oförvedade stammar, som till exempel morötter, bananer och squasher",
			"tomater och gurkor inte ska förvaras tillsammans, då tomater avger etylengas som gör gurkor sega",
			"i squash väger bollen 23 gram",
			"durian också kallas stinkfrukt, och är förbjuden i bland annat Singapores tunnelbana",
			"blåbärsris täcker ungefär 11 % av Sveriges yta",
			"jordgubbar inte är bär, utan fruktförband med nötter",
		];

		// Generera statistikfakta
		const totalShots = Object.keys(this.stats.shots).reduce((sum, key) => sum + this.stats.shots[key], 0);
		const hits = totalShots - this.stats.shots.miss;
		if (totalShots > 0) {
			tidbits.push(`du har prickat ${Math.round(100 * hits / totalShots)} % av dina kast`);
			tidbits.push(`du har kastat ${totalShots} frukter`);
			// TODO: kan ha mer detaljerat vem man prickat osv
			if (hits > 0)
				tidbits.push(`du har prickat ${hits} Föhsare`);
			if (this.stats.shots.miss > 0)
				tidbits.push(`du har missat ${this.stats.shots.miss} kast`);
		} else
			tidbits.push("du inte kastat en enda frukt ännu");

		const totalDeaths = Object.keys(this.stats.deaths).reduce((sum, key) => sum + this.stats.deaths[key], 0);
		const currentLevelDeaths = this.currentLevel.code in this.stats.deaths ? 0 : this.stats.deaths[this.currentLevel.code];
		if (totalDeaths > 0) {
			tidbits.push(`du hoppat av ${totalDeaths} kursomgång${totalDeaths > 1 ? "ar" : ""}`);
			if (currentLevelDeaths > 0)
				tidbits.push(`du har hoppat av ${this.currentLevel.name} ${currentLevelDeaths} gång${currentLevelDeaths > 1 ? "er" : ""}`);

			const maxDeaths = Object.keys(this.stats.deaths).reduce((max, key) => this.stats.deaths[key] > max[0] ? [this.stats.deaths[key], key] : max, [0, null]);
			if (maxDeaths[1] === this.currentLevel.code)
				tidbits.push(`du har försökt att klara ${this.currentLevel.name} ${maxDeaths[0]} gång${maxDeaths[0] > 1 ? "er" : ""}`);
			else
				tidbits.push(`det tog dig ${maxDeaths[0]} försök att klara ${Level.levels.get(maxDeaths[1])(true).name}`);
		} else
			tidbits.push("du inte hoppat av något än");

		if (this.levelIndex > 0) {
			const courses = this.ctfys ? Level.ctfysLevels : Level.ctmatLevels; // skippar tutorialen men den är inte jätteintressant
			let totalHp = Level.tutorial(true).hp;
			let totalHomework = Level.tutorial(true).homeworkNeeded + this.currentLevel.homeworkCurrent;
			let totalKs = Level.tutorial(true).ksNeeded + this.currentLevel.ksCurrent;
			let totalTenta = Level.tutorial(true).tentaNeeded + this.currentLevel.tentaCurrent;

			for (let i = 1; i < this.levelIndex && i - 1 < courses.length; i++) {
				const level = Level.levels.get(courses[i - 1])(true);
				if (!(courses[i - 1] in totalDeaths))
					tidbits.push(`du klarade ${level.name} på första försöket`);
				totalHp += level.hp;
				totalHomework += level.homeworkNeeded;
				totalKs += level.ksNeeded;
				totalTenta += level.tentaNeeded;
			}
			tidbits.push(`du har tagit ${totalHp.toLocaleString()} HP`);
			if (totalHomework > 0)
				tidbits.push(`du har klarat ${totalHomework} inlämningsuppgift${totalHomework > 1 ? "er" : ""}`);
			if (totalKs > 0)
				tidbits.push(`du har klarat ${totalKs} kontrollskrivning${totalKs > 1 ? "ar" : ""}`);
			if (totalTenta > 0)
				tidbits.push(`du har klarat ${totalTenta} tent${totalTenta > 1 ? "or" : "a"}`);
		}

		const totalBounces = Object.keys(this.stats.bounces).reduce((sum, key) => sum + this.stats.bounces[key], 0);
		// const currentLevelBounces = this.currentLevel.code in this.stats.bounces ? 0 : this.stats.bounces[this.currentLevel.code];
		tidbits.push(`du har studsat på ${totalBounces} plattform${totalBounces !== 1 ? "ar" : ""}`);
		
		const totalPowerups = Object.keys(this.stats.powerups).reduce((sum, key) => sum + this.stats.powerups[key], 0);
		if (totalPowerups > 0) {
			tidbits.push(`du har plockat upp ${totalPowerups} powerup${totalPowerups !== 1 ? "s" : ""}`);
			const favoritePowerup = Object.keys(this.stats.powerups).reduce((max, key) => this.stats.powerups[key] > max[0] ? [this.stats.powerups[key], key] : max, [0, null]);
			// TODO: klassnamnen som används kanske inte alltid är fina nog att skrivas ut
			tidbits.push(`din favoritpowerup är ${favoritePowerup[1]}, och du använt den ${favoritePowerup[0]} gång${favoritePowerup[0] > 1 ? "er" : ""}`);
		} else
			tidbits.push(`du ännu inte plockat upp någon powerup`);
		
		if (this.stats.screenWraps > 0)
			tidbits.push(`du passerat över skärmgränsen i x-led ${this.stats.screenWraps} gång${this.stats.screenWraps > 1 ? "er" : ""}`);
		else
			tidbits.push(`du aldrig passerat över skärmgränsen i x-led`);
		
		if (this.stats.distance > 0) { // Minst tutorialen avklarad
			// Anta att Jennie-Jan är 1 m lång
			const distance = (this.stats.distance + this.currentLevel.totalElapsed) / controller.player.height;
			tidbits.push(`du befinner dig ungefär ${Math.round(distance / 5) * 5} m upp`);
		}

		// TODO: total speltid (per nivå), antal gånger knockad av föhsare
		
		// Välj ut några på slump
		const chosenTidbits = [];
		for (let i = 0; i < 3; i++) {
			const index = Math.floor(Math.random() * tidbits.length);
			chosenTidbits.push(tidbits[index]);
			tidbits.splice(index, 1);
		}

		// Populera listan
		for (const tidbit of chosenTidbits) {
			const li = document.createElement("li");
			li.innerText = "... " + tidbit + "?";
			pausemenuinfo.appendChild(li);
		}
	}

	startLevel(y = null) {
		switch (this.levelIndex) {
			case 0:
				this.currentLevel = Level.tutorial();
				break;
			default:
				const code = (this.ctfys ? Level.ctfysLevels : Level.ctmatLevels)[this.levelIndex - 1];
				this.currentLevel = Level.levels.get(code)();
				break;
		}
		this.currentLevel.onNewRegion = () => this.saveState(); // Så vi sparar stats osv
		
		if (y === null) {
			this.currentLevel.warmup();
			this.background = new Background(this.gameArea.gridWidth / 2, 0, this.statusGraph);
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
			this.stats.distance += this.currentLevel.totalElapsed;
			this.levelIndex++;
			this.saveState();
			this.startLevel(this.currentLevel.yCurrent);
		}

		// if (this.levelIndex === 0 && Math.abs(this.player.x - this.gameArea.gridWidth / 2) > this.gameArea.gridWidth * 5) {
		// 	this.levelIndex = 1;
		// 	this.ctfys = this.player.x > 0;
		// 	this.screenWrap = true;
		// 	for (const obj of this.objects) {
		// 		if (obj instanceof Platform && (obj.x < 0 || obj.x > this.gameArea.gridWidth))
		// 			obj.despawn();
		// 		else if (obj instanceof CTFYSRight || obj instanceof CTMATLeft)
		// 			obj.despawn();
		// 	}
		// 	this.player.x -= this.gameArea.leftEdgeInGrid;
		// 	this.gameArea.resetDrawOffset(true, false);
		// 	this.saveState();
		// 	this.startLevel();
		// }
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

	static get tokens() {
		let pos = 1;
		for (const type of [Homework, KS, Tenta])
			new type(controller.gameArea.gridWidth * pos++ / 4, controller.gameArea.topEdgeInGrid - 200).level = controller.currentLevel;
	}

	static get break() {
		controller.registerObject({
			update: delta => (undefined).doesNotExist(),
			id: 123456789,
			draw: gameArea => null
		});
	}
};
