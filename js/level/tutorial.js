Level.tutorial = () => {
	const level = new Level(
		{
			"code": "SF0003",
			"name": "Introduktion i matematik",
			"hp": 1.5
		},
		0, // Homework-tokens
		1, // KS-tokens
		0  // Tenta-tokens
	);
	// Täck botten med plattformar och skapa en liten stege
	const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;
	const start = level.defineRegion("start")
		.wait(10)
		.spawn(
			Platform,
			Math.ceil(controller.gameArea.gridWidth / platWidth),
			(elapsed, spawnHistory, level) => [
				spawnHistory.length * platWidth,
				level.yCurrent
			]).immediately()
		.wait(200)
		.spawn(Platform, 4, (elapsed, spawnHistory, level) => [
			platWidth * 2,
			level.yCurrent
		]).spaced(200);
	
	// placerholder, lite godtyckliga loopande plattformar
	const regular = level.defineRegion("looping")
		.spawn(Platform, 100, (elapsed, spawnHistory, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + Math.random() * 100
		]).spaced(150);

	const moving = new Region()
		.spawn(BasicMovingPlatform, 40, (elapsed, spawnHistory, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + Math.random() * 200
		]).over(regular.length);

	const enemies = new Region()
		.wait(regular.length / 10)
		.spawn(TF1, 9, (elapsed, spawnHistory, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + Math.random() * 200
		])
		.over(regular.length * 9 / 10);
	
	const looping = regular
		.interleave(moving)
		.interleave(enemies);

	level.initialRegion(start);
	start.follower(looping);
	looping.follower(looping);

	return level;
};