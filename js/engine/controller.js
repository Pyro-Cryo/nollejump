class Controller {
    static _instances = [];
    static get isSingleInstance() {
        return this._instances.length === 1;
    }
    static get instance() {
        if (this.isSingleInstance)
            return this._instances[0];
        else
            throw new Error("Multiple controllers exist: " + this._instances.length);
    }

    constructor(canvas, updateInterval = null, gridWidth = null, gridHeight = null, fastForwardFactor = 3, cancelFFOnPause = false) {
        if (typeof (canvas) === "string")
            canvas = document.getElementById(canvas);
        this.gameArea = new GameArea(canvas, gridWidth, gridHeight);
        
        this.updateInterval = updateInterval;
        this._useAnimationFrameForUpdate = this.updateInterval === null;
        this.mainInterval = null;
        this.timestampLast = null;
        this.isPaused = true;
        this.isFF = false;
        
        this.fastForwardFactor = fastForwardFactor;
        this.cancelFFOnPause = cancelFFOnPause;
        
        this.drawLoop = null;
        // All objects which receive update calls
        this.objects = new LinkedList();
        // The id of the next registered object
        this.idCounter = 0;
        // Objects which are drawn over all others
        this.delayedRenderObjects = [];

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
        if (this._useAnimationFrameForUpdate)
            throw new Error("Cannot fast forward when using animation frames for update calls.");
        if (this.isFF) {
            clearInterval(this.mainInterval);
            this.mainInterval = setInterval(() => this.update(), this.updateInterval);
            this.isFF = false;
            this.offFastForward();
        }
        else {
            clearInterval(this.mainInterval);
            this.mainInterval = setInterval(() => this.update(), this.updateInterval / this.fastForwardFactor);
            this.isFF = true;
            this.onFastForward();
        }
    }

    onPlay() {
        this.isPaused = false;
        if (this.isFF)
            this.mainInterval = setInterval(() => this.update(), this.updateInterval / this.fastForwardFactor);
        else if (this._useAnimationFrameForUpdate)
            this.mainInterval = window.requestAnimationFrame(this.update.bind(this));
        else
            this.mainInterval = setInterval(() => this.update(), this.updateInterval);

        if (this.playbutton) {
            this.playbutton.children[0].classList.add("hideme");
            this.playbutton.children[1].classList.remove("hideme");
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
            this.playbutton.children[0].classList.remove("hideme");
            this.playbutton.children[1].classList.add("hideme");
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

    setMessage(message, pureText) {
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
            
        const delta = timestamp - this.timestampLast;
        this.timestampLast = timestamp;

        // Skip first frame and frames where the player has tabbed out a while
        if (this.timestampLast === null || delta > 1000) {
            if (this._useAnimationFrameForUpdate)
                this.mainInterval = window.requestAnimationFrame(this.update.bind(this));
            return;
        }

        for (let current = this.objects.first; current !== null; current = current.next) {
            // Setting an object's id to null indicates it is to be destroyed
            if (current.obj.id === null) {
                let c = current.prev;
                this.objects.remove(current);
                current = c || this.objects.first;
                if (current === null)
                    break;
                else
                    continue;
            }
            if (current.obj.update !== undefined)
                current.obj.update(delta);
        }
        // Objects with delayed rendering are updated as usual,
        // but the separate list tracking them must also be kept clean from null-id objects
        for (let i = 0; i < this.delayedRenderObjects.length; i++) {
            if (this.delayedRenderObjects[i].id === null) {
                this.delayedRenderObjects = this.delayedRenderObjects.filter(o => o.id !== null);
                break;
            }
        }

        if (this._useAnimationFrameForUpdate)
            this.mainInterval = window.requestAnimationFrame(this.update.bind(this));
    }

    draw() {
        this.gameArea.clear();
        for (let current = this.objects.first; current !== null; current = current.next) {
            if (current.obj.id !== null) {
                current.obj.draw(this.gameArea);
            }
        }

        for (let i = 0; i < this.delayedRenderObjects.length; i++) {
            if (this.delayedRenderObjects[i].id !== null) {
                this.delayedRenderObjects[i].draw(this.gameArea);
            }
        }

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

    toArray() {
        let array = new Array(this.count).fill(null);
        let i = 0;
        for (let current = this.first; current !== null; current = current.next) {
            array[i] = current;
            i++;
        }
        return array;
    }
}