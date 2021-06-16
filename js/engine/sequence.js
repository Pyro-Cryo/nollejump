/**
 * Basklass för att skapa (spawna) sekvenser av gameobjects över ett visst intervall.
 * 
 */

class BasicSequence  {
	
	constructor() {
		this.iterating = false;
		this.currentSequence = [];
		this.totalSequence = [];
		this._sent = {};
	}

	_checks(shouldBeZero) {
		if (shouldBeZero !== undefined && shouldBeZero ^ (this.currentSequence.length === 0)) {
			console.log(this);
			throw new Error("Invalid state for that operation");
		}
		if (this.iterating)
			throw new Error("Cannot modify sequence once iteration has begun");
	}

	/**
	 * Sekvensens längd från början till slut, i enheter av rum/tids-avstånd
	 */
	length() {
		return this.totalSequence.concat(this.currentSequence).reduce((tot, ins) => ins[0] === "wait" ? tot + ins[1] : tot, 0);
	}

	sent() {
		return this._sent;
	}


	summary() {
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

	remaining() {
		let smry = this.summary();
		if (!this.iterating)
			return smry;
		let sent = this.sent();
		let rem = {};

		for (let t in smry)
			rem[t] = smry[t] - (sent[t] || 0);

		return rem;
	}

	codebook() {
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

	wait(delay) {
		this._checks(true);
		if (delay < 0)
			throw new Error("Invalid delay " + delay);

		this.totalSequence.push(["wait", delay]);

		return this;
	}

	/**
	 * 
	 */
	send(number, type) {
		this._checks();
		if (number < 0)
			throw new Error("Invalid number " + number);
		this.currentSequence = this.currentSequence.concat(new Array(number).fill(type).flat());

		return this;
	}

	append(sequence) {
		this._checks();
		sequence._checks();

		this.totalSequence = this.totalSequence.concat(sequence.totalSequence);
		return this;
	}

	immediately() {
		this._checks(false);

		this.totalSequence.push(["spawn", this.currentSequence]);
		this.currentSequence = [];

		return this;
	}

	over(intervall) {
		this._checks(false);
		if (intervall < 0)
			throw new Error("Invalid intervall " + intervall);

		let nDelays = this.currentSequence.length - 1;
		let delays = new Array(nDelays).fill(0).map(
			(_, i) => Math.floor(intervall * (i + 1) / nDelays)
				- Math.floor(intervall * i / nDelays)
		);
		for (let i = 0; i < this.currentSequence.length; i++) {
			if (i !== 0)
				this.totalSequence.push(["wait", delays[i - 1]]);
			this.totalSequence.push(["spawn", this.currentSequence[i]]);
		}
		this.currentSequence = [];

		return this;
	}

	spaced(intervall) {
		this._checks(false);
		if (intervall < 0)
			throw new Error("Invalid intervall " + intervall);

		for (let i = 0; i < this.currentSequence.length; i++) {
			if (i !== 0)
				this.totalSequence.push(["wait", intervall]);
			this.totalSequence.push(["spawn", this.currentSequence[i]]);
		}
		this.currentSequence = [];

		return this;
	}

	do(func) {
		this._checks(true);

		this.totalSequence.push(["call", func]);

		return this;
	}

	/**
	 * Sammanfläta den här sekvensen med en annan sekvens
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

	spawn(type){
		return new type();
	}

	next() {
		if (!this.iterating) {
			this.iterating = true;
			this.index = 0;
		}
		while (this.index < this.totalSequence.length && this.totalSequence[this.index][0] !== "wait") {
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
						new instruction[1]();
						this.sent[instruction[1].name] = (this.sent[instruction[1].name] || 0) + 1;
					}
					break;
			}

			this.index++;
		}
		if (this.index >= this.totalSequence.length)
			return { done: true };
		else {
			if (--this.totalSequence[this.index][1] <= 0)
				this.index++;
			return { done: false };
		}
	}
}