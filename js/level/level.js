
class Level {



	
}


class PlatformSequence extends BasicSequence{

	constructor(dx){
		super();

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
		// intervall[i] +- något random värde så det är lite variation?

		return super.spaced(intervall);
	}

	spawn(type){
		// x = nått random värde, y = controller.y?
	}

}