Level.levels.set("DD1301", () => {
	const level = new Level(
		{
			"code": "DD1301",
			"name": "Datorintroduktion",
			"hp": 1.5
		},
		3, // Homework-tokens
		0, // KS-tokens
		0  // Tenta-tokens
	);
	
	// Skapa en liten stege
	const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;
	const start = level.defineRegion("start")
		.wait(210)
		.spawn(Platform, 5, (elapsed, spawnHistory, level) => [
			platWidth * 2,
			level.yCurrent
		]).spaced(200);
	
	// placeholder, lite godtyckliga loopande plattformar
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

	const fake = new Region()
	.spawn(FakePlatform, 40, (elapsed, spawnHistory, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + Math.random() * 200
		]).over(regular.length);

	const enemies = new Region()
		.wait(regular.length / 10)
		.spawn(TFPassive, 9, (elapsed, spawnHistory, level) => [
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
		.interleave(fake)
		.interleave(enemies)
		.interleave(tokens)
		.interleave(powerups);

	level.initialRegion(start);
	start.follower(looping);
	looping.follower(looping);

	return level;
});
Level.levels.set("DD1331", () => {
	const level = new Level(
		{
			"code": "DD1301",
			"name": "Datorintroduktion",
			"hp": 5
		},
		// Oklart hur många labbar
		3, // Homework-tokens
		1, // KS-tokens
		0  // Tenta-tokens
	);

	// ...

	return level;
});
Level.levels.set("DD1320", () => {
	const level = new Level(
		{
			"code": "DD1320",
			"name": "Tillämpad datalogi",
			"hp": 6
		},
		10, // Homework-tokens
		5, // KS-tokens
		0  // Tenta-tokens
	);

	// ...

	return level;
});
Level.levels.set("DD1396", () => {
	const level = new Level(
		{
			"code": "DD1396",
			"name": "Parallellprogrammering i introduktion till datalogi",
			"hp": 3
		},
		0, // Homework-tokens
		3, // KS-tokens
		0  // Tenta-tokens
	);

	// ...

	return level;
});