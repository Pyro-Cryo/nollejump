/**
 * Basklass för att skapa (spawna) sekvenser av GameObjects.
 */
class BasicSequence  {
	constructor() {
		this.iterating = false;
		this.currentSequence = [];
		this.totalSequence = [];
		this._sent = {};
	}

	/**
	 * Kolla att objektet är redo för att modifieras
	 * @param {boolean} shouldBeZero 
	 */
	_checks(shouldBeZero) {
		if (shouldBeZero !== undefined && shouldBeZero ^ (this.currentSequence.length === 0)) {
			console.log(this);
			throw new Error("Invalid state for that operation");
		}
		if (this.iterating)
			throw new Error("Cannot modify sequence once iteration has begun");
	}

	/**
	 * Sekvensens kvarvarande längd till slutet, i enheter av rum/tids-avstånd
	 */
	get length() {
		return this.totalSequence.concat(this.currentSequence).reduce((tot, ins) => ins[0] === "wait" ? tot + ins[1] : tot, 0);
	}

	// Felsökningsfunktioner

	/**
	 * Ett objekt som bekriver vilka objekt som skapats hittills
	 */
	get sent() {
		return this._sent;
	}

	/**
	 * Ett objekt som beskriver hur många objekt som skapas i sekvensen
	 */
	get summary() {
		if (!this.iterating || !this._summary)
			this._summary = this.totalSequence.concat(this.currentSequence).reduce((tot, ins) => {
				if (ins[0] === "spawn") {
					if (ins[1] instanceof Array)
						for (let i = 0; i < ins[1].length; i++)
							tot[ins[1][i].constructor.name] = (tot[ins[1][i].constructor.name] || 0) + 1;
					else
						tot[ins[1].constructor.name] = (tot[ins[1].constructor.name] || 0) + 1;
				}

				return tot;
			}, {});

		return this._summary;
	}

	/**
	 * Ett objekt som beskriver hur många objekt som är kvar att skicka
	 */
	get remaining() {
		let smry = this.summary();
		if (!this.iterating)
			return smry;
		let sent = this.sent();
		let rem = {};

		for (let t in smry)
			rem[t] = smry[t] - (sent[t] || 0);

		return rem;
	}

	/**
	 * Ett objekt som mappar klassnamn till dess typ, för alla objekt som kommer spawnas av denna sekvens.
	 */
	get codebook() {
		return this.totalSequence.concat(this.currentSequence).reduce((tot, ins) => {
			if (ins[0] === "spawn") {
				if (ins[1] instanceof Array)
				{
					for (let i = 0; i < ins[1].length; i++)
						if (!tot[ins[1][i].constructor.name])
							tot[ins[1][i].constructor.name] = ins[1][i];
				}
				else
					if (!tot[ins[1].constructor.name])
						tot[ins[1].constructor.name] = ins[1];
			}

			return tot;
		}, {});
	}

	// Byggarfunktioner
	/**
	 * Ange en paus i sekvensen utan att något spawnas.
	 * @param {Number} delay Pausens längd i enheter av rum/tids-avstånd
	 */
	wait(delay) {
		this._checks(true);
		if (delay < 0)
			throw new Error("Invalid delay " + delay);

		this.totalSequence.push(["wait", delay]);

		return this;
	}

	/**
	 * Köa ett visst antal objekt. Följs av immediately(), over() eller spaced().
	 * @param {Number} number Antalet objekt som ska köas.
	 * @param {*} type Objektens typ.
	 */
	send(number, type) {
		this._checks();
		if (number < 0)
			throw new Error("Invalid number " + number);
		this.currentSequence = this.currentSequence.concat(new Array(number).fill(type).flat());

		return this;
	}

	/**
	 * Ange att de köade objekten ska skickas allihopa på en gång.
	 */
	immediately() {
		this._checks(false);

		this.totalSequence.push(["spawn", this.currentSequence]);
		this.currentSequence = [];

		return this;
	}

	/**
	 * Ange att de köade objekten ska skickas jämnt fördelat på ett intervall.
	 * @param {Number} interval Längden på intervallet i enheter av rum/tids-avstånd
	 * @param {boolean} integerize Om avstånden mellan två objekt alltid ska vara heltal.
	 */
	over(interval, integerize = false) {
		this._checks(false);
		if (interval < 0)
			throw new Error("Invalid interval " + interval);

		const nDelays = this.currentSequence.length - 1;
		let delays = new Array(nDelays);
		if (integerize) {
			delays = delays.fill(0).map(
				(_, i) => Math.floor(interval * (i + 1) / nDelays)
					- Math.floor(interval * i / nDelays)
			);
		} else
			delays = delays.fill(interval / nDelays);
		
		for (let i = 0; i < this.currentSequence.length; i++) {
			if (i !== 0)
				this.totalSequence.push(["wait", delays[i - 1]]);
			this.totalSequence.push(["spawn", this.currentSequence[i]]);
		}
		this.currentSequence = [];

		return this;
	}

	/**
	 * Ange att de köade objekten ska skickas med ett konstant avstånd sinsemellan.
	 * @param {Number} interval Längden på intervallet mellan två objekt i enheter av rum/tids-avstånd
	 */
	spaced(interval) {
		this._checks(false);
		if (interval < 0)
			throw new Error("Invalid interval " + interval);

		for (let i = 0; i < this.currentSequence.length; i++) {
			if (i !== 0)
				this.totalSequence.push(["wait", interval]);
			this.totalSequence.push(["spawn", this.currentSequence[i]]);
		}
		this.currentSequence = [];

		return this;
	}

	/**
	 * Anropa en funktion.
	 * @param {Function} func 
	 */
	do(func) {
		this._checks(true);

		this.totalSequence.push(["call", func]);

		return this;
	}

	// Kombineringsfunktioner
	/**
	 * Sammanfläta den här sekvensen med en annan sekvens.
	 * @param {BasicSequence} other Sekvensen som ska vävas ihop med denna.
	 */
	interleave(other) {
		this._checks(true);
		other._checks(true);

		let this_ind = 0;
		let other_ind = 0;

		while (this_ind < this.totalSequence.length && other_ind < other.totalSequence.length) {
			let t = this.totalSequence[this_ind];
			let o = other.totalSequence[other_ind];
			if (t[0] === "wait" && o[0] === "wait") {
				if (t[1] === o[1]) {
					this.currentSequence.push(t);
					this_ind++;
					other_ind++;
				}
				else {
					this.currentSequence.push(["wait", Math.min(t[1], o[1])]);
					if (t[1] > o[1]) {
						t[1] = t[1] - o[1];
						other_ind++;
					} else {
						o[1] = o[1] - t[1];
						this_ind++;
					}
				}
			} else {
				if (t[0] !== "wait") {
					this.currentSequence.push(t);
					this_ind++;
				}
				if (o[0] !== "wait") {
					this.currentSequence.push(o);
					other_ind++;
				}
			}
		}
		if (this_ind !== this.totalSequence.length)
			this.currentSequence = this.currentSequence.concat(this.totalSequence.slice(this_ind));
		if (other_ind !== other.totalSequence.length)
			this.currentSequence = this.currentSequence.concat(other.totalSequence.slice(other_ind));

		this.totalSequence = this.currentSequence;
		this.currentSequence = [];
		other.totalSequence = [];

		return this;
	}

	/**
	 * Lägg till en annan sekvens efter denna.
	 * @param {BasicSequence} sequence Sekvensen som ska följa denna.
	 */
	append(sequence) {
		this._checks();
		sequence._checks();

		this.totalSequence = this.totalSequence.concat(sequence.totalSequence);
		return this;
	}

	// Itereringsfunktioner
	/**
	 * Spawna ett nytt objekt av en viss typ. Kör konstruktorn utan några argument.
	 * @param {*} type Typen som ska skapas.
	 */
	spawn(type) {
		return new type();
	}

	/**
	 * Hantera andra instruktioner än "wait", "call" och "spawn" i next().
	 * @param {[string, ...*]} instruction En array med instruktionstypen först, följt av eventuella argument.
	 */
	nonstandardInstruction(instruction) {
		throw new Error(`Unknown instruction: ${instruction[0]}`);
	}
	
	/**
	 * Stega framåt i itereringen och utför de operationer som köats.
	 * @param {Number} delta Steglängd i enheter av rum/tids-avstånd
	 */
	next(delta = 1) {
		// Börja iterera första gången next() anropas, och förhindra att sekvensen ändras.
		if (!this.iterating) {
			this.iterating = true;
			this.index = 0;
		}
		// Gå igenom alla instruktioner tills vi måste vänta
		while (this.index < this.totalSequence.length && (this.totalSequence[this.index][0] !== "wait" || this.totalSequence[this.index][1] <= 0)) {
			let instruction = this.totalSequence[this.index];
			switch (instruction[0]) {
				case "call":
					instruction[1]();
					break;

				case "spawn":
					if (instruction[1] instanceof Array)
					{
						instruction[1].forEach(type => this.spawn(type));
						for (let i = 0; i < instruction[1].length; i++)
							this.sent[instruction[1][i].name] = (this.sent[instruction[1][i].name] || 0) + 1;
					}
					else
					{
						this.spawn(instruction[1]);
						this.sent[instruction[1].name] = (this.sent[instruction[1].name] || 0) + 1;
					}
					break;
				
				case "wait":
					break;
				
				default:
					// Om man ärver från denna klass kan man hantera specialinstruktioner
					// genom att overrida nonstandardInstruction()
					this.nonstandardInstruction(instruction);
					break;
			}

			this.index++;
		}

		if (this.index >= this.totalSequence.length)
			return { done: true };
		else {
			this.totalSequence[this.index][1] -= delta;
			// Om vi väntade längre än nödvändigt på denna wait, dra bort
			// motsvarande från efterföljande så totalen hålls samma
			const i = this.index;
			while (this.totalSequence[i][1] < 0) {
				let nextI = i + 1;
				while (nextI < this.totalSequence.length && this.totalSequence[nextI][0] !== "wait")
					nextI++;
				if (nextI >= this.totalSequence.length)
					break;
				this.totalSequence[nextI][1] += this.totalSequence[i][1];
				i = nextI;
			}
			if (this.totalSequence[this.index][1] <= 0)
				this.index++;
			return { done: false };
		}
	}
}
