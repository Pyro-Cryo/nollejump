
class Physics {
	
	constructor(object) {

		this.object = object;
		this.mass = 0;
		this.e = 1;
		this.m_mod = [];
		this.e_mod = [];

		this.decay_speed = true;
		this.decay_next = true;

		// Gravity
		this.gx = 0;
		this.gy = -9.82;

		this.gx_mod = [];
		this.gy_mod = [];

		this.linear_decay_y = 0;
		this.linear_decay_x = 0;
		this.proportional_decay_y = 0;
		this.proportional_decay_x = 0;


		this.vx = 0;
		this.vy = 0;

		this.vx_mod = [];
		this.vy_mod = [];

		this.previous_vx = 0;
		this.previous_vy = 0;

		this.max_vx = Number.POSITIVE_INFINITY;
		this.max_vy = Number.POSITIVE_INFINITY;

		this.max_vx_mod = [];
		this.max_vy_mod = [];

	}

/*
	/// <ugh>
	modify_mass(key, value) {
		this._m_mod[key] = value;
	}
	unset_mass_mod(key) {
		if (this._m_mod[key] !== undefined)
			this._m_mod = this._m_mod.splice(key,1);
	}
	modify_e(key, value) {
		this._e_mod[key] = value;
	}
	unset_e_mod(key) {
		if (this._e_mod[key] !== undefined)
			this._e_mod = this._e_mod.splice(key,1);
	}
	modify_gx(key, value) {
		this._gx_mod[key] = value;
	}
	unset_gx_mod(key) {
		if (this._gx_mod[key] !== undefined)
			this._gx_mod = this._gx_mod.splice(key,1);
	}
	modify_gy(key, value) {
		this._gy_mod[key] = value;
	}
	unset_gy_mod(key) {
		if (this._gy_mod[key] !== undefined)
			this._gy_mod = this._gy_mod.splice(key,1);
	}
	modify_vx(key, value) {
		this._vx_mod[key] = value;
	}
	unset_vx_mod(key) {
		if (this._vx_mod[key] !== undefined)
			this._vx_mod = this._vx_mod.splice(key,1);
	}
	modify_vy(key, value) {
		this._vy_mod[key] = value;
	}
	unset_vy_mod(key) {
		if (this._vy_mod[key] !== undefined)
			this._vy_mod = this._vy_mod.splice(key,1);
	}
	modify_max_vx(key, value) {
		this._max_vx_mod[key] = value;
	}
	unset_max_vx_mod(key) {
		if (this._max_vx_mod[key] !== undefined)
			this._max_vx_mod = this._gx_mod.splice(key,1);
	}
	modify_max_vy(key, value) {
		this._max_vy_mod[key] = value;
	}
	unset_max_vy_mod(key) {
		if (this._max_vy_mod[key] !== undefined)
			this._max_vy_mod = this._max_vy_mod.splice(key,1);
	}


	get mass() {
		let m = this._m;
		for (var i = this._m_mod.length - 1; i >= 0; i--) {
			m *= this._m_mod[i];
		}
		return m;
	}
	get e() {
		let v = this._e;
		for (var i = this._e_mod.length - 1; i >= 0; i--) {
			v *= this._e_mod[i];
		}
		return v;
	}
	get gx() {
		let v = this._gx;
		for (var i = this._gx_mod.length - 1; i >= 0; i--) {
			v *= this._gx_mod[i];
		}
		return v;
	}
	get gy() {
		let v = this._gy;
		for (var i = this._gy_mod.length - 1; i >= 0; i--) {
			v *= this._gy_mod[i];
		}
		return v;
	}
	get vx() {
		let v = this._vx;
		for (var i = this._vx_mod.length - 1; i >= 0; i--) {
			v *= this._vx_mod[i];
		}
		return v;
	}
	get vy() {
		let v = this._vy;
		for (var i = this._vy_mod.length - 1; i >= 0; i--) {
			v *= this._vy_mod[i];
		}
		return v;
	}
	get max_vx() {
		let v = this.max_vx;
		for (var i = this.max_vx_mod.length - 1; i >= 0; i--) {
			v *= this.max_vx_mod[i];
		}
		return v;
	}
	get max_vy() {
		let v = this._max_vy;
		for (var i = this._max_vy_mod.length - 1; i >= 0; i--) {
			v *= this._max_vy_mod[i];
		}
		return v;
	}
	/// </ugh>
	*/

	accellerate(dx, dy, dt) {

		this.vx += dx*(dt/100);
		this.vy += dy*(dt/100);

	}


	applyForce(dx, dy, dt) {

		this.accellerate(dx/this.mass, dy/this.mass, dt);

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
		this.accellerate(this.gx, this.gy, dt);


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

	update(dt) {
		this.vy = 0;
		this.vx = 0;
		return [0,0];
	} 

}

