const ctfysImg = Resource.addAsset("img/ctfys.jpg");
class CTFYSRight extends GameObject {
    static get image() { return Resource.getAsset(ctfysImg); }
    static get scale() { return 0.35; }

    constructor(x, y) {
        super(x, y);
    }

    update(delta) {
        super.update(delta);
        
		if (controller.screenWrap)
            despawnIfBelowBottom(this);
    }
}

const ctmatImg = Resource.addAsset("img/ctmat.jpg");
class CTMATLeft extends CTFYSRight {
    static get image() { return Resource.getAsset(ctmatImg); }
}