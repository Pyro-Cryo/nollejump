Level.levels.set("DD1301", (infoOnly) => {
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
	if (infoOnly)
		return level;

	const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;
	const spacing = 180;

	const lecture = level.defineRegion("lecture");
	const twoWideLadder = (e, spawnHistory, level) => {
		const spawnedPlatforms = spawnHistory.filter(spawned => spawned.object instanceof Platform);
		let xLeft;
		if (spawnedPlatforms.length === 0)
			xLeft = platWidth / 2 + Math.random() * (controller.gameArea.gridWidth / 2 - platWidth);
		else
			xLeft = spawnedPlatforms[0].xSpawn;
		if (spawnedPlatforms.length % 2 === 0)
			return [xLeft, level.yCurrent];
		else
			return [xLeft + platWidth, spawnedPlatforms[spawnedPlatforms.length - 1].ySpawn];
	};
	const jumpRight = (e, spawnHistory, level) => {
		const spawnedPlatforms = spawnHistory.filter(spawned => spawned.object instanceof Platform);
		const lastSpawned = spawnedPlatforms[spawnedPlatforms.length - 1];
		if (spawnedPlatforms.length % 2 === 0)
			return [controller.gameArea.gridWidth - lastSpawned.xSpawn, level.yCurrent];
		else
			return [lastSpawned.xSpawn - platWidth, lastSpawned.ySpawn];
	};
	lecture.wait(spacing)
		.spawn(Platform, 6, twoWideLadder)
		.spawn(Platform, 2, jumpRight)
		.spaced(spacing);

	const test = level.defineRegion("test");
	test.wait(spacing).spawn(Platform, 6, twoWideLadder).spaced(spacing);
	test.wait(spacing / 2).spawn(BasicMovingPlatform, 2, jumpRight).immediately().wait(spacing / 2);
	test.spawn(Homework, 1, (e, spawnHistory, l) => [
		spawnHistory[spawnHistory.length - 1].xSpawn + platWidth / 2,
		spawnHistory[spawnHistory.length - 1].ySpawn + platWidth / 2
	]).immediately();

	const riggedTest = level.defineRegion("riggedTest");
	riggedTest.wait(spacing).spawn(Platform, 6, twoWideLadder).spaced(spacing);
	riggedTest.wait(spacing / 8).spawn(FakePlatform, 2, jumpRight).immediately().wait(spacing / 8);
	riggedTest.spawn(Homework, 1, (e, spawnHistory, l) => [
		spawnHistory[spawnHistory.length - 1].xSpawn + platWidth / 2,
		spawnHistory[spawnHistory.length - 1].ySpawn + platWidth / 2
	]).immediately();

	level.initialRegion(lecture);
	lecture.follower(lecture, 1);
	lecture.follower(test, 2, level => level.homeworkCurrent < 2);
	lecture.follower(riggedTest, 2, level => level.homeworkCurrent >= 2);
	test.follower(lecture);
	riggedTest.follower(lecture);

	return level;
});
Level.levels.set("DD1331", (infoOnly) => {
	const level = new Level(
		{
			"code": "DD1331",
			"name": "Grundläggande programmering",
			"hp": 5
		},
		// Oklart hur många labbar
		3, // Homework-tokens
		1, // KS-tokens
		0  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	// ...

	return level;
});
Level.levels.set("DD1320", (infoOnly) => {
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
	if (infoOnly)
		return level;

	// ...

	return level;
});
Level.levels.set("DD1396", (infoOnly) => {
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
	if (infoOnly)
		return level;

	// ...

	return level;
});