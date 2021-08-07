class ScoreReporter {
    static _apiSettings = null;
    static set apiSettings(value) {
        this._apiSettings = value;
        console.log("Satte API-parametrar:", value);
    }
    static get apiSettings() {
        return this._apiSettings;
    }

    static SCORE_MAX = 2000;
    static SCORE_MIN_ON_WIN = 1000;
    static SCORE_REDUCTION_PER_DEATH = 50;
    static SCORE_PARTIAL_MAX = 800;

    static report(won) {
        if (!this.apiSettings) {
            console.warn("API-parametrarna är inte definierade, så kan inte rapportera in poängen.");
            return;
        }
        // Räkna ut poäng
        let score;
        if (won) {
            const totalDeaths = Object.keys(this.stats.deaths).reduce((sum, key) => sum + this.stats.deaths[key], 0);
            score = Math.max(this.SCORE_MIN_ON_WIN, this.SCORE_MAX - totalDeaths * this.SCORE_REDUCTION_PER_DEATH);
        } else {
            score = this.SCORE_PARTIAL_MAX * controller.approximateProgress;
        }
        score = Math.floor(score);
        console.log(score);
        
        // Skicka in
        let data = { "score": score, "solved": true };
        fetch(
            `https://f.kth.se/cyberfohs/problemstatus/${this.apiSettings.problemStatusId}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: new Headers({
                    "Authorization": `Token ${this.apiSettings.token}`
                }),
                // mode: "no-cors" ???
                // credentials: "include" ???
            }
        ).then(response => {
            if (response.status >= 200 && response.status < 300)
                console.log("Rapporterade in poäng:", score);
            else
                console.warn("Oväntad respons vid poänginrapportering:", response);
        }, reason => {
            console.error("Kunde inte rapportera in poängen:", reason);
        });
    }
}
