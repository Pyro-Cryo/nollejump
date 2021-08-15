Level.levels.set("SA1006", (infoOnly) => {
	const level = new Level(
		{
			"code": "SA1006",
			"name": "Ingenjörsfärdigheter i teknisk matematik",
			"hp": 4
		},
		100, // Homework-tokens
		0, // KS-tokens
		0  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;
	const start = level.defineRegion("start")
		.wait(280)
		.spawn(Platform, 5, (elapsed, spawnHistory, level) => [
			platWidth * (2 + spawnHistory.length),
			level.yCurrent
		]).spaced(260)
		.spawn(Homework, 1, (elapsed, spawnHistory, level) => [
			0, 25, spawnHistory[spawnHistory.length-1].object,
			]).immediately()
		.wait(280)
		.spawn(Platform, 5, (elapsed, spawnHistory, level) => [
			platWidth * (6 - Math.abs(spawnHistory.length-6)),
			level.yCurrent
		]).spaced(280)
		.spawn(Homework, 1, (elapsed, spawnHistory, level) => [
			0, 25, spawnHistory[spawnHistory.length-1].object,
			]).immediately();

	const ramp = level.defineRegion("ramp")
		.wait(250)
		.spawn(Platform, 1, (elapsed, spawnHistory, level) => [
			controller.gameArea.gridWidth/2,
			level.yCurrent,
		]).immediately()
		.wait(250)
		.spawn(Platform, 9, (elapsed, spawnHistory, level) => [
			(spawnHistory[spawnHistory.length - 1].xSpawn + platWidth * 5 * (Math.random() -1/2)) % controller.gameArea.gridWidth,
			level.yCurrent,
			]).spaced(250)
		.spawn(BasicMovingPlatform, 6, (elapsed, spawnHistory, level) => [
			(spawnHistory[spawnHistory.length - 1].xSpawn + platWidth * 5 * (Math.random() -1/2)) % controller.gameArea.gridWidth,
			level.yCurrent,
			]).spaced(200)
		.interleave(
			new Region()
			.wait(125)
			.spawn(DiscreteMovingPlatform, 1, (elapsed, spawnHistory, level) => [
			controller.gameArea.gridWidth/2,
			level.yCurrent,
			]).immediately()
			.wait(250)
			.spawn(DiscreteMovingPlatform, 14, (elapsed, spawnHistory, level) => [
				(spawnHistory[spawnHistory.length - 1].xSpawn + platWidth * 2 * Math.sign(Math.random())) % controller.gameArea.gridWidth,
				level.yCurrent,
				])
			.spaced(250))
		.interleave(
			new Region()
			.wait(1000)
			.spawn(Platform, 1, (e,s,l) => [controller.gameArea.gridWidth/2, l.yCurrent,])
			.immediately()
			.wait(300)
			.spawn(Platform, 15, (elapsed, spawnHistory, level) => [
				(spawnHistory[spawnHistory.length - 1].xSpawn + platWidth * 2 * Math.sign(Math.random())) % controller.gameArea.gridWidth,
				level.yCurrent,
				])
			.spaced(200))
		.interleave(
			new Region()
			.wait(1000)
			.spawn(Homework, 3, (elapsed, spawnHistory, level) => [
				controller.gameArea.gridWidth * Math.random(),
				level.yCurrent
				])
			.spaced(1000));

	const regular = level.defineRegion("kaozzz")
		.spawn(BasicMovingPlatform, 100, (elapsed, spawnHistory, level) => [
		Math.random() * controller.gameArea.gridWidth,
		level.yCurrent + Math.random() * 100
	]).spaced(100)
	.interleave(new Region()
		.wait(50)
		.spawn(ScrollingPlatform, 100, (e,s,l) => [
			Math.random() * controller.gameArea.gridWidth,
			l.yCurrent + Math.random() * 100,
			]).spaced(100)
		)
	.interleave(new Region()
		.wait(50)
		.spawn(DiscreteMovingPlatform, 100, (e,s,l) => [
			Math.random() * controller.gameArea.gridWidth,
			l.yCurrent + Math.random() * 100,
			]).spaced(100)
		)
	.interleave(new Region()
		.wait(50)
		.spawn(FakePlatform, 100, (e,s,l) => [
			Math.random() * controller.gameArea.gridWidth,
			l.yCurrent + Math.random() * 100,
			]).spaced(100)
		)
	.interleave(new Region()
		.wait(50)
		.spawn(Homework, 400, (e,s,l) => [
			Math.random() * controller.gameArea.gridWidth,
			l.yCurrent + Math.random() * 100,
			]).spaced(100/4)
		);

	level.initialRegion(start);
	start.follower(ramp);
	ramp.follower(regular)
	return level;
});