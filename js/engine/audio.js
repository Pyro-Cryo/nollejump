class LoopableAudio extends Audio {
    constructor(src = "", loop = true, volume = 0.3, bufferLength = 0.15) {
        super(src);
        this.loop = loop;
        this.preload = true;
        this.addEventListener('timeupdate', () => {
            if (this.currentTime > this.duration - bufferLength) {
                this.currentTime = 0;
                this.play();
            }
        }, false);
        this.volume = volume;
    }
}

class LoopableAudioWithTail extends Audio {
    constructor(src = "", volume = 0.3, length = null, margin = 0) {
        super(src);
        try {
            this.loop = true;
            this.volume = volume;
            this.preload = true;
            this.length = length;
            this.margin = margin;
            this.currentTimeLast = 0;
            this.onLoop = () => {
                this.currentTime -= this.length;
                this.play();
            };
            this.addEventListener('timeupdate', () => {
                if (this.currentTime >= (this.length || this.duration) - this.margin)
                    this.onLoop();
                this.currentTimeLast = this.currentTime;
            }, false);
        } catch (e) {
            alert(e);
            throw e;
        }
    }
}
