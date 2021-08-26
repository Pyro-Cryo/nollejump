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
	test.wait(spacing / 2).spawn(DiscreteMovingPlatform, 2,
		(e, sH, l) => [...jumpRight(e, sH, l), 100, 1, 8]).immediately().wait(spacing / 2);
	test.spawn(Homework, 1, (e, spawnHistory, l) => [
		spawnHistory[spawnHistory.length - 1].xSpawn + platWidth / 2,
		spawnHistory[spawnHistory.length - 1].ySpawn + platWidth / 2,
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

	let width = controller.gameArea.gridWidth;
	let spacing = 250;

	const variables = level.defineRegion("intro to variables");
	variables.wait(spacing).spawn(Platform, 3, (e, history, level) => [
		width/4,
		level.yCurrent
		]).spaced(spacing);

	const integers = level.defineRegion("integers");

	integers.wait(spacing)
		.spawn(DiscreteMovingPlatform, 5, (e, history, level) => [
		width*3/4, level.yCurrent]).spaced(spacing);
	integers.wait(spacing*2/3).spawn(Homework, 1, (e,h,l) => [width*3/5, l.yCurrent]).immediately();
	integers.wait(spacing/3).spawn(Platform, 1, (e,h,l) => [width/3, l.yCurrent]).immediately();
	integers.wait(spacing/2);

	const datatypes = level.defineRegion("datatypes");
	datatypes.spawn(BasicMovingPlatform, 10, (e,h,l) => [
		width/5 + width/3 * Math.random(),
		l.yCurrent
		]).spaced(spacing * 2);
	datatypes.interleave(new Region()
		.wait(spacing)
		.spawn(Platform, 5, (e,h,l) => 
			[width/3, l.yCurrent]).spaced(spacing * 2)
		.wait(spacing*2)
		.spawn(Platform, 5, (e,h,l) =>
			[width*2/3, l.yCurrent]).spaced(spacing * 2));

	datatypes.interleave(new Region()
		.wait(spacing)
		.spawn(FakePlatform, 5, (e,h,l) => 
			[width*2/3, l.yCurrent]).spaced(spacing * 2)
		.wait(spacing*2)
		.spawn(FakePlatform, 5, (e,h,l) =>
			[width/3, l.yCurrent]).spaced(spacing * 2));

	datatypes.interleave(new Region()
		.wait(datatypes.length*5/6 + spacing*3)
		.spawn(Homework, 1, (e,h,l) => 
			[width/3, l.yCurrent]).immediately());


	const boost = level.defineRegion("Boost")
	boost.spawn(Platform, 11, (e,h,l) => [
		width/2*(1 + 1/2 * Math.sign(Math.random()-1/2)),
		l.yCurrent
		]).spaced(spacing)
		.wait(spacing)
		.spawn(Platform, 1, (e,h,l) => [
			width/4,
			l.yCurrent
			]).immediately();
	boost.interleave(new Region()
		.wait(spacing/2)
		.spawn(FakePlatform, 11, (e,h,l) => [
			width/2*(1 + 1/2 * Math.sign(Math.random()-1/2)),
			l.yCurrent
			]).spaced(spacing)
		.wait(spacing)
		.spawn(FakePlatform, 1, (e,h,l) => [
			width/4,
			l.yCurrent
			]).immediately()
		);
	boost.wait(spacing)
		.spawn(Platform, 1, (e,h,l) => 
			[width/4,
			l.yCurrent]).immediately()
		.spawn(Homework, 1, (e,h,l) => 
			[width*3/4,
			l.yCurrent + 40
			]).immediately()
		.spawn(RocketToken, 1, (e,h,l) => 
			[width*3/4,
			l.yCurrent - 5
			]).immediately();

	boost.spawn(FakePlatform, 1, (e,h,l) => 
		[width*3/4,
		l.yCurrent+10]).immediately()
		.wait(spacing)
		.spawn(FakePlatform, 5, (e,h,l) =>
			[width*Math.random(),
			l.yCurrent
			]).spaced(spacing)
		.wait(spacing * 24);

	boost.spawn(Platform, 6, (e,h,l) => 
		[width * Math.random(),
		l.yCurrent
		]).spaced(spacing/4)


	const ks = level.defineRegion("P-uppgift");
	ks.spawn(BasicMovingPlatform, 16, (e,h,l) =>
		[width * Math.random(), l.yCurrent]).spaced(spacing)
		.spawn(Platform, 5, (e,h,l) => [
			width * Math.random(),
			l.yCurrent
			]).spaced(spacing);

	ks.interleave(new Region()
		.wait(spacing*2/3)
		.spawn(Platform, 5, (e,h,l) => [
			width * 2/3,
			l.yCurrent
			]).immediately()
		.spawn(JumpBoostToken, 1, (e,h,l) => [
			h[h.length-1].xSpawn,
			h[h.length-1].ySpawn + 25
			]).immediately()
		.wait(spacing * 2)
		.spawn(Platform, 3, (e,h,l) => [
			width * 2/3 + width/4 * (Math.random()-1/2),
			l.yCurrent
			]).spaced(spacing * 2)
		.spawn(KS, 1, (e,h,l) => [
			h[h.length-1].xSpawn,
			h[h.length-1].ySpawn + 25
			]).immediately()
		.spawn(Platform, 4, (e,h,l) => [
			width * 2/3 + width/4 * (Math.random()-1/2),
			l.yCurrent
			]).spaced(spacing * 2)
		);


	// ...

	level.initialRegion(variables);
	variables.follower(integers);

	integers.follower(datatypes, 1, level => level.homeworkCurrent < 1);
	integers.follower(variables, 1, level => level.homeworkCurrent >= 1);

	datatypes.follower(variables, 1, level => level.homeworkCurrent < 1);
	datatypes.follower(boost, 1, level => level.homeworkCurrent >= 1);

	boost.follower(integers, 1, level => level.homeworkCurrent < 2);
	boost.follower(datatypes, 1, level => level.homeworkCurrent < 3);
	boost.follower(ks, 1, level => level.homeworkCurrent >= 3);

	ks.follower(variables);

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

	let width = controller.gameArea.gridWidth;
	let spacing = 250;
	const start = level.defineRegion("DFS");

	start.wait(spacing).spawn(GraphPlatform, 5, (e,h,l) => [
		Math.random()*width,
		level.yCurrent,
		(h.length > 0 ? h[h.length-1].object : null)
	]).spaced(spacing);
	start.wait(spacing).spawn(GraphPlatform, 1, (e,h,l)=> [
		Math.random()*width,
		level.yCurrent,
		h[h.length-1].object,
		[ImmortalToken, TFPassive, Homework]
		]).immediately();

	start.wait(spacing)
		.spawn(MovingGraphPlatform, 3, (e,h,l) => [
			Math.random()*width,
			level.yCurrent,
			h[h.length-1].object
			]).spaced(spacing)
		.wait(spacing)
		.spawn(MovingGraphPlatform, 1, (e,h,l) => [
			Math.random()*width,
			level.yCurrent,
			h[h.length-1].object,
			[ImmortalToken, Homework]
			]).immediately()
		.wait(spacing)
		.spawn(GraphPlatform, 6, (e,h,l) => [
			Math.random()*width,
			level.yCurrent,
			h[h.length-1].object
			]).spaced(spacing)
		.wait(spacing)
		.spawn(MovingGraphPlatform, 1, (e,h,l) => [
			Math.random()*width,
			level.yCurrent,
			h[h.length-1].object,
			[TFPassive, KS]
			]).immediately();

	const middle = level.defineRegion("middle");
	middle.wait(spacing)
		.spawn(Platform, 3, (e,h,l) => [
			(0.1 + Math.random()*0.8)*width,
			level.yCurrent
			]).spaced(spacing)
		.wait(spacing)
		.spawn(DiscreteMovingPlatform, 3, (e,h,l) => [
			(0.1 + Math.random()*0.5)*width,
			level.yCurrent
			]).spaced(spacing)
		.spawn(Homework, 1, (e,h,l) => [
			0, 25, h[h.length-1].object
			]).immediately();
	middle.interleave(new Region()
		.wait(spacing/2)
		.spawn(FakePlatform, 5, (e,h,l) => [
			Math.random()*width,
			level.yCurrent])
		.spaced(spacing));

	const bfs = level.defineRegion("BFS");

	const platforms = [GraphPlatform, MovingGraphPlatform];
	const tokenorder = [
		[ImmortalToken], 
		[Homework], 
		[SFPassive],
		[Homework],
		[TFPassive, ImmortalToken],
		[OFPassive, KS],
		];

	for (var k = 0; k < 2; k ++){
		for (var j = 0; j < platforms.length; j++) {
			for (var i = 0; i < tokenorder.length; i++) {
				let nplatforms = 2 + Math.floor(Math.random()*4);
				bfs.wait(spacing)
				.spawn(platforms[j], nplatforms, (e,h,l) => [
					width * (0.1 + Math.random()*0.8),
					level.yCurrent,
					(h.length > 0 ? h[h.length-1].object : null)
					])
				.spaced(spacing)
				.wait(spacing)
				.spawn(platforms[j], 1, (e,h,l) => [
					width * (0.1 + Math.random()*0.8),
					level.yCurrent,
					h[h.length-1].object,
					tokenorder[i]
					])
				.spaced(spacing);
			}
		}
	}

	level.initialRegion(start);
	start.follower(middle);
	middle.follower(start, 1, level => level.homeworkCurrent == 0);
	middle.follower(bfs, 1, level => level.homeworkCurrent > 0);
	bfs.follower(middle);

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

	let width = controller.gameArea.gridWidth;
	let spacing = 250;
	const start = level.defineRegion("Lead in");

	start.wait(spacing)
		.spawn(Platform, 3, (e,h,l) => [
			width/3-30,
			level.yCurrent])
		.spaced(spacing)
		.wait(spacing)
		.spawn(Platform, 5, (e,h,l) => [
			50 + width*0.1 + (h.length-6)*width*0.8/5,
			level.yCurrent
		]).immediately()
		.wait(spacing)
		.spawn(Platform, 4, (e,h,l) => [
			width/2-30,
			level.yCurrent])
		.spaced(spacing);

	start.interleave(new Region()
		.wait(spacing*5)
		.spawn(Platform, 4, (e,h,l) => [
			width/2+30,
			level.yCurrent])
		.spaced(spacing));

	start.interleave(new Region()
		.wait(spacing)
		.spawn(Platform, 3, (e,h,l) => [
			width *2/3+30,
			level.yCurrent])
		.spaced(spacing)
		.wait(controller.gameArea.gridWidth + spacing * 3)
		.spawn(MirrorPlayer, 1, () => {
			return [controller.gameArea.gridWidth - controller.player.x,
			controller.player.y]
		}).immediately());

	// Än så länge trasigt
	const region = level.defineRegion("region");

	let left = new Region();
	left.spawn(Platform, 5, (e,h,l) => [
		width/3 - width/5/(h.length + 1),
		level.yCurrent
		]).spaced(spacing);

	let right = new Region();
	right.spawn(Platform, 5, (e,h,l) => [
		width*2/3 + width/5/(h.length + 1),
		level.yCurrent
		]).spaced(spacing);

	region.append(left);
	region.interleave(right);

	level.initialRegion(start);
	start.follower(region);
	region.follower(region);

	return level;
});