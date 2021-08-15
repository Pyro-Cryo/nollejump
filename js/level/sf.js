Level.levels.set("SF1673", (infoOnly) => {
	const level = new Level(
		{
			"code": "SF1673",
			"name": "Analys i en variabel",
			"hp": 7.5
		},
		// Oklart med homeworks/ksar
		0, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	// ...

	return level;
});
Level.levels.set("SF1672", (infoOnly) => {
	const level = new Level(
		{
			"code": "SF1672",
			"name": "Linjär algebra",
			"hp": 7.5
		},
		3, // Homework-tokens
		1, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	const displacementY = 50;
	const spacing = 200;

	const fillerRegion = level.defineRegion("filler");
	const homeworkRegion = level.defineRegion("homework");
	const ksRegion = level.defineRegion("ks");
	const tentaRegion = level.defineRegion("tenta");
	level.initialRegion(fillerRegion);

	fillerRegion.follower(fillerRegion);
	fillerRegion.follower(homeworkRegion, 3, level => level.homeworkCurrent < level.homeworkNeeded);
	fillerRegion.follower(ksRegion, 3, level => level.ksCurrent < level.ksNeeded && level.homeworkCurrent >= 2);
	fillerRegion.follower(tentaRegion, 10, level => level.homeworkCurrent === level.homeworkNeeded && level.ksCurrent === level.ksNeeded);

	homeworkRegion.follower(fillerRegion);
	ksRegion.follower(fillerRegion);
	tentaRegion.follower(fillerRegion);

	fillerRegion.wait(spacing).spawn(Platform, 10, (e, sH, level) => [
		Math.random() * controller.gameArea.gridWidth,
		level.yCurrent + (Math.random() * 2 - 1) * displacementY
	]).spaced(spacing);

	homeworkRegion
		.wait(spacing)
		.spawn(BasicMovingPlatform, 5, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing * 2)
		.interleave(new Region()
			.wait(spacing * 2)
			.spawn(Platform, 5, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY
			]).spaced(spacing * 2)
		).interleave(new Region()
			.wait(spacing * 5)
			.spawn(Homework, 2, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY * 2
			]).spaced(spacing * 5)
	);

	ksRegion.wait(spacing)
		.spawn(ScrollingPlatform, 5, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			Math.random() < 0.5 ? 100 : -100
		]).spaced(spacing * 2)
		.interleave(new Region()
			.wait(spacing * 2)
			.spawn(BasicMovingPlatform, 5, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY
			]).spaced(spacing * 2)
		).interleave(new Region()
			.wait(spacing * 6)
			.spawn(KS, 1, (e, spawnHistory, l) => {
				let lastScrollingPlatform;
				for (let i = spawnHistory.length - 1; i >= 0; i--) {
					if (spawnHistory[i].object instanceof ScrollingPlatform)
						lastScrollingPlatform = spawnHistory[i];
				}
				return [
					0,
					-25,
					lastScrollingPlatform.object
				];
			}).immediately()
	);

	tentaRegion.wait(spacing).spawn(Platform, 10, (e, sH, level) => [
		Math.random() * controller.gameArea.gridWidth,
		level.yCurrent + (Math.random() * 2 - 1) * displacementY
	]).spaced(spacing).interleave(new Region().wait(spacing).spawn(OFFlipScreen, 1, (e, sH, level) => [
		controller.gameArea.gridWidth / 2,
		level.yCurrent
	]).immediately());


	return level;
});
Level.levels.set("SF1674", (infoOnly) => {
	const level = new Level(
		{
			"code": "SF1674",
			"name": "Flervariabelanalys",
			"hp": 7.5
		},
		// Oklart med homeworks/ksar
		0, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	// ...

	return level;
});
Level.levels.set("SF1922", (infoOnly) => {
	// Sannstat (CTFYS)
	const level = new Level(
		{
			"code": "SF1922",
			"name": "Sannolikhetsteori och statistik",
			"hp": 6
		},
		// Oklart med homeworks/ksar
		0, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	// ...

	return level;
});
Level.levels.set("SF1918", (infoOnly) => {
	// Sannstat (CTMAT)
	// Kopiera bara fysiks
	const level = Level.levels.get(SF1922)(infoOnly);
	level.code = "SF1918";
	return level;
});
Level.levels.set("SF1550", (infoOnly) => {
	const level = new Level(
		{
			"code": "SF1550",
			"name": "Numeriska metoder, grundkurs",
			"hp": 6
		},
		// Oklart med homeworks/ksar
		2, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	// ...

	return level;
});