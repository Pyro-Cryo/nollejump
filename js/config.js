const MASKOT_FULLNAME = "Ninni-Nils von Grr";
const MASKOT_FIRSTNAME = "Ninni-Nils";
const PROJECTILE_HINT = [`Tur då att ${MASKOT_FIRSTNAME} kan slänga`, `kyssar flera tiotals meter`];
const PROJECTILES_THROWN = n => `du har slängt ${n} kyss${n === 1 ? "" : "ar"}`;
const NO_PROJECTILES_THROWN = "du inte flörtat alls ännu";
const PROJECTILES_HIT = n => `du har charmat ${n} Föhsare`;
const PROJECTILES_HIT_PERCENTAGE = x => `du har lyckats med ${x} % av dina charmförsök`;
const THROW_PROJECTILE_INSTRUCTION = "flörta";

window.addEventListener("load", () => {
    document.getElementById("current_year").innerText = "2022";
    document.getElementById("maskot_fullname").innerText = MASKOT_FULLNAME;
    for (const element of document.getElementsByClassName("maskot_firstname")) {
        element.innerText = MASKOT_FIRSTNAME;
    }
});

/**
 * Shuffle an array in-place.
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    // För enkelhets skull så man kan definiera arrayen och shuffla den direkt.
    return arr;
}

const STATIC_TIDBITS = num_tidbits => {
    // 100 vanligaste namnen på nyfödda 1998-2005.
    const names = shuffle([
        "Adam", "Adrian", "Ahmed", "Albert", "Albin", "Alex", "Alexander", "Alfons", "Alfred",
        "Ali", "Alvin", "Anders", "Andreas", "André", "Anton", "Aron", "Arvid", "August",
        "Axel", "Benjamin", "Björn", "Carl", "Casper", "Charlie", "Christian", "Christoffer",
        "Daniel", "David", "Dennis", "Douglas", "Eddie", "Edvin", "Elias", "Elis", "Elliot",
        "Emanuel", "Emil", "Erik", "Fabian", "Felix", "Filip", "Fredrik", "Gabriel", "Gustav",
        "Hampus", "Hannes", "Henrik", "Herman", "Hugo", "Isak", "Jack", "Jacob", "Jens",
        "Jesper", "Jimmy", "Joakim", "Joel", "Johan", "Johannes", "John", "Jonas", "Jonathan",
        "Josef", "Julius", "Kalle", "Kevin", "Kim", "Leo", "Leon", "Liam", "Linus", "Loke",
        "Love", "Lucas", "Ludvig", "Lukas", "Magnus", "Malte", "Marcus", "Martin", "Mattias",
        "Max", "Maximilian", "Melker", "Melvin", "Mikael", "Milton", "Mohamed", "Mohammed",
        "Måns", "Neo", "Niklas", "Nils", "Noah", "Noel", "Oliver", "Olle", "Olof", "Oscar",
        "Otto", "Patrik", "Per", "Petter", "Pontus", "Rasmus", "Rickard", "Robert", "Robin",
        "Samuel", "Sebastian", "Simon", "Sixten", "Stefan", "Theo", "Theodor", "Thomas", "Tim", 
        "Tobias", "Tom", "Valter", "Viggo", "Viktor", "Vilgot", "Ville", "Vincent", "Wilhelm",
        "William", "Wilmer", "Agnes", "Alexandra", "Alice", "Alicia", "Alma", "Alva", "Amanda",
        "Amelia", "Andrea", "Angelica", "Anna", "Annie", "Astrid", "Beatrice", "Carolina",
        "Caroline", "Cassandra", "Cecilia", "Clara", "Cornelia", "Daniella", "Denise", "Ebba",
        "Elin", "Elina", "Elise", "Ella", "Ellen", "Ellinor", "Elsa", "Elvira", "Emelie",
        "Emilia", "Emily", "Emma", "Emmy", "Engla", "Erika", "Ester", "Evelina", "Fanny",
        "Felicia", "Filippa", "Freja", "Frida", "Gabriella", "Hanna", "Hedda", "Hilda", "Ida",
        "Isa", "Isabella", "Isabelle", "Jasmine", "Jennifer", "Jenny", "Jessica", "Johanna",
        "Jonna", "Josefine", "Julia", "Kajsa", "Karin", "Klara", "Kristina", "Lea", "Leia",
        "Lina", "Linda", "Linn", "Linnéa", "Lisa", "Liv", "Louise", "Lova", "Lovisa",
        "Madeleine", "Maja", "Malin", "Maria", "Matilda", "Meja", "Melissa", "Michelle",
        "Mikaela", "Minna", "Mira", "Miranda", "Moa", "Molly", "My", "Märta", "Nathalie",
        "Nellie", "Nicole", "Nina", "Nora", "Nova", "Olivia", "Patricia", "Paulina", "Rebecca",
        "Rebecka", "Ronja", "Sabina", "Saga", "Sandra", "Sanna", "Sara", "Selma", "Signe", "Siri",
        "Smilla", "Sofia", "Sofie", "Stella", "Stina", "Thea", "Therese", "Tilda", "Tilde",
        "Tindra", "Tova", "Tove", "Tuva", "Tyra", "Vanessa", "Vendela", "Vera", "Victoria", "Wilma",
    ]);
    // \u00AD = soft hyphen, kan användas för att avstava långa ord
    const entities = shuffle([
        "Överföhs", "Taktikföhs", "$kattföhs", "en övningsasse", "en föreläsare", "en icke-teknolog",
        "en kaffekopp med Överföhs på", "en kartongfigur av Taktikföhs", "$kattföhs mustasch",
        "en godtycklig Fysiker", "en godtycklig Matematiker", "Flörtiga Ellen", "Flörtiga Molly",
        "Flörtiga Eskil", "Flörtiga Lukas", "Ninni-Nils", "Sångföhs", "Butlern",
        "en av Butlerns mini-Ninni-Nilsar", "THS ordförande", "ordförande Rebecca",
        "minst tre nØllan",
    ]);
    const actions_together = shuffle([
        "hångla", "dansa tillsammans", "viska ömt i varandras öron", "leka fotleken", "plugga tillsammans",
        '"plugga" tillsammans', "skala potatis", "läsa nØlleforce", "åka Voi", "skriva ett gyckel",
        "spela nØllejump™ - årets bästa spel (och dessutom helt gratis!)", "sy märken",
        "hetsigt argumentera för- och nackdelar med kärnkraft", "tävla i vem som kan flest decimaler i π",
        "titta djupt i varandras ögon", "fäktas med skohorn", "kramas", "brottas", "hoppa säck",
        "tatuera in varandras namn", "skriva en labbrapport tillsammans", "svabba golvet",
        "sjunga Klappa lilla magen", "baka muffins", "öva på nØlledansen",
    ]);
    const actions_directed = shuffle([
        "hångla med", "bjuda upp", "fråga chans på", "spana in", "flörta med", "skriva en ballad till",
        "skriva en hyllningshymn till", "framföra en serenad för", "planera att rymma med",
        "cykla tandemcykel med", "kasta pappersflygplan på", "high-fivea", "spela sänka skepp med",
        "byta märken med", "skälla ut", "värma en Billyspizza åt", "fria till",
        "uttrycka sin stora beundran och respekt för", "kyssa fötterna på", "häva krossade tomater med",
        "hälsa på", "nicka åt", "leka tumbrottning med", "dela en lunchwrap med", "fixa cykeln åt",
        "skicka en lapp till", "stjäla en penna av",
    ]);
    const scenarios = [
        "på dansgolvet", "utan strumpor", "på dansgolvet, utan strumpor", "som om det gällde livet",
        "i Konsulatet", "i mikrokön i Konsulatet", "utanför Handelshögskolan", "trots att det regnade",
        "utan hänsyn till omgivningen", "på en föreläsning", "under ett infopass",
        "inne på 7-Eleven", "på tunnelbanan", "i Biblioteket", "trots att alla såg dem",
        "som om ingen skulle lägga märke till dem", "i Ugglevikskällan", "på Borggården",
        "vid badet i Brunnsviken", "(men inte särskilt bra)", "(och det var faktiskt ganska vackert)",
        "på ett inte helt Platoniskt sätt", "utan att hålla två meters avstånd", "virtuellt, i Metaverse",
        "i Nymble", "när de trodde de var ensamma", "(och Force fick allt på bild)", "i källaren till Vetenskapens hus",
        "i Teknikringen 8-korridoren", "på en föreläsares kontor", "hemma hos en doktorand", "i bastun",
    ];
    if (new Date() > new Date(2022, 7, 16)) { // Månader är nollindexerade.
        scenarios.push("under TIM-buildingen");
    }
    if (new Date() > new Date(2022, 7, 17)) {
        scenarios.push("under Övningsgasquen", "på efterköret till Övningsgasquen");
    }
    if (new Date() > new Date(2022, 7, 18)) {
        scenarios.push("under intromatten");
    }
    if (new Date() > new Date(2022, 7, 19)) {
        scenarios.push("på dansövningen", "under sångföhsningen");
    }
    if (new Date() > new Date(2022, 7, 20)) {
        scenarios.push("under Välkomstgasquen", "på Välkomstefterköret");
    }
    if (new Date() > new Date(2022, 7, 22)) {
        scenarios.push("under nØllebanquetten");
    }
    if (new Date() > new Date(2022, 7, 23)) {
        scenarios.push("under binärmiddagen", "på efterköret till binärmiddagen");
    }
    if (new Date() > new Date(2022, 7, 24)) {
        scenarios.push("under spexföhsningen");
    }
    if (new Date() > new Date(2022, 7, 25)) {
        scenarios.push("på Kårens kväll");
    }
    if (new Date() > new Date(2022, 7, 28)) {
        scenarios.push("på Stuggasquen");
    }
    if (new Date() > new Date(2022, 8, 1)) {
        scenarios.push("på nØllepubrundan");
    }
    shuffle(scenarios);

    const actions_together_location = shuffle([
        "åkte på romantisk weekend till", "funderar på att flytta till", "har gemensam släkt i",
        "aldrig har varit i", "båda växte upp i", "pluggade franska i",
        "har fått tag på en utsökt slags chokladtryfflar från",
        "slagit vad om vem som kunde vara kvar längst i", "lärt sig trolleritrick av en häxa från",
        "beställt exklusiva märken från", "tog ett sabbatsår i", "en gång cyklade hela vägen till",
        "tror att man pratar italienska i", "försökt smuggla in surströmming i",
    ]);

    const locations = shuffle([
        "Flen", "Luleå", "Hässleholm", "Halmstad", "Laholm", "Nice",
        "Arboga", "Stöde", "en charmig liten stuga i södra Tyskland",
        "Sandhamn", "Malung", "Australien", "ett hotell i Bukarest",
        "grupprummet i Konsulatet", "Maskins sektionslokal",
        "kulvertarna under Albanova", "PQ-sqrubben", "PQ-bussen",
        "Osqvik", "Sickla", "Las Vegas", "ETH",
    ]);

    const provider = {
        "name": () => names.pop(),
        "entity": () => entities.pop(),
        "nameOrEntity": () => Math.random() < entities.length / (names.length + entities.length) ? entities.pop() : names.pop(),
        "scenario": () => scenarios.pop(),
        "location": () => locations.pop(),
        "actionTogether": () => actions_together.pop(),
        "actionTogetherLocation": () => actions_together_location.pop(),
        "actionDirected": () => actions_directed.pop(),
        "sawOrHeard": () => Math.random() < 0.1 ? "hörde" : "såg",
    };
    const gossips = shuffle([
        p => `${p.name()} ${p.sawOrHeard()} ${p.nameOrEntity()} och ${p.nameOrEntity()} ${p.actionTogether()}`,
        p => `${p.name()} ${p.sawOrHeard()} ${p.nameOrEntity()} och ${p.nameOrEntity()} ${p.actionTogether()} ${p.scenario()}`,
        p => `${p.name()} ${p.sawOrHeard()} ${p.nameOrEntity()} ${p.actionDirected()} ${p.nameOrEntity()}`,
        p => `${p.name()} ${p.sawOrHeard()} ${p.nameOrEntity()} ${p.actionDirected()} ${p.nameOrEntity()} ${p.scenario()}`,
    ]);

    const options = [];
    for (const gossip of gossips) {
        options.push(gossip(provider));
    }
    if (Math.random() < 0.8) {
        options.push((p => `${p.name()} fick höra att ${p.nameOrEntity()} och ${p.nameOrEntity()} ${p.actionTogetherLocation()} ${p.location()}`)(provider));
    }
    if (Math.random() < 0.1) {
        const months = [
            'januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli',
            'augusti', 'september', 'oktober', 'november', 'december',
        ];
        options.push(`ordförande Rebecca fyller år den ${new Date().getDate()} ${months[new Date().getMonth()]}`);
    }
    if (Math.random() < 0.3) {
        options.push("allt skvaller är autogenererat och eventuella likheter med verkligheten är sammanträffanden");
    }

    const result = [];
    for (let i = 0; i < num_tidbits; i++) {
        result.push(options.splice(Math.floor(Math.random() * options.length), 1));
    }
    return result;
};