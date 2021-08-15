let _Level_tutorial = null;
// let _Level_choice = null;
let _Level_levels = new Map();
let _Level_ctfysLevels = [
	"DD1301", // Datorintro
	"test",
	"SF1673", // Envarre
	"DD1331", // Gruprog
	"SI1121", // Termo
	"SF1672", // Linalg
	"SK1104", // Klassfys
	"SF1674", // Flervarre
	"SG1112", // Mek 1
	"SF1922", // Sannstat
	"SK1105", // Expfys
];
let _Level_ctmatLevels = [
	"SF1674",
	// "DD1301", // Datorintro
	// "SF1673", // Envarre
	// "DD1331", // Gruprog
	// "SA1006", // Ingenjörsfärdigheter
	// "SF1672", // Linalg
	// "SF1918", // Sannstat, OBS annan kurskod
	// "SF1674", // Flervarre
	// "DD1320", // Tildat
	// "SF1550", // Numme
	// "DD1396", // Parallellprogrammering
	// "SG1115", // Partikeldynamik
];
let _Level_win = null;

/**
 * En level motsvarar en kurs. Man samlar ett
 * visst antal av varje typ av token för att
 * komma vidare till nästa nivå. När man klarar
 * en kurs sparas ens progress.
 */
class Level {
	constructor(metadata, homeworkNeeded, ksNeeded, tentaNeeded) {
		this.name = metadata.name || "Namnlös kurs";
		this.code = metadata.code || "SF1234";
		this.hp = metadata.hp || 0;
		this.homeworkNeeded = homeworkNeeded;
		this.ksNeeded = ksNeeded;
		this.tentaNeeded = tentaNeeded;
		this.regionIdCounter = 1;
		this.regions = new Map();
		this.initial = null;
		this.onNewRegion = null;
		this.isEndLevel = false;

		// State variables
		this.currentRegion = null;
		this.homeworkCurrent = 0;
		this.ksCurrent = 0;
		this.tentaCurrent = 0;
		this.previousElapsed = 0;

		this.yOnLevelStart = null;
		this.yLast = null;
	}

	get yCurrent() {
		return this.yOnLevelStart + this.totalElapsed;
	}

	get totalElapsed() {
		return this.previousElapsed + (this.currentRegion ? this.currentRegion.elapsed : 0);
	}

	get completed() {
		return this.homeworkCurrent >= this.homeworkNeeded && this.ksCurrent >= this.ksNeeded && this.tentaCurrent >= this.tentaNeeded;
	}

	get approximateProgress() {
		return (this.homeworkCurrent + this.ksCurrent * 2 + this.tentaCurrent * 3) / (this.homeworkNeeded + this.ksNeeded * 2 + this.tentaNeeded * 3);
	}

	tokenPickup(type) {
		// console.log("Plockade upp token: " + type.name);
		const wasCompleted = this.completed;
		switch (type) {
			case Homework:
				this.homeworkCurrent = Math.min(this.homeworkNeeded, this.homeworkCurrent + 1);
				break;
			
			case KS:
				this.ksCurrent = Math.min(this.ksNeeded, this.ksCurrent + 1);
				break;

			case Tenta:
				this.tentaCurrent = Math.min(this.tentaNeeded, this.tentaCurrent + 1);
				break;

			default:
				return;
		}
		controller.setScores();
		if (this.completed && !wasCompleted)
			console.log("Ny nivå börjar efter denna region");
	}

	/**
	 * Ankra levelns första yCurrent till en viss position och gör den redo att starta.
	 * Detta görs automatiskt med `yOnLevelStart = controller.gameArea.topEdgeInGrid` i update() om det inte redan gjorts manuellt.
	 * @param {number} yOnLevelStart y-nivån leveln ska börja på.
	 * @param {number} prespawnDistance Hur långt i förväg saker ska spawnas in. Sätts i update() och warmup() till `controller.gameArea.gridHeight / 2`.
	 */
	init(yOnLevelStart, prespawnDistance) {
		this.yOnLevelStart = yOnLevelStart;
		this.yLast = this.yOnLevelStart - prespawnDistance;
		this.currentRegion = this.initial.clone();
		console.log(`Ny level: ${this.code} - ${this.name}`);
	}

	/**
	 * Inte ett GameObject i sig, men denna bör köras varje update av controllern
	 * @returns `true` om leveln är completed och en region tagit slut (dvs den är redo att ersättas med nästa), annars `false`
	 */
	update() {
		if (this.yOnLevelStart === null)
			this.init(controller.gameArea.topEdgeInGrid, controller.gameArea.gridHeight / 2);
		
		const delta = controller.gameArea.topEdgeInGrid - this.yLast;
		this.yLast = controller.gameArea.topEdgeInGrid;
		if (delta === 0)
			return false;

		let res = this.currentRegion.next(delta);
		if (res.done) {
			if (this.completed)
				return true;
			else while (res.done && res.remainingDelta > 0) {
				this.previousElapsed += this.currentRegion.elapsed;
				this.currentRegion = res.followingRegion.clone();
				if (this.currentRegion.name)
					console.log("Ny region: " + this.currentRegion.name);
				res = this.currentRegion.next(res.remainingDelta);
				if (this.onNewRegion)
					this.onNewRegion();
			}
		}
		return false;
	}

	/**
	 * Fyll skärmen med innehåll
	 */
	warmup() {
		this.init(controller.gameArea.bottomEdgeInGrid, controller.gameArea.gridHeight / 2);
		this.update();
	}

	defineRegion(name = null) {
		let reg = new Region(this, this.regionIdCounter++, name);
		this.regions.set(reg.id, reg);
		if (reg.name) {
			if (reg.name instanceof Number)
				throw new Error("Men snälla nej vad håller du på med?");
			if (this.regions.has(reg.name))
				throw new Error(`Region already exists: ${reg.name} (id ${this.regions.get(reg.name).id})`);
			this.regions.set(reg.name, reg);
		}
		return reg;
	}

	addRegion(region) {
		const clone = region.clone();
		clone.id = this.regionIdCounter++;
		clone.level = this;
		this.regions.set(clone.id, clone);
		if (clone.name && !this.regions.has(clone.name))
			this.regions.set(clone.name, clone);
		return clone;
	}

	initialRegion(region) {
		if (region.level === this)
			this.initial = region;
		else
			this.initial = this.addRegion(region);
	}

	static get tutorial() { return _Level_tutorial;}
	static set tutorial(value) { _Level_tutorial = value;}
	// static get choice() { return _Level_choice;}
	// static set choice(value) { _Level_choice = value;}
	static get levels() { return _Level_levels;}
	static set levels(value) { _Level_levels = value;}
	static get ctfysLevels() { return _Level_ctfysLevels;}
	static set ctfysLevels(value) { _Level_ctfysLevels = value;}
	static get ctmatLevels() { return _Level_ctmatLevels;}
	static set ctmatLevels(value) { _Level_ctmatLevels = value;}
	static get win() { return _Level_win;}
	static set win(value) { _Level_win = value;}
}

/**
 * En level består av flera regioner som följer på varandra.
 * Vissa regioner har tokens man behöver. Ordningen är lite
 * halvt stokastisk och övergångar definieras med en riktad
 * cyklisk graf.
 */
class Region extends ArgableSequence {
	/**
	 * Skapa en ny region.
	 * Använd gärna level.defineRegion() istället så allt blir rätt, om du inte bara ska interleavea in denna i en annan.
	 * @param {Level} level Nivån som denna region hör till. Används vid beräkning av efterföljande regioner.
	 * @param {number} id Regionens ID. Hanteras av leveln.
	 * @param {string} name Regionens namn för lättare identifiering. Kan ersätta `id` i `level.regions.get(id)`. Hanteras av leveln.
	 */
	constructor(level, id, name) {
		super();
		this.level = level;
		this.id = id;
		this.name = name;
		this.followers = [];
	}

	/**
	 * Ange att en region kan följa efter denna.
	 * @param {Region} region Den efterföljande regionen.
	 * @param {number} weight Vikten som tilldelas denna region om det finns fler möjliga följare.
	 * @param {(level: Level) => boolean} condition En funktion som anger ett eventuellt kriterium som måste uppfyllas för att regionen ska kunna väljas. Kriteriet kan bero på statet för leveln som regionen tillhör.
	 */
	follower(region, weight = 1, condition = null) {
		this._checks();

		if (weight <= 0)
			throw new Error("Invalid weight: " + weight);

		this.followers.push({
			region: region,
			weight: weight,
			condition: condition
		});

		return this;
	}

	/**
	 * Ger en random följande region med hänsyn till vikter och conditions.
	 */
	getRandomFollower() {
		const availableFollowers = this.followers.filter(obj => obj.condition === null || obj.condition(this.level));
		if (availableFollowers.length === 0)
			return null;

		const normWeightCumSum = availableFollowers
			.reduce((res, obj, index) => {
				res[index] = (index > 0 ? res[index - 1] : 0) + obj.weight;
				return res;
			}, new Array(availableFollowers.length).fill(0))
			.map((val, _, arr) => val / arr[arr.length - 1]);
		const rnd = Math.random();
		return availableFollowers[normWeightCumSum.findIndex(val => rnd < val)].region;
	}

	next(delta = 1) {
		if (!this.iterating)
			this.spawnHistory = [];

		const res = super.next(delta);

		if (res.done)
			res.followingRegion = this.getRandomFollower();
		return res;
	}

	doSpawn(instruction) {
		// Lägg på ytterligare relevanta argument till argsfunktionen, som i ArgableSequence bara får .elapsed
		let spawned;
		if (instruction.length > 2 && instruction[2] instanceof Function) {
			const args = instruction[2];
			spawned = super.doSpawn([instruction[0], instruction[1], elapsed => args(elapsed, this.spawnHistory, this.level), ...instruction.slice(3)]);
		}
		else
			spawned = super.doSpawn(instruction);

		this.spawnHistory.push({
			object: spawned,
			xSpawn: spawned.x,
			ySpawn: spawned.y
		});
		if (spawned instanceof Token)
			spawned.level = this.level;
		return spawned;
	}

	doCall(instruction) {
		// Lägg på ytterligare relevanta argument till argsfunktionen, som i ArgableSequence bara får .elapsed
		if (instruction.length > 2 && instruction[2] instanceof Function) {
			const args = instruction[2];
			return super.doCall([instruction[0], instruction[1], elapsed => args(elapsed, this.spawnHistory, this.level), ...instruction.slice(3)]);
		} else
			return super.doCall(instruction);
	}

	clone() {
		const clone = super.clone();
		clone.level = this.level;
		clone.id = this.id;
		clone.name = this.name;
		clone.followers = this.followers.slice();
		return clone;
	}
}
