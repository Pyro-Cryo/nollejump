Level.levels.set("SK1104", (infoOnly) => {
	const level = new Level(
		{
			"code": "SK1104",
			"name": "Klassisk fysik",
			"hp": 7.5
		},
		0, // Homework-tokens
		1, // KS-tokens
		2  // Tenta-tokens
	);
	if (infoOnly)
		return level;
	
	const spacing = 175;
	const displacementY = 50;
	const normal = level.defineRegion("normal");
	const mixedAttractive = level.defineRegion("mixedAttractive");
	const mixedRepulsive = level.defineRegion("mixedRepulsive");
	const attractive = level.defineRegion("attractive");
	const repulsive = level.defineRegion("repulsive");
	const both = level.defineRegion("both");
	
	level.initialRegion(normal);
	
	normal.wait(spacing)
		.spawn(Platform, 12, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing);
	
	const intermediateNormal = level.defineRegion("intermediateNormal").append(normal.clone());
	
	mixedAttractive.wait(spacing)
		.spawn(Platform, 6, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing * 2)
		.interleave(new Region()
			.wait(spacing * 2)
			.spawn(MagneticPlatform, 6, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY,
				false
			]).spaced(spacing * 2));

	mixedRepulsive.wait(spacing)
		.spawn(Platform, 6, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing * 2)
		.interleave(new Region()
			.wait(spacing * 2)
			.spawn(MagneticPlatform, 6, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY,
				true
			]).spaced(spacing * 2));

	attractive.wait(spacing)
		.spawn(MagneticPlatform, 12, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			false
		]).spaced(spacing * 5 / 4)
		.spawn(KS, 1, (e, spawnHistory, l) => [
			0,
			20,
			spawnHistory[spawnHistory.length - 1].object
		]).immediately();

	repulsive.wait(spacing)
		.spawn(MagneticPlatform, 12, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			true
		]).spaced(spacing * 4 / 5);

	both.wait(spacing)
		.spawn(MagneticPlatform, 6, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			false
		]).spaced(spacing * 2)
		.interleave(new Region()
			.wait(spacing * 2)
			.spawn(MagneticPlatform, 6, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY,
				true
			]).spaced(spacing * 2)
			.spawn(Tenta, 1, (e, spawnHistory, l) => [
				0,
				20,
				spawnHistory[spawnHistory.length - 1].object
			]).immediately());

	normal.follower(mixedAttractive);
	mixedAttractive.follower(mixedRepulsive);
	mixedRepulsive.follower(intermediateNormal);

	intermediateNormal.follower(mixedAttractive);
	intermediateNormal.follower(attractive, 2);
	attractive.follower(repulsive);
	repulsive.follower(intermediateNormal);
	repulsive.follower(both, 2);
	both.follower(intermediateNormal);

	return level;
});
Level.levels.set("SK1105", (infoOnly) => {
	const level = new Level(
		{
			"code": "SK1105",
			"name": "Experimentell fysik",
			"hp": 4
		},
		6, // Homework-tokens
		2, // KS-tokens
		0  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	// ...

	return level;
});