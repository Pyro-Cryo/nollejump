Level.win = infoOnly => {
	const level = new Level(
		{
			"code": "Diplomering:",
			"name": "Ceremoni i Stadshuset"
		},
		// Hur många inlämningar?
		0, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
    );
    level.isEndLevel = true;
	if (infoOnly)
		return level;

    const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;
    const region = level.defineRegion();
    region.wait(200);
    for (let step = 0; step < 3; step++) {
        for (let x = platWidth * 0.55; x < controller.gameArea.gridWidth - platWidth * 0.55; x += platWidth)
            region.spawn(Platform, 1, (e, sH, level) => [x, level.yCurrent]);
        region.immediately();
        region.wait(400);
    }
    region.spawn(StudentHat, 1, (e, sH, level) => [controller.gameArea.gridWidth / 2, level.yCurrent])
        .immediately();
    region.wait(200);
    region.spawn(TFPassive, 1, (e, sH, level) => [controller.gameArea.gridWidth * 10 / 26, level.yCurrent])
        .spawn(OFPassive, 1, (e, sH, level) => [controller.gameArea.gridWidth * 13 / 26, level.yCurrent])
        .spawn(SFPassive, 1, (e, sH, level) => [controller.gameArea.gridWidth * 16 / 26, level.yCurrent])
        .immediately();
    region.wait(controller.gameArea.gridHeight * 100);
    
    level.initialRegion(region);

	return level;
};
Level.levels.set("Diplomering:", Level.win);

Level.levels.set("Placeholder:", infoOnly => {
	const level = new Level(
		{
			"code": "Placeholder:",
			"name": "Vi är inte klara :("
		},
		// Hur många inlämningar?
		0, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
    );
    
	if (infoOnly)
        return level;

    const font = "32px Nunito, sans-serif";
	const textCol = "#222222";
    const initial = level.defineRegion("initial");
    const empty = level.defineRegion("empty");
    initial.follower(empty);
    empty.follower(empty);

    let i = 0; 
    initial.wait(120).spawn(Platform, 12, (e, sH, level) => [i++ * 50, level.yCurrent + 20 * (i % 2)]).immediately();
    initial.wait(500).spawn(Hint, 1, (e, sH, level) => [
        controller.gameArea.gridWidth / 2, level.yCurrent, "Vi har tyvärr inte hunnit", font, textCol
    ]).spawn(Hint, 1, (e, sH, level) => [
        controller.gameArea.gridWidth / 2, level.yCurrent - 40, "göra fler banor än", font, textCol
    ]).spawn(Hint, 1, (e, sH, level) => [
        controller.gameArea.gridWidth / 2, level.yCurrent - 80, "Kolla igen senare under veckan!", font, textCol
    ]).immediately();

    empty.wait(controller.gameArea.gridHeight * 10);
    level.initialRegion(initial);
    
    console.log(level);
    return level;
});