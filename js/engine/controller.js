let _Controller__instances = [];
class Controller {
    static get _instances() { return _Controller__instances;}
	static set _instances(value) { _Controller__instances = value;}
    static get isSingleInstance() {
        return this._instances.length === 1;
    }
    static get instance() {
        if (this.isSingleInstance)
            return this._instances[0];
        else
            throw new Error("Multiple controllers exist: " + this._instances.length);
    }

    constructor(canvas, updateInterval = null, gridWidth = null, gridHeight = null,
            gridOrigin = GameArea.GRID_ORIGIN_UPPER_LEFT, fastForwardFactor = 3,
            cancelFFOnPause = false) {
        if (typeof (canvas) === "string")
            canvas = document.getElementById(canvas);
        this.gameArea = new GameArea(canvas, gridWidth, gridHeight, gridOrigin);
        
        this.updateInterval = updateInterval;
        this._useAnimationFrameForUpdate = this.updateInterval === null;
        this.mainInterval = null;
        this.timestampLast = null;
        this.isPaused = true;
        this.isFF = false;
        this.minDelta = 0;
        this.maxDelta = 1000 / 24; // about 42 ms
        this.abandonFrameDeltaThreshold = this.maxDelta * 2;
        
        this.fastForwardFactor = fastForwardFactor;
        this.cancelFFOnPause = cancelFFOnPause;
        
        this.drawLoop = null;
        // The id of the next registered object
        this.idCounter = 0;
        // All objects which receive update calls
        this.objects = new LinkedList();
        // Objects which are drawn over all others
        this.delayedRenderObjects = [];
        this.clearOnDraw = true;

        this.scheduledWorldScroll = {x: 0, y: 0};

        // Buttons
        this.playbutton = document.getElementById("playButton");
        this.ffbutton = document.getElementById("fastForwardButton");
        this.resetbutton = document.getElementById("resetButton");
        this.difficultySelect = document.getElementById("difficultySelect");

        if (this.playbutton)
            this.playbutton.onclick = this.togglePause.bind(this);
        if (this.ffbutton) {
            this.ffbutton.onclick = this.toggleFastForward.bind(this);
            this.ffbutton.disabled = this.isPaused;
        }
        if (this.difficultySelect)
            this.difficultySelect.onchange = this.onDifficultyChange.bind(this);

        // Info field
        this.messageBox = document.getElementById("messageBox");

        this.constructor._instances.push(this);

        Resource.loadAssets(this.onAssetLoadUpdate.bind(this)).then(this.onAssetsLoaded.bind(this));
    }

    set fastForwardFactor(value) {
        if (this.isFF) {
            this.toggleFastForward();
            this._fastForwardFactor = value;
            this.toggleFastForward();
        } else
            this._fastForwardFactor = value;
    }
    get fastForwardFactor() {
        return this._fastForwardFactor;
    }

    startDrawLoop() {
        this.drawLoop = window.requestAnimationFrame(this.draw.bind(this));
    }
    stopDrawLoop() {
        window.cancelAnimationFrame(this.drawLoop);
        this.drawLoop = null;
    }

    onAssetLoadUpdate(progress, total) {}
    onAssetsLoaded() {}

    onDifficultyChange(e) {}

    togglePause() {
        if (this.isPaused)
            this.onPlay();
        else
            this.onPause();
    }

    toggleFastForward() {
        if (this.isFF) {
            if (!this._useAnimationFrameForUpdate) {
                clearInterval(this.mainInterval);
                this.mainInterval = setInterval(() => this.update(), this.updateInterval);
            }
            this.isFF = false;
            this.offFastForward();
        }
        else {
            if (!this._useAnimationFrameForUpdate) {
                clearInterval(this.mainInterval);
                this.mainInterval = setInterval(() => this.update(), this.updateInterval / this._fastForwardFactor);
            }
            this.isFF = true;
            this.onFastForward();
        }
    }

    onPlay() {
        this.isPaused = false;
        this.timestampLast = null;
        if (this._useAnimationFrameForUpdate)
            this.mainInterval = window.requestAnimationFrame(this.update.bind(this));
        else
            this.mainInterval = setInterval(() => this.update(), this.isFF ? this.updateInterval / this._fastForwardFactor : this.updateInterval);

        if (this.playbutton) {
            this.playbutton.children[0].classList.add("hidden");
            this.playbutton.children[1].classList.remove("hidden");
        }
        if (this.ffbutton)
            this.ffbutton.disabled = false;
    }

    onPause() {
        this.isPaused = true;
        if (this._useAnimationFrameForUpdate)
            window.cancelAnimationFrame(this.mainInterval);
        else
            clearInterval(this.mainInterval);
        this.mainInterval = null;

        if (this.playbutton) {
            this.playbutton.children[0].classList.remove("hidden");
            this.playbutton.children[1].classList.add("hidden");
        }
        if (this.ffbutton)
            this.ffbutton.disabled = true;
        if (this.cancelFFOnPause) {
            this.isFF = false;
            this.offFastForward();
        }
    }

    onFastForward() {
        if (this.ffbutton)
            this.ffbutton.classList.add("keptPressed");
    }

    offFastForward() {
        if (this.ffbutton)
            this.ffbutton.classList.remove("keptPressed");
    }

    setMessage(message, pureText = true) {
        if (this.messageBox) {
            if (pureText)
                this.messageBox.innerText = message;
            else
                this.messageBox.innerHTML = message;
        } else
            console.warn("Tried to set message, but no message box found: " + message);
    }

    clearMessage() {
        if (this.messageBox)
            this.messageBox.innerText = "\xa0";
        else
            console.warn("Tried to clear message, but no message box found: " + message);
    }

    // Clear the canvas and let all objects redraw themselves
    update(timestamp) {
        if (!this._useAnimationFrameForUpdate)
            timestamp = new Date().getTime();

        // Skip first frame
        if (this.timestampLast === null) {
            if (this._useAnimationFrameForUpdate)
                this.mainInterval = window.requestAnimationFrame(this.update.bind(this));
            this.timestampLast = timestamp;
            return;
        }

        let delta = timestamp - this.timestampLast;
        
        if (delta < this.minDelta) {
            if (this._useAnimationFrameForUpdate)
                this.mainInterval = window.requestAnimationFrame(this.update.bind(this));
            return;
        }
        this.timestampLast = timestamp;

        // Prevent single frames with too large delta,
        // which otherwise cause collision detection / physics issues etc.
        if (delta > this.abandonFrameDeltaThreshold) {
            if (this._useAnimationFrameForUpdate)
                this.mainInterval = window.requestAnimationFrame(this.update.bind(this));
            return;
        }
        delta = Math.min(this.maxDelta, delta);
        
        if (this._useAnimationFrameForUpdate && this.isFF)
            delta *= this._fastForwardFactor;

        // Setting an object's id to null indicates it is to be destroyed
        for (const obj of this.objects.filterIterate(obj => obj.id !== null))
            if (obj.update !== undefined)
                obj.update(delta);

        // Objects with delayed rendering are updated as usual,
        // but the separate list tracking them must also be kept clean from null-id objects
        for (let i = 0; i < this.delayedRenderObjects.length; i++) {
            if (this.delayedRenderObjects[i].id === null) {
                this.delayedRenderObjects = this.delayedRenderObjects.filter(o => o.id !== null);
                break;
            }
        }

        if (this.scheduledWorldScroll.x !== 0 || this.scheduledWorldScroll.y !== 0){
            for (const obj of this.objects)
                if (obj.id !== null)
                    obj.translate(-this.scheduledWorldScroll.x, this.scheduledWorldScroll.y);
                
            this.scheduledWorldScroll.x = 0;
            this.scheduledWorldScroll.y = 0;
        }

        if (this._useAnimationFrameForUpdate)
            this.mainInterval = window.requestAnimationFrame(this.update.bind(this));
    }

    scrollWorld(x, y) {
        this.scheduledWorldScroll.x += x;
        this.scheduledWorldScroll.y += y;
    }

    draw() {
        if (this.clearOnDraw)
            this.gameArea.clear();
        
        for (const obj of this.objects)
            if (obj.id !== null)
                obj.draw(this.gameArea);
        
        // I think this effectively draws delayed render objects twice,
        // since they are included in this.objects as well?
        for (let i = 0; i < this.delayedRenderObjects.length; i++)
            if (this.delayedRenderObjects[i].id !== null)
                this.delayedRenderObjects[i].draw(this.gameArea);

        this.drawLoop = window.requestAnimationFrame(this.draw.bind(this));
    }

    // Register an object to receive update calls.
    // It should have an update method, a draw method accepting a GameArea, and allow for setting an id
    registerObject(object, prepend = false, delayedRendering = false) {
        if (prepend)
            this.objects.prepend(object);
        else
            this.objects.push(object);
        object.id = this.idCounter++;
        if (delayedRendering)
            this.delayedRenderObjects.push(object);
    }

    // Make the object stop receiving update calls.
    unregisterObject(object) {
        object.id = null;
    }
}

// A doubly linked list used to store objects
class LinkedList {
    constructor() {
        this.first = null;
        this.last = null;
        this.count = 0;
    }
    // Add an object at the end of the list
    push(obj) {
        if (this.first === null) {
            this.first = { obj: obj, next: null, prev: null };
            this.last = this.first;
        }
        else {
            let node = { obj: obj, next: null, prev: this.last };
            this.last.next = node;
            this.last = node;
        }
        this.count++;
    }
    // Add an object at the beginning of the list
    prepend(obj) {
        if (this.first === null) {
            this.first = { obj: obj, next: null, prev: null };
            this.last = this.first;
        }
        else {
            let node = { obj: obj, next: this.first, prev: null };
            this.first.prev = node;
            this.first = node;
        }
        this.count++;
    }
    // Remove a node from the list
    // Note that this accept a linked list node, not the data itself,
    // which you persumably get by iterating through the list using .next
    remove(node) {
        if (node === this.first) {
            this.first = node.next;
            if (this.first === null)
                this.last = null;
            else
                this.first.prev = null;
        }
        if (node === this.last) {
            this.last = node.prev;
            if (this.last === null)
                this.first = null;
            else
                this.last.next = null;
        }

        if (node.prev !== null)
            node.prev.next = node.next;

        if (node.next !== null)
            node.next.prev = node.prev;

        node.next = undefined;
        node.prev = undefined;
        this.count--;
    }

    clear() {
        this.first = null;
        this.last = null;
        this.count = 0;
    }

    *[Symbol.iterator]() {
        for (let current = this.first; current !== null; current = current.next) {
            yield current.obj;
        }
    }

    *filterIterate(func) {
        for (let current = this.first; current !== null; current = current.next) {
            if (func(current.obj))
                yield current.obj;
            else {
                let c = current.prev;
                this.remove(current);
                current = c || this.first;
                if (current === null)
                    break;
                else
                    continue;
            }
        }
    }

    toArray() {
        return [...this];
    }
}