const SCORE_MAX = 2000;
const SCORE_MIN_ON_WIN = 1000;
const SCORE_REDUCTION_PER_DEATH = 50;
const SCORE_PARTIAL_MAX = 800;
const ENDPOINT_TEAM = "https://f.kth.se/cyberfohs/problemstatus/";
const ENDPOINT_USER = "https://f.kth.se/cyberfohs/user/";
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
        const userId = url.searchParams.get("userId");
        if (!this.apiSettings && token !== null && problemStatusId !== null)
            this.apiSettings = {
                token: token,
                problemStatusId: problemStatusId,
                userId: userId
            };
        
        // alert("API-inställningar: " + JSON.stringify(this.apiSettings));
        if (!this.apiSettings) {
            console.warn("API-parametrarna är inte definierade, så kan inte rapportera in poängen.");
            return;
        }
        // Räkna ut poäng
        let score = this.currentScore(won);
        console.log("Rapporterar poäng:", score);
        
        // Skicka in för laget
        let data = { "score": score, "solved": true };
        fetch(
            `${ENDPOINT_TEAM}${this.apiSettings.problemStatusId}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: new Headers({
                    "Authorization": `Token ${this.apiSettings.token}`,
                    "Content-Type": "application/json",
                }),
                // mode: "no-cors" ???
                // credentials: "include" ???
            }
        ).then(response => {
            if (response.status >= 200 && response.status < 300) {
                console.log("Rapporterade in lagpoäng:", score);
                if (onSuccess)
                    onSuccess();
            }
            else
                console.warn("Oväntad respons vid lagpoänginrapportering:", response);
        }, reason => {
            console.error("Kunde inte rapportera in lagpoängen:", reason);
        });

        // Rapportera in individuell poäng
        data = { "nollejump_score": score };
        fetch(
            `${ENDPOINT_USER}${this.apiSettings.userId}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
                headers: new Headers({
                    "Authorization": `Token ${this.apiSettings.token}`,
                    "Content-Type": "application/json",
                }),
            }
        ).then(response => {
            if (response.status >= 200 && response.status < 300) {
                console.log("Rapporterade in individuell poäng:", score);
            }
            else
                console.warn("Oväntad respons vid individuell poänginrapportering:", response);
        }, reason => {
            console.error("Kunde inte rapportera in individuella poängen:", reason);
        });
    }
}
