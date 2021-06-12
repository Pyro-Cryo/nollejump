const CAMERA_TRACKING_CENTER = 1;
const CAMERA_TRACKING_INFRAME = 2;
class Player extends EffectObject {
	/**
	 * 
	 * @param {Number} x 
	 * @param {Number} y 
	 * @param {Map} keyActionMap
	 */
	constructor(x, y, keyActionMap, cameraTracking = null, image = null, angle = null, scale = null, register = true) {
		super(x, y, image, angle, scale, register);

		this.keyActionMap = keyActionMap;
		this.isPressed = new Map();
		for (const action of this.keyActionMap.values())
			if (!this.isPressed.has(action))
				this.isPressed.set(action, false);

		this.lastPressed = null;
		this.pressDuration = -1;

		document.body.addEventListener("keydown", this.onKeyDown.bind(this));
		document.body.addEventListener("keyup", this.onKeyUp.bind(this));

		if (cameraTracking !== null) {
			if (cameraTracking instanceof Array)
				this.setCameraTracking(...cameraTracking);
			else
				this.setCameraTracking(cameraTracking);
		}
			
		this._gameArea = null;
	}

	despawn() {
		document.body.removeEventListener("keydown", this.onKeyDown.bind(this));
		document.body.removeEventListener("keyup", this.onKeyUp.bind(this));
		super.despawn();
	}

	setCameraTracking(mode, param1 = null, param2 = null, param3 = null, param4 = null) {
		this.cameraTrackingMode = null;

		switch (mode) {
			case CAMERA_TRACKING_CENTER:
				this.cameraTrackingMode = mode;

				const horizontally = param1 === null ? true : !!param1;
				const vertically = param2 === null ? horizontally : !!param2;
				this.cameraTrackingParams = {
					horizontally: horizontally,
					vertically: vertically
				};
				break;

			case CAMERA_TRACKING_INFRAME:
				this.cameraTrackingMode = mode;

				this.cameraTrackingParams = {
					marginTop: param1,
					marginRight: param2,
					marginBottom: param3,
					marginLeft: param4
				};
				break;

			default:
				throw new Error("Unknown camera tracking mode: " + this.cameraTrackingMode);
		}
	}

	onKeyDown(e) {
		if (!this.keyActionMap.has(e.code))
			return true;

		const action = this.keyActionMap.get(e.code);

		// Ignorera att flera event firas medan en knapp är nedtryckt
		if (!this.isPressed.get(action)) {
			this.isPressed.set(action, true);
			this.lastPressed = action;
			this.pressDuration = -1;
		}

		e.preventDefault();
	}

	onKeyUp(e) {
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

		if (this.cameraTrackingMode && this._gameArea !== null) {
			switch (this.cameraTrackingMode) {
				case CAMERA_TRACKING_CENTER:
					this._gameArea.centerCameraOn(
						this.x,
						this.y,
						this.cameraTrackingParams.horizontally,
						this.cameraTrackingParams.vertically);
					break;
				
				case CAMERA_TRACKING_INFRAME:
					this._gameArea.keepInFrame(
						this.x,
						this.y,
						this.imagecache.width,
						this.imagecache.height,
						this.cameraTrackingParams.marginTop,
						this.cameraTrackingParams.marginRight,
						this.cameraTrackingParams.marginBottom,
						this.cameraTrackingParams.marginLeft);
					break;
			}
		}
	}

	draw(gameArea) {
		super.draw(gameArea);
		this._gameArea = gameArea;
	}
}