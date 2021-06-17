const CAMERA_TRACKING_NONE = 0;
// "regular" = keep an offset in gameArea used during drawing
const CAMERA_TRACKING_CENTER = 1;
const CAMERA_TRACKING_INFRAME = 2;
// KSP = change all objects' coordinates
const CAMERA_TRACKING_KSP_CENTER = 3;
const CAMERA_TRACKING_KSP_INFRAME = 4;

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
			case CAMERA_TRACKING_NONE:
				this.cameraTrackingMode = null;
				this.cameraTrackingParams = null;
				break;

			case CAMERA_TRACKING_CENTER:
			case CAMERA_TRACKING_KSP_CENTER:
				this.cameraTrackingMode = mode;

				const horizontally = param1 === null ? true : !!param1;
				const vertically = param2 === null ? horizontally : !!param2;
				this.cameraTrackingParams = {
					horizontally: horizontally,
					vertically: vertically
				};
				break;

			case CAMERA_TRACKING_INFRAME:
			case CAMERA_TRACKING_KSP_INFRAME:
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

		if (this.cameraTrackingMode) {
			switch (this.cameraTrackingMode) {
				case CAMERA_TRACKING_CENTER:
					if (this._gameArea)
						this._gameArea.centerCameraOn(
							this.x,
							this.y,
							this.cameraTrackingParams.horizontally,
							this.cameraTrackingParams.vertically);
					break;

				case CAMERA_TRACKING_KSP_CENTER:
					this.centerCameraOn(
						this.x,
						this.y,
						this.cameraTrackingParams.horizontally,
						this.cameraTrackingParams.vertically);
					break;
				
				case CAMERA_TRACKING_INFRAME:
					if (this._gameArea)
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
				
				case CAMERA_TRACKING_KSP_INFRAME:
					this.keepInFrame(
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

	// TODO: these probably break as well when using different grid origins
	centerCameraOn(_x, _y, horizontally = true, vertically = true) {

		let offset_x = 0;
		let offset_y = 0;
		if (horizontally)
			offset_x = this.x - Controller.instance.gameArea.gridWidth / 2;
		if (vertically)
			offset_y = Controller.instance.gameArea.gridHeight / 2 - this.y;

		if (offset_x != 0 && offset_y != 0)
			Controller.instance.scrollWorld(offset_x, offset_y);
	}

	keepInFrame(_x, _y, width = 0, height = null, marginTop = 0, marginRight = null, marginBottom = null, marginLeft = null) {
		
		let offset_x = 0;
		let offset_y = 0;

		if (height === null)
			height = width;
		if (marginRight === null)
			marginRight = marginTop;
		if (marginBottom === null)
			marginBottom = marginTop;
		if (marginLeft === null)
			marginLeft = marginRight;
		
		const xLeft = Controller.instance.gameArea.gridToCanvasX(this.x - width / 2);
		const xRight = Controller.instance.gameArea.gridToCanvasX(this.x + width / 2);
		const yTop = Controller.instance.gameArea.gridToCanvasY(this.y - height / 2);
		const yBottom = Controller.instance.gameArea.gridToCanvasY(this.y + height / 2);

		// Nånting sånt här typ

		// console.log(xLeft, xRight, yTop, yBottom);

		if (xLeft < marginLeft) {
			offset_x = xLeft - marginLeft;
		}
		else if (xRight > Controller.instance.gameArea.width - marginRight) {
			offset_x = xRight - Controller.instance.gameArea.width + marginRight;
		}
		if (yTop < marginTop){
			offset_y =  marginTop - yTop;
		}
		else if (yBottom > Controller.instance.gameArea.height - marginBottom){
			// console.log("bottom", this.y, yBottom, Controller.instance.gameArea.height, marginBottom);
			offset_y = -(yBottom - Controller.instance.gameArea.height + marginBottom);
			console.log(yBottom, -(yBottom - Controller.instance.gameArea.height + marginBottom));
		}


		if (offset_x != 0 || offset_y != 0) {
			// console.log(offset_x, offset_y);
			Controller.instance.scrollWorld(offset_x, offset_y);
		}

	}


}