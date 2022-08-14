const SCORE_MAX = 2000;
const SCORE_MIN_ON_WIN = 1200;
const SCORE_REDUCTION_PER_DEATH = 8;
const SCORE_PARTIAL_MAX = 1000;
const ENDPOINT_REPORT_SCORE = "https://f.kth.se/cyberfohs/set_nollejump_highscore";
const ENDPOINT_GET_HIGHSCORES = "https://f.kth.se/cyberfohs/get_nollejump_highscore";
let ApiSettings = null;
let highscoreData = null;

class ScoreReporter {
    static set apiSettings(value) {
        ApiSettings = value;
        console.log("Satte API-parametrar:", value);
        this.updateHighscoreData();
    }
    static get apiSettings() {
        return ApiSettings;
    }
    static get myHighscore() {
        if (!highscoreData) {
            return null;
        }
        return highscoreData.your_highscore;
    }
    /** @type {any[]} */
    static get highscoreList() {
        if (!highscoreData) {
            return null;
        }
        return highscoreData.highscore_list;
    }

    static updateHighscoreData(onSuccess = null, onFail = null, onNoParams = null) {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");

        if (!this.apiSettings && token !== null)
            this.apiSettings = {
                token: token,
            };

        if (!this.apiSettings) {
            console.warn("API-parametrarna är inte definierade, så kan inte hämta highscorelistan.");
            if (onNoParams) onNoParams();
            return;
        }

        // Dummy data
        // highscoreData = {
        //     highscore_list: [
        //         {score: 400, name: 'Adam', teamname: 'DSVG'},
        //         {score: 397, name: 'Berit', teamname: 'Orden'},
        //         {score: 256, name: 'Cecil', teamname: 'Också DSVG'},
        //         {score: 404, name: 'Dagny', teamname: 'Area 52'},
        //         {score: 400, name: 'Eskil', teamname: 'DSVG'},
        //         {score: 397, name: 'Frida', teamname: 'Orden'},
        //         {score: 256, name: 'Göran', teamname: 'Också DSVG'},
        //         {score: 404, name: 'Hanna', teamname: 'Area 52'},
        //         {score: 400, name: 'Ivar', teamname: 'DSVG'},
        //         {score: 397, name: 'Jessica', teamname: 'Orden'},
        //     ],
        //     your_highscore: 12,
        // };
        // if (onSuccess) onSuccess();

        fetch(
            ENDPOINT_GET_HIGHSCORES,
            {
                method: "GET",
                headers: new Headers({
                    "Authorization": `Token ${this.apiSettings.token}`,
                }),
            }
        ).then(response => {
            if (response.status >= 200 && response.status < 300) {
                response.json().then(data => {
                    console.log("Hämtade highscorelista:", data);
    
                    highscoreData = data;
                    if (onSuccess) onSuccess();
                });
            }
            else {
                console.error("Oväntad respons vid hämtning av highscorelista:", response);
                if (onFail) onFail(response);
            }
        }).catch(reason => {
            console.error("Kunde inte hämta highscorelistan:", reason);
            if (onFail) onFail(reason);
        });
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

    static report(won, onSuccess = null, onFail = null, onNoParams = null) {
        const url = new URL(window.location.href);
        const token = url.searchParams.get("token");
        if (!this.apiSettings && token !== null)
            this.apiSettings = {
                token: token,
            };
        
        // alert("API-inställningar: " + JSON.stringify(this.apiSettings));
        if (!this.apiSettings) {
            console.warn("API-parametrarna är inte definierade, så kan inte rapportera in poängen.");
            if (onNoParams) onNoParams();
            return;
        }
        // Räkna ut poäng
        const score = this.currentScore(won);
        if (ScoreReporter.myHighscore !== null && score <= ScoreReporter.myHighscore) {
            console.log(`Rapporterar inte in poäng eftersom den är lägre än personbästa: ${score} <= ${ScoreReporter.myHighscore}`);
            onSuccess();
            return;
        }
        console.log("Rapporterar poäng:", score);

        // Rapportera in individuell poäng
        const data = { "score": score };
        fetch(
            ENDPOINT_REPORT_SCORE,
            {
                method: "POST",
                body: JSON.stringify(data),
                headers: new Headers({
                    "Authorization": `Token ${this.apiSettings.token}`,
                    "Content-Type": "application/json",
                }),
            }
        ).then(response => {
            if (response.status >= 200 && response.status < 300) {
                console.log("Rapporterade in poäng:", score);
                if (onSuccess) onSuccess();
            }
            else {
                console.error("Oväntat svar vid poänginrapportering:", response);
                if (onFail) onFail(response);
            }
        }).catch(reason => {
            console.error("Kunde inte rapportera in poängen:", reason);
            if (onFail) onFail(reason);
        });
    }
}
