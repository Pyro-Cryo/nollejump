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
cyberfohslog(`Laddat ${document.currentScript.src}`);
