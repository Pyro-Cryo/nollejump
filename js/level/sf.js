Level.levels.set("SF1673", (infoOnly) => {
	const level = new Level(
		{
			"code": "SF1673",
			"name": "Analys i en variabel",
			"hp": 7.5
		},
		// Oklart med homeworks/ksar
		0, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	const font = "32px Nunito, sans-serif";
	const textCol = "#222222";
	const spacing = 200;
	const fohsBounce = level.defineRegion("fohsBounce");
	const platBounce = level.defineRegion("platBounce");
	const flight = level.defineRegion("flight");
	const normal = level.defineRegion("normal");
	const tenta = level.defineRegion("tenta");
	level.initialRegion(normal);

	normal.wait(spacing).spawn(Platform, 12, (e, sH, level) => [
		controller.gameArea.gridWidth * (Math.floor(Math.random() * 3) + 1) / 4,
		level.yCurrent
	]).spaced(spacing);

	fohsBounce.wait(spacing)
		.spawn(TFHardhat, 1, (e, sH, level) => [
			controller.gameArea.gridWidth * (Math.floor(Math.random() * 3) + 1) / 4,
			level.yCurrent
		]).immediately()
		.wait(spacing * 3)
		.spawn(SFHardhat, 1, (e, spawnHistory, level) => {
			let i = (Math.floor(Math.random() * 3) + 1);
			while (i === Math.round(4 * spawnHistory[spawnHistory.length - 1].xSpawn / controller.gameArea.gridWidth))
				i = (Math.floor(Math.random() * 3) + 1);

			return [
				controller.gameArea.gridWidth * i / 4,
				level.yCurrent
			];
		}).immediately()
		.spawn(JumpBoostToken, 1, (e, spawnHistory, level) => [
			spawnHistory[spawnHistory.length - 1].xSpawn,
			level.yCurrent + 60
		]).immediately()
		.wait(spacing * 3)
		.spawn(OFHardhat, 1, (e, spawnHistory, level) => {
			const iLatest = Math.round(4 * spawnHistory[spawnHistory.length - 1].xSpawn / controller.gameArea.gridWidth);
			const iSecondLatest = Math.round(4 * spawnHistory[spawnHistory.length - 3].xSpawn / controller.gameArea.gridWidth);
			const i = 1 + 2 + 3 - iLatest - iSecondLatest;

			return [
				controller.gameArea.gridWidth * i / 4,
				level.yCurrent
			];
		}).immediately()
		.spawn(JumpBoostToken, 1, (e, spawnHistory, level) => [
			spawnHistory[spawnHistory.length - 1].xSpawn,
			level.yCurrent + 60
		]).immediately()
		.wait(spacing * 2);

	platBounce.wait(spacing)
		.spawn(Platform, 1, (e, sH, level) => [
			controller.gameArea.gridWidth * (Math.floor(Math.random() * 3) + 1) / 4,
			level.yCurrent
		]).immediately()
		.spawn(JumpBoostToken, 1, (e, spawnHistory, level) => [
			spawnHistory[spawnHistory.length - 1].xSpawn,
			level.yCurrent + 30
		]).immediately()
		.wait(spacing * 3)
		.spawn(Platform, 1, (e, spawnHistory, level) => {
			let i = (Math.floor(Math.random() * 3) + 1);
			while (i === Math.round(4 * spawnHistory[spawnHistory.length - 1].xSpawn / controller.gameArea.gridWidth))
				i = (Math.floor(Math.random() * 3) + 1);

			return [
				controller.gameArea.gridWidth * i / 4,
				level.yCurrent
			];
		}).immediately()
		.wait(spacing * 3)
		.spawn(Platform, 1, (e, spawnHistory, level) => {
			const iLatest = Math.round(4 * spawnHistory[spawnHistory.length - 1].xSpawn / controller.gameArea.gridWidth);
			const iSecondLatest = Math.round(4 * spawnHistory[spawnHistory.length - 2].xSpawn / controller.gameArea.gridWidth);
			const i = 1 + 2 + 3 - iLatest - iSecondLatest;

			return [
				controller.gameArea.gridWidth * i / 4,
				level.yCurrent
			];
		}).immediately()
		.wait(spacing * 2);

	flight.wait(spacing)
		.spawn(Platform, 1, (e, sH, level) => [
			controller.gameArea.gridWidth * (Math.floor(Math.random() * 3) + 1) / 4,
			level.yCurrent
		]).immediately()
		.spawn(JumpShootToken, 1, (e, spawnHistory, level) => [
			spawnHistory[spawnHistory.length - 1].xSpawn,
			level.yCurrent + 30
		]).immediately()
		.wait(60);

	const firstFlight = level.defineRegion("firstFlight").append(flight.clone())
		.spawn(Hint, 1, (e, sH, level) => [
			controller.gameArea.gridWidth / 2, level.yCurrent + 80, "Med vingar hoppar du", font, textCol
		]).spawn(Hint, 1, (e, sH, level) => [
			controller.gameArea.gridWidth / 2, level.yCurrent + 40, "istället för att skjuta", font, textCol
		]).immediately();
	const fohsInTheWay = new Region()
		.wait(spacing * 3)
		.spawn(TFPassive, 1, (e, sH, level) => [
			controller.gameArea.gridWidth * (Math.floor(Math.random() * 3) + 1) / 4,
			level.yCurrent
		]).immediately()
		.wait(spacing * 2)
		.spawn(SFPassive, 1, (e, spawnHistory, level) => {
			let i = (Math.floor(Math.random() * 3) + 1);
			while (i === Math.round(4 * spawnHistory[spawnHistory.length - 1].xSpawn / controller.gameArea.gridWidth))
				i = (Math.floor(Math.random() * 3) + 1);

			return [
				controller.gameArea.gridWidth * i / 4,
				level.yCurrent
			];
		}).immediately()
		.wait(spacing * 2)
		.spawn(OFPassive, 1, (e, spawnHistory, level) => {
			const iLatest = Math.round(4 * spawnHistory[spawnHistory.length - 1].xSpawn / controller.gameArea.gridWidth);
			const iSecondLatest = Math.round(4 * spawnHistory[spawnHistory.length - 2].xSpawn / controller.gameArea.gridWidth);
			const i = 1 + 2 + 3 - iLatest - iSecondLatest;

			return [
				controller.gameArea.gridWidth * i / 4,
				level.yCurrent
			];
		}).immediately();
	flight.append(fohsInTheWay.clone()).append(fohsInTheWay.clone());
	firstFlight.append(fohsInTheWay.clone()).append(fohsInTheWay.clone());

	tenta.spawn(Tenta, 1, (e, sH, level) => [
		controller.gameArea.gridWidth * (Math.floor(Math.random() * 4) + 0.5) / 4,
		level.yCurrent + spacing * 5
	]).immediately().wait(10);

	normal.follower(firstFlight, 1, level => level.regionHistory.findIndex(name => name === firstFlight.name) === -1);
	normal.follower(flight, 1, level => level.regionHistory.findIndex(name => name === firstFlight.name) !== -1);
	normal.follower(platBounce);
	flight.follower(normal);
	firstFlight.follower(normal);
	platBounce.follower(fohsBounce);
	fohsBounce.follower(normal);
	normal.follower(tenta, 4, level => level.regionHistory.findIndex(name => name === fohsBounce.name) !== -1 && level.regionHistory.findIndex(name => name === firstFlight.name) !== -1);
	tenta.follower(flight);

	return level;
});
Level.levels.set("SF1672", (infoOnly) => {
	const level = new Level(
		{
			"code": "SF1672",
			"name": "Linjär algebra",
			"hp": 7.5
		},
		3, // Homework-tokens
		1, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	const displacementY = 50;
	const spacing = 200;

	const fillerRegion = level.defineRegion("filler");
	const homeworkRegion = level.defineRegion("homework");
	const ksRegion = level.defineRegion("ks");
	const tentaRegion = level.defineRegion("tenta");
	level.initialRegion(fillerRegion);

	fillerRegion.follower(fillerRegion);
	fillerRegion.follower(homeworkRegion, 3, level => level.homeworkCurrent < level.homeworkNeeded);
	fillerRegion.follower(ksRegion, 3, level => level.ksCurrent < level.ksNeeded && level.homeworkCurrent >= 2);
	fillerRegion.follower(tentaRegion, 10, level => level.homeworkCurrent === level.homeworkNeeded && level.ksCurrent === level.ksNeeded);

	homeworkRegion.follower(fillerRegion);
	ksRegion.follower(fillerRegion);
	tentaRegion.follower(fillerRegion);

	fillerRegion.wait(spacing).spawn(Platform, 10, (e, sH, level) => [
		Math.random() * controller.gameArea.gridWidth,
		level.yCurrent + (Math.random() * 2 - 1) * displacementY
	]).spaced(spacing);

	homeworkRegion
		.wait(spacing)
		.spawn(BasicMovingPlatform, 5, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing * 2)
		.interleave(new Region()
			.wait(spacing * 2)
			.spawn(Platform, 5, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY
			]).spaced(spacing * 2)
		).interleave(new Region()
			.wait(spacing * 5)
			.spawn(Homework, 2, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY * 2
			]).spaced(spacing * 5)
	);

	ksRegion.wait(spacing)
		.spawn(ScrollingPlatform, 5, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			Math.random() < 0.5 ? 100 : -100
		]).spaced(spacing * 2)
		.interleave(new Region()
			.wait(spacing * 2)
			.spawn(BasicMovingPlatform, 5, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY
			]).spaced(spacing * 2)
		).interleave(new Region()
			.wait(spacing * 6)
			.spawn(KS, 1, (e, spawnHistory, l) => {
				let lastScrollingPlatform;
				for (let i = spawnHistory.length - 1; i >= 0; i--) {
					if (spawnHistory[i].object instanceof ScrollingPlatform) {
						lastScrollingPlatform = spawnHistory[i];
						break;
					}
				}
				return [
					0,
					-25,
					lastScrollingPlatform.object
				];
			}).immediately()
	);

	tentaRegion
		.wait(spacing)
		.spawn(ScrollingPlatform, 10, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing)
		.interleave(new Region()
			.wait(spacing * 2)
			.spawn(BasicMovingPlatform, 5, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY,
				Math.random() * 200 + 100,
				Math.random() + 0.5
			]).spaced(spacing * 2)
		)
		.interleave(new Region()
			.wait(spacing)
			.spawn(OFFlipScreen, 1, (e, sH, level) => [
				controller.gameArea.gridWidth / 2,
				level.yCurrent
			]).immediately())
		.interleave(new Region()
			.wait(spacing * 7)
			.spawn(Tenta, 1, (e, sH, level) => [
				controller.gameArea.gridWidth / 2,
				level.yCurrent
			]).immediately());


	return level;
});
Level.levels.set("SF1674", (infoOnly) => {
	const level = new Level(
		{
			"code": "SF1674",
			"name": "Flervariabelanalys",
			"hp": 7.5
		},
		// Oklart med homeworks/ksar
		0, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;
	
	const spacing = 280;
	const initialSpacing = 200;
	const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;

	const startRegion = level.defineRegion("start");
	const loopRegion = level.defineRegion("loop");
	const endRegion = level.defineRegion("end");
	level.initialRegion(startRegion);

	startRegion.follower(loopRegion);
	loopRegion.follower(loopRegion);
	loopRegion.follower(endRegion, 1000, l => controller.enemies.filter(e => e instanceof SFFlappyBird).length === 0);
	endRegion.follower(endRegion);

	startRegion.spawn(Platform, 10, (e, sH, level) => [
		controller.gameArea.gridWidth / 2,
		level.yCurrent
	]).spaced(initialSpacing)
	.interleave(new Region()
		.wait(initialSpacing * 8)
		.spawn(SFFlappyBird, 1, (e, sH, level) => [
			controller.gameArea.gridWidth / 2,
			level.yCurrent
		]).immediately()
	);
	
	let i = 0;
	for (let x = 50 + platWidth / 2; x < controller.gameArea.gridWidth; x += 2 * platWidth) {
		loopRegion.interleave(new Region()
			.wait(i % 2 ? spacing : spacing * 2)
			.spawn(Platform, 1, (e, sH, level) => [x, level.yCurrent])
			.spawn(Platform, 1, (e, sH, level) => [x + platWidth, level.yCurrent])
			.immediately()
		);
		i++;
	}

	endRegion.spawn(Platform, 10, (e, sH, level) => [
		controller.gameArea.gridWidth / 2,
		level.yCurrent
	]).spaced(initialSpacing)
	.interleave(new Region()
		.wait(initialSpacing * 1.1)
		.spawn(Tenta, 1, (e, sH, level) => [
			controller.gameArea.gridWidth / 2,
			level.yCurrent
		]).immediately()
	);

	return level;
});
Level.levels.set("SF1922", (infoOnly) => {
	// Sannstat (CTFYS)
	const level = new Level(
		{
			"code": "SF1922",
			"name": "Sannolikhetsteori och statistik",
			"hp": 6
		},
		// Oklart med homeworks/ksar
		0, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	const spacing = 100;
	const loop = level.defineRegion("loop");
	const tenta = level.defineRegion("tenta");
	level.initialRegion(loop);

	loop.follower(loop, 2);
	loop.follower(tenta, 1, level => level.tentaCurrent < level.tentaNeeded);
	tenta.follower(loop);

	loop.wait(spacing * 2)
		.spawn(CloakingPlatform, 20, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).spaced(spacing);

	tenta.wait(spacing / 2)
		.spawn(Tenta, 1, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).immediately()
		.wait(spacing * 3 / 2)
		.spawn(ScrollingCloakingPlatform, 10, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).spaced(spacing);

	return level;
});
Level.levels.set("SF1918", (infoOnly) => {
	// Sannstat (CTMAT)
	// Kopiera bara fysiks
	const level = Level.levels.get("SF1922")(infoOnly);
	level.code = "SF1918";
	return level;
});
Level.levels.set("SF1550", (infoOnly) => {
	const level = new Level(
		{
			"code": "SF1550",
			"name": "Numeriska metoder, grundkurs",
			"hp": 6
		},
		// Oklart med homeworks/ksar
		2, // Homework-tokens
		0, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	const spacing = 250;
	const arrowSide = 48;
	const nArrowsWidth = Math.floor(controller.gameArea.gridWidth / arrowSide);
	const fieldOffset = (controller.gameArea.gridWidth - arrowSide * nArrowsWidth) / 2;
	const spawnField = (region, field, height) => {
		height = height || 1;
		for (let j = 0; j < nArrowsWidth * height; j++) {
			for (let i = 0; i < nArrowsWidth; i++) {
				// xField, yField in the range [-2, 2]
				const xField = 4 * (i / (nArrowsWidth - 1) - 0.5);
				const yField = 4 * (j / (Math.floor(nArrowsWidth * height) - 1) - 0.5);
				const [dx, dy] = field(xField, yField);
				region.spawn(VectorFieldArrow, 1, (e, sH, level) => [
					fieldOffset + (i + 0.5) * arrowSide,
					level.yCurrent,
					dx * Math.abs(GRAVITY),
					dy * Math.abs(GRAVITY),
					0.2
				]);
			}
			region.immediately().wait(arrowSide);
		}
	};
	
	const platformIsh = level.defineRegion("platform");
	platformIsh.wait(spacing);
	spawnField(platformIsh, (x, y) => [
		0,
		2 * (x > 0.25)
	], 0.2);

	const vortex = level.defineRegion("vortex");
	vortex.wait(spacing);
	spawnField(vortex, (x, y) => [-y/2, x]);
	vortex.interleave(new Region()
		.wait(spacing + (nArrowsWidth - 1) / 2 * arrowSide)
		.spawn(Homework, 1, (e, sH, level) => [controller.gameArea.gridWidth / 2, level.yCurrent])
		.immediately());

	const spirals = level.defineRegion("spirals");
	spirals.wait(spacing);
	spawnField(spirals, (x, y) => [
		2 * Math.sin(x + y),
		2 * Math.cos(x - y)
	], Math.PI / 2);
	spirals.interleave(new Region()
		.wait(spacing)
		.spawn(Tenta, 1, (e, sH, level) => [controller.gameArea.gridWidth / 2, level.yCurrent])
		.immediately());
	
	const moses = level.defineRegion("moses");
	moses.wait(spacing);
	spawnField(moses, (x, y) => [0, x / Math.max(0.5, Math.abs(y))]);

	const plume = level.defineRegion("plume");
	plume.wait(spacing);
	spawnField(plume, (x, y) => [Math.sin(x), 1.5 * Math.cos(x)]);
	
	const narrowPlume = level.defineRegion("narrowPlume");
	narrowPlume.wait(spacing);
	spawnField(narrowPlume, (x, y) => [Math.sin(y), 1.5 * Math.cos(2.5 * x)]);

	level.initialRegion(platformIsh);

	platformIsh.follower(vortex);
	vortex.follower(moses);
	moses.follower(plume);
	plume.follower(platformIsh, 1, level => level.homeworkCurrent < level.homeworkNeeded);
	plume.follower(narrowPlume, 1, level => level.homeworkCurrent === level.homeworkNeeded);
	narrowPlume.follower(spirals);
	spirals.follower(plume);

	return level;
});