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
	// TODO: gör en faktisk tutorial av detta
	
	// Skapa en liten stege
	const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;
	const start = level.defineRegion("start")
		.wait(210)
		.spawn(Platform, 5, (elapsed, spawnHistory, level) => [
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
	
	const tokens = new Region()
		.wait(regular.length / 5)
		.spawn(KS, 2, (elapsed, spawnHistory, level) => {
			for (let i = spawnHistory.length - 1; i >= 0; i--) {
				if (spawnHistory[i].object instanceof Platform && !(spawnHistory[i].object instanceof BasicMovingPlatform))
					return [spawnHistory[i].xSpawn, spawnHistory[i].ySpawn + 20];
			}
			return [Math.random() * controller.gameArea.gridWidth, level.yCurrent]
		}).over(regular.length * 4 / 5);

	const powerups = new Region()
		.wait(start.length)
		.spawn(RocketToken, 1, (elapsed, spawnHistory, level) => {
			console.log("jumpboost");
			for (let i = spawnHistory.length - 1; i >= 0; i--) {
				if (spawnHistory[i].object instanceof Platform && !(spawnHistory[i].object instanceof BasicMovingPlatform))
					return [spawnHistory[i].xSpawn, spawnHistory[i].ySpawn + 10];
			}
			return [Math.random() * controller.gameArea.gridWidth, level.yCurrent]
		}).immediately()
		.wait(start.length)
		.spawn(RocketToken, 1, (elapsed, spawnHistory, level) => {
			console.log("jumpboost");
			for (let i = spawnHistory.length - 1; i >= 0; i--) {
				if (spawnHistory[i].object instanceof Platform && !(spawnHistory[i].object instanceof BasicMovingPlatform))
					return [spawnHistory[i].xSpawn, spawnHistory[i].ySpawn + 10];
			}
			return [Math.random() * controller.gameArea.gridWidth, level.yCurrent]
		}).immediately();

	
	const looping = regular
		.interleave(moving)
		.interleave(enemies)
		.interleave(tokens)
		.interleave(powerups);

	level.initialRegion(start);
	start.follower(looping);
	looping.follower(looping);

	return level;
};