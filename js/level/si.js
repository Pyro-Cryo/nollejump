Level.levels.set("SI1121", (infoOnly) => {
	const level = new Level(
		{
			"code": "SI1121",
			"name": "Termodynamik",
			"hp": 6
		},
		2, // Homework-tokens
		1, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	const spacing = 200;
	const initial = level.defineRegion("initial");
	const loop = level.defineRegion("loop");
	const homework = level.defineRegion("homework");
	const ks = level.defineRegion("ks");
	const tenta = level.defineRegion("tenta");

	initial.follower(loop);
	loop.follower(loop, 1);
	loop.follower(homework, 1, level => level.homeworkCurrent < level.homeworkNeeded);
	loop.follower(ks, 1, level => level.ksCurrent < level.ksNeeded);
	loop.follower(tenta, 1, level => level.tentaCurrent < level.tentaNeeded && level.ksCurrent === level.ksNeeded && level.homeworkCurrent === level.homeworkNeeded);
	homework.follower(loop);
	ks.follower(loop);
	tenta.follower(loop);

	level.initialRegion(initial);

	initial
		.wait(spacing)
		.spawn(CompanionCubePlatform, 5, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).over(spacing * 2);
	
	loop.wait(spacing * 5);

	homework.wait(spacing * 2).spawn(Homework, 1, (e, sH, level) => [
		Math.random() * controller.gameArea.gridWidth,
		level.yCurrent
	]).spawn(CompanionCubePlatform, 1, (e, spawnHistory, l) => [
		spawnHistory[spawnHistory.length - 1].xSpawn,
		level.yCurrent - 20
	]).immediately().wait(spacing * 3);

	ks.wait(spacing * 2).spawn(KS, 1, (e, sH, level) => [
		Math.random() * controller.gameArea.gridWidth,
		level.yCurrent
	]).immediately().wait(spacing * 3);

	tenta.wait(spacing).spawn(Tenta, 1, (e, sH, level) => [
		Math.random() * controller.gameArea.gridWidth,
		level.yCurrent
	]).immediately().wait(spacing * 2)
	.spawn(SFPassive, 1, (e, spawnHistory, level) => [
		spawnHistory[spawnHistory.length - 1].xSpawn,
		level.yCurrent
	]).immediately().wait(spacing);

	return level;
});