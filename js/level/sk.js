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
		2, // Homework-tokens
		2, // KS-tokens
		0  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	const colSpacing = controller.gameArea.gridHeight;
	const nRows = 10;
	const spacing = colSpacing * 2 / nRows;
	const stationary = level.defineRegion("stationary");
	const colMove = level.defineRegion("colMove");
	const modulatedColMove = level.defineRegion("modulatedColMove");
	const modulatedRow = level.defineRegion("modulatedRow");
	const movingRow = level.defineRegion("movingRow");
	const fullOnDisco = level.defineRegion("fullOnDisco");

	stationary.wait(spacing)
		.spawn(LaserRow, nRows, (e, sH, level) => [
			0,
			level.yCurrent
		]).spaced(spacing).interleave(
			new Region().wait(spacing)
			.spawn(LaserColumn, 2, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent
			]).spaced(colSpacing));

	colMove.wait(spacing)
		.spawn(LaserRow, nRows, (e, sH, level) => [
			0,
			level.yCurrent
		]).spaced(spacing).interleave(
			new Region().wait(spacing)
			.spawn(LaserColumn, 2, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent,
				"movingX"
			]).spaced(colSpacing))
			.interleave(new Region()
			.wait(spacing * nRows / 2)
			.spawn(Homework, 1, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + 20
			]).immediately());

	modulatedColMove.wait(spacing)
		.spawn(LaserRow, nRows, (e, sH, level) => [
			0,
			level.yCurrent
		]).spaced(spacing).interleave(
			new Region().wait(spacing)
			.spawn(LaserColumn, 3, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent,
				"modulatedMoveX"
			]).spaced(colSpacing * 2 / 3));
	
	modulatedRow.wait(spacing)
		.spawn(LaserRow, nRows, (e, sH, level) => [
			0,
			level.yCurrent,
			"modulated"
		]).spaced(spacing).interleave(
			new Region().wait(spacing)
			.spawn(LaserColumn, 2, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent
			]).spaced(colSpacing));
	
	movingRow.wait(spacing)
		.spawn(LaserRow, nRows, (e, sH, level) => [
			0,
			level.yCurrent,
			"movingY"
		]).spaced(spacing).interleave(
			new Region().wait(spacing)
			.spawn(LaserColumn, 2, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent
			]).spaced(colSpacing));
	
	fullOnDisco.wait(spacing)
		.spawn(LaserRow, nRows, (e, sH, level) => [
			0,
			level.yCurrent,
			"modulated"
		]).spaced(spacing).interleave(
			new Region().wait(spacing)
			.spawn(LaserColumn, 3, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent,
				"modulatedMoveX"
			]).spaced(colSpacing))
		.interleave(new Region()
			.wait(spacing * nRows / 2)
			.spawn(KS, 1, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + 20
			]).immediately());

	level.initialRegion(stationary);

	stationary.follower(colMove);
	
	colMove.follower(modulatedRow);
	modulatedRow.follower(modulatedColMove);
	modulatedColMove.follower(colMove, 1, level => level.homeworkCurrent < level.homeworkNeeded);
	modulatedColMove.follower(movingRow, 1, level => level.homeworkCurrent === level.homeworkNeeded);

	movingRow.follower(fullOnDisco);
	fullOnDisco.follower(modulatedColMove);

	return level;
});