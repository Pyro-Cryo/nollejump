Level.levels.set("SG1112", (infoOnly) => {
	const level = new Level(
		{
			"code": "SG1112",
			"name": "Mekanik I",
			"hp": 9
		},
		2, // Homework-tokens
		1, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;
		
	const spacing = 175;
	const displacementY = 50;
	const easy = level.defineRegion("easy");
	const intermediate = level.defineRegion("intermediate");
	const hard = level.defineRegion("hard");

	easy.wait(spacing)
		.spawn(Platform, 5, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing * 2)
		.interleave(new Region().wait(spacing)
			.spawn(AngledPlatform, 9, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY,
				Math.PI * (Math.random() * 25 + 10) * (Math.random() < 0.5 ? -1 : 1) / 180
			]).spaced(spacing))
		.interleave(new Region().wait(spacing * 7).spawn(Homework, 1, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).immediately());

	intermediate.wait(spacing)
		.spawn(AngledPlatform, 10, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			Math.PI * (Math.random() * 35 + 10) * (Math.random() < 0.5 ? -1 : 1) / 180
		]).spaced(spacing)
		.interleave(new Region().wait(spacing)
			.spawn(AngledPlatform, 7, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY,
				Math.PI * (Math.random() * 25 + 10) * (Math.random() < 0.5 ? -1 : 1) / 180,
				0
			]).spaced(spacing * 1.5))
		.interleave(new Region().wait(spacing * 7).spawn(KS, 1, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).immediately());

	hard.wait(spacing)
		.spawn(AngledPlatform, 15, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			Math.PI * (Math.random() * 35 + 10) * (Math.random() < 0.5 ? -1 : 1) / 180,
			Math.floor(Math.random() * 2) * Math.PI / 2
		]).spaced(spacing * 0.8)
		.interleave(new Region().wait(spacing * 7).spawn(Tenta, 1, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).immediately());

	level.initialRegion(easy);
	easy.follower(intermediate, 1, level => level.homeworkCurrent != level.homeworkNeeded || level.ksCurrent !== level.ksNeeded);
	intermediate.follower(easy);
	easy.follower(hard, 1, level => level.homeworkCurrent == level.homeworkNeeded && level.ksCurrent === level.ksNeeded);
	hard.follower(easy);

	return level;
});
Level.levels.set("SG1115", (infoOnly) => {
	const level = new Level(
		{
			"code": "SG1115",
			"name": "Partikeldynamik med projekt",
			"hp": 7.5
		},
		// Hur många inlämningar?
		2, // Homework-tokens
		0, // KS-tokens
		2  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	// ...

	return level;
});