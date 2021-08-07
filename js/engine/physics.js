
class Physics {
	
	constructor(object) {

		this.object = object;

		this.mass = 0;
		this.e = 1;	// studstal

		this.decay_speed = true;
		this.decay_next = true;

		// Gravity
		this.gx = 0;
		this.gy = -9.82;

		this.linear_decay_y = 0;
		this.linear_decay_x = 0;
		this.proportional_decay_y = 0;
		this.proportional_decay_x = 0;

		this.vx = 0;
		this.vy = 0;

		this.previous_vx = 0;
		this.previous_vy = 0;

		this.max_vx = Number.POSITIVE_INFINITY;
		this.max_vy = Number.POSITIVE_INFINITY;

	}


	accelerate(dx, dy, dt) {

		this.vx += dx*(dt/100);
		this.vy += dy*(dt/100);

	}


	applyForce(dx, dy, dt) {

		this.accelerate(dx/this.mass, dy/this.mass, dt);

	}

	/**
	 * Studsa mot en fixerad yta med en vinkel "angle"
	 * 
	 * @param{angle} vinkel på ytan du studsar mot, i radianer
	 */
	bounceSurface(angle) {

		this.vx *= (1 - 2*this.e*Math.pow(Math.sin(angle), 2));
		this.vy *= (1 - 2*this.e*Math.pow(Math.cos(angle), 2));

	}

	/**
	 * Studsa mot ett annat physics-objekt, vilket modifierar båda objektens hastighet enligt den gemensamma lokala fysiken.
	 * 
	 * @param{object} Det andra objektet
	 */
	bounceObject(object) {

		throw Exception("Not yet implemented. DIY");

	}

	/**
	 * Beräkna och applicera gravitationen som påverkar det här objektet varje frame.
	 * @param{dt} tidsdelta
	 */
	gravity(dt) {

		this.accelerate(this.gx, this.gy, dt);

	}

	/**
	 * Uppdatera och förflytta objekt.
	 */
	move (dt) {

		let dx = this.update(dt);
		this.object.x += dx[0];
		this.object.y += dx[1];

		return dx;

	}


	setSpeed(vx, vy){

		this.vx = vx;
		this.vy = vy;
	}

	/**
	 * Updatera hastighetsvektorer och returnera förflyttning
	 */
	update(dt) {

		// Gravitation
		this.gravity(dt);


		// Om vi har hastighets-decay, applicera den
		if (this.decay_next && this.decay_speed){
			this.vx /= Math.exp((dt/100) * this.proportional_decay_x);
			this.vx = Math.sign(this.vx) * Math.max(0, Math.abs(this.vx) - this.linear_decay_x * (dt/100));
		
			this.vy /= Math.exp((dt/100) * this.proportional_decay_y);
			this.vy = Math.sign(this.vy) * Math.max(0, Math.abs(this.vy) - this.linear_decay_y * (dt/100));
		}


		// Capa hastigheter till något sort maximum om det skulle vara så
		if (Math.abs(this.vx) > this.max_vx)
			this.vx = this.max_vx * Math.sign(this.vx);

		if (Math.abs(this.vy) > this.max_vy)
			this.vy = this.max_vy * Math.sign(this.vy);


		// Beräkna förflyttning med trapetsmetoden
		let dx = 0;
		let dy = 0;

		dx = (this.vx + this.previous_vx)/2 * (dt/100);
		dy = (this.vy + this.previous_vy)/2 * (dt/100);

		// Spara föregående hastighet för nästa update.
		this.previous_vy = this.vy;
		this.previous_vx = this.vx;

		// Reset flagga för decay om den avsatts. 
		this.decay_next = true;

		return [dx, dy];
	}

}


	/**
	 * Ingen fysik
	 */
class PhysicsNull extends Physics {

	constructor(object){
		super(object);

		this.decay_speed = false;
		this.decay_next = false;

		this.gy = 0;

		this.max_vx = 0;
		this.max_vy = 0;
	}

	gravity(dt) {}

	update(dt) {
		this.vy = 0;
		this.vx = 0;
		return [0,0];
	} 

}
