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

	tokenPickup(type) {
		console.log("Plockade upp token: " + type.name);
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
				break;
		}
	}

	/**
	 * Ankra levelns första yCurrent till en viss position och gör den redo att starta.
	 * Detta görs automatiskt med `yOnLevelStart = controller.gameArea.topEdgeInGrid` i update() om det inte redan gjorts manuellt.
	 * @param {number} yOnLevelStart y-nivån nivån ska börja på.
	 * @param {number} marginToTop Hur långt i förväg saker ska spawnas in. Sätts i update() och warmup() till `controller.gameArea.gridHeight / 2`.
	 */
	init(yOnLevelStart, marginToTop) {
		this.yOnLevelStart = yOnLevelStart;
		this.yLast = this.yOnLevelStart - marginToTop;
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

	static tutorial = null;
	static levels = new Map();
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
		if (instruction.length > 2 && instruction[2] instanceof Function) {
			const args = instruction[2];
			instruction[2] = elapsed => args(elapsed, this.spawnHistory, this.level);
		}

		const spawned = super.doSpawn(instruction);
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
			instruction[2] = elapsed => args(elapsed, this.spawnHistory, this.level);
		}
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