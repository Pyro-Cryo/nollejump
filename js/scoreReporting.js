let SCORE_MAX = 2000;
let SCORE_MIN_ON_WIN = 1000;
let SCORE_REDUCTION_PER_DEATH = 50;
let SCORE_PARTIAL_MAX = 800;
let ApiSettings = null;

class ScoreReporter {
    static set apiSettings(value) {
        ApiSettings = value;
        console.log("Satte API-parametrar:", value);
    }
    static get apiSettings() {
        return ApiSettings;
    }

    static currentScore(won) {
        let score;
        if (won) {
            const totalDeaths = Object.keys(controller.stats.deaths).reduce((sum, key) => sum + controller.stats.deaths[key], 0);
            score = Math.max(SCORE_MIN_ON_WIN, SCORE_MAX - totalDeaths * SCORE_REDUCTION_PER_DEATH);
        } else {
            score = SCORE_PARTIAL_MAX * controller.approximateProgress;
        }
        return Math.floor(score);
    }

    static report(won, onSuccess = null) {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        const problemStatusId = url.searchParams.get("problemStatusId");
        if (!this.apiSettings && token !== null && problemStatusId !== null)
            this.apiSettings = {token: token, problemStatusId: problemStatusId};
        
        // alert("API-inställningar: " + JSON.stringify(this.apiSettings));
        if (!this.apiSettings) {
            console.warn("API-parametrarna är inte definierade, så kan inte rapportera in poängen.");
            return;
        }
        // Räkna ut poäng
        let score = this.currentScore(won);
        console.log("Rapporterar poäng:", score);
        
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
            if (response.status >= 200 && response.status < 300) {
                console.log("Rapporterade in poäng:", score);
                if (onSuccess)
                    onSuccess();
            }
            else
                console.warn("Oväntad respons vid poänginrapportering:", response);
        }, reason => {
            console.error("Kunde inte rapportera in poängen:", reason);
        });
    }
}
