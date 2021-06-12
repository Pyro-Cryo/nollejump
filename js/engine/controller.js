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

    constructor(canvas, gridWidth = null, gridHeight = null, fastForwardFactor = 3, cancelFFOnPause = false) {
        if (typeof (canvas) === "string")
            canvas = document.getElementById(canvas);
        // Store the game area, which can be drawn to
        this.gameArea = new GameArea(canvas, gridWidth, gridHeight);
        // Essentially the frame rate inverse
        this.updateInterval = 20; //milliseconds
        // Store the inteval object so that we can abort the main loop
        this.mainInterval = null;
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
        this.messagebox = document.getElementById("messagebox");

        this.constructor._instances.push(this);
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

    begin() {
        this.drawLoop = window.requestAnimationFrame(this.draw.bind(this));
    }

    onDifficultyChange(e) { }

    togglePause() {
        if (this.isPaused)
            this.onPlay();
        else
            this.onPause();
    }

    toggleFastForward() {
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
        if (this.messagebox) {
            if (pureText)
                this.messagebox.innerText = message;
            else
                this.messagebox.innerHTML = message;
        } else
            console.warn("Tried to set message, but no message box found: " + message);
    }

    clearMessage() {
        if (this.messagebox)
            this.messagebox.innerText = "\xa0";
        else
            console.warn("Tried to set message, but no message box found: " + message);
    }

    // Clear the canvas and let all objects redraw themselves
    update() {
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
                current.obj.update();
        }
        // Objects with delayed rendering are updated as usual,
        // but the separate list tracking them must also be kept clean from null-id objects
        for (let i = 0; i < this.delayedRenderObjects.length; i++) {
            if (this.delayedRenderObjects[i].id === null) {
                this.delayedRenderObjects = this.delayedRenderObjects.filter(o => o.id !== null);
                break;
            }
        }
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
    // It should have an update method accepting a GameArea and allow for setting an id
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