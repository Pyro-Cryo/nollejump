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

	const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;
	const test = level.defineRegion("test")
		.spawn(
			Platform,
			Math.ceil(controller.gameArea.gridWidth / platWidth),
			(elapsed, spawnHistory, level) => [
				(spawnHistory.length + 0.6) * platWidth,
				level.yCurrent
			]).spaced(40);
	level.initialRegion(test);
	test.follower(test);

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