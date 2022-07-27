# nØllejump

## Hur man spelar
1. Öppna [index.html](https://pyro-cryo.github.io/nollejump).
2. TODO

## Lore primer & beskrivning
Inspirerat av nåt som rimmar på Noodle Jump. Maskoten hoppar på plattformar för att klättra upp för Föhseriets statusgraf (vi borde ju egentligen gjort detta förra året då det var en känguru, och inte nu när det är en sengångare, men hindsight är 2020 som man säger). Föhseriet dyker upp som fiender, rör man dem så dör man. Dör man gör man också om man missar plattformarna och trillar ner. Nivån på statusgrafen är ens poäng.

### Lösa idéer
- Olika typer av plattformar beter sig på sätt relaterat till kurserna i utbildningen (kan välja mattespår eller fysikspår). Så till exempel Mek 2 rör sig. De kommer i samma ordning som i utbildningen, och när man klättrat upp förbi sista når man raden Fysiker/Matematiker.
  - Svårt att komma på bra/roliga beteenden för alla kurser dock. Kanske att man ska samla alla kurser (plocka upp dem typ) för att nå toppen?
- Fadderisterna är upplåsbara karaktärer med olika extra förmågor.
- Mobilanpassning: styr genom att luta telefonen (fallback att karaktären följer var man trycker på skärmen?).
- Crowdsourcea de olika nivåerna på statusgrafen (dock med moderering), och/eller sorteringen. Se punkten nedan.
- Vore kul att få till en highscorelista. Går säkert om man får lite hjälp av fdev (kommer dock nog inte funka på Github Pages pga CORS?). Går säkert med mer möda om man använder Googleformulär.
- Man kanske kan skjuta frukt på fiender? Eller så ger frukt extra powerups / poäng?
- Plattforms-pathen delar på sig i horisontell led och leder till olika "examen", som fysiker, matematiker och datalog (naturligtvis tar datalog-pathen slut på en något lägre y-status-nivå än fysiker/matematiker, som står högre i rang på grafen). 
- Kombinera hoppa i y-led med att flyga genom hinder i x-led liknande ett annat känt spel som rimmar på Happy Bird. Kan bli sjukt svårt, men kanske är det TFs hemliga vapen mot att nØllan når för hög status på grafen?

### Bra idéer på plattformar / andra gameplayelement
- Plattform som trillar ner när man hoppar på den
- Termokurs med ishalka, man fortsätter glida runt i ett visst område
- Diskret plattform som teleporteras små avstånd (motsvarar en moving platform)
- Vektorfält som bara vänder accelerationen åt något visst håll
- Magnetiska plattformar som attraheras / repelleras av spelaren
- DVD-plattform som rör sig i screenspace och studsar på kanterna
