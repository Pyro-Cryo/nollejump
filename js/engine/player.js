class Player extends GameObject {
	/**
	 * 
	 * @param {Number} x 
	 * @param {Number} y 
	 * @param {Map} keyActionMap
	 */
	constructor(x, y, keyActionMap, image = null, angle = null, scale = null, register = true) {
		super(x, y, image, angle, scale, register);

		this.keyActionMap = keyActionMap;
		this.isPressed = new Map();
		for (const action of this.keyActionMap.values())
			if (!this.isPressed.has(action))
				this.isPressed.set(action, false);

		this.lastPressed = null;
		this.pressDuration = -1;

		document.body.addEventListener('keydown', e => {
			if (!this.keyActionMap.has(e.code))
				return true;

			const action = this.keyActionMap.get(e.code);

			// Ignorera att flera event firas medan en knapp är nedtryckt
			if (/*action && */!this.isPressed.get(action)) {
				this.isPressed.set(action, true);
				this.lastPressed = action;
				this.pressDuration = -1;
			}

			e.preventDefault();
		});

		document.body.addEventListener('keyup', e => {
			if (!this.keyActionMap.has(e.code))
				return true;

			const action = this.keyActionMap.get(e.code);

			// "Kom ihåg" senaste knapptryckningen när i en situation
			// när en knapp hålls ner konstant och en annan trycks kort samtidigt
			this.isPressed.set(action, false);
			if (this.lastPressed === action) {
				this.lastPressed = null;
				this.pressDuration = -1;

				for (const [action, isPressed] of this.isPressed.entries()) {
					if (isPressed/* && action !== excluded_action*/) {
						this.lastPressed = action;
						break;
					}
				}
			}

			e.preventDefault();
		});
	}

	update(delta) {
		super.update(delta);
		
		if (this.lastPressed !== null) {
			// Så att första updaten efter att en knapp trycks ner har pressDuration 0,
			// om super.update() körs först i successors
			if (this.pressDuration === -1)
				this.pressDuration = 0;
			else
				this.pressDuration += delta;
		}
	}
}