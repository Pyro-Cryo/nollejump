Level.levels.set("SG1112", (infoOnly) => {
	const level = new Level(
		{
			"code": "SG1112",
			"name": "Mekanik I",
			"hp": 9
		},
		2, // Homework-tokens
		1, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;
		
	const spacing = 175;
	const displacementY = 50;
	const easy = level.defineRegion("easy");
	const intermediate = level.defineRegion("intermediate");
	const hard = level.defineRegion("hard");

	easy.wait(spacing)
		.spawn(Platform, 5, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing * 2)
		.interleave(new Region().wait(spacing)
			.spawn(AngledPlatform, 9, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY,
				Math.PI * (Math.random() * 25 + 10) * (Math.random() < 0.5 ? -1 : 1) / 180
			]).spaced(spacing))
		.interleave(new Region().wait(spacing * 7).spawn(Homework, 1, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).immediately());

	intermediate.wait(spacing)
		.spawn(AngledPlatform, 10, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			Math.PI * (Math.random() * 35 + 10) * (Math.random() < 0.5 ? -1 : 1) / 180
		]).spaced(spacing)
		.interleave(new Region().wait(spacing)
			.spawn(AngledPlatform, 7, (e, sH, level) => [
				Math.random() * controller.gameArea.gridWidth,
				level.yCurrent + (Math.random() * 2 - 1) * displacementY,
				Math.PI * (Math.random() * 25 + 10) * (Math.random() < 0.5 ? -1 : 1) / 180,
				0
			]).spaced(spacing * 1.5))
		.interleave(new Region().wait(spacing * 7).spawn(KS, 1, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).immediately());

	hard.wait(spacing)
		.spawn(AngledPlatform, 15, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			Math.PI * (Math.random() * 35 + 10) * (Math.random() < 0.5 ? -1 : 1) / 180,
			Math.floor(Math.random() * 2) * Math.PI / 2
		]).spaced(spacing * 0.8)
		.interleave(new Region().wait(spacing * 7).spawn(Tenta, 1, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent
		]).immediately());

	level.initialRegion(easy);
	easy.follower(intermediate, 1, level => level.homeworkCurrent != level.homeworkNeeded || level.ksCurrent !== level.ksNeeded);
	intermediate.follower(easy);
	easy.follower(hard, 1, level => level.homeworkCurrent == level.homeworkNeeded && level.ksCurrent === level.ksNeeded);
	hard.follower(easy);

	return level;
});
Level.levels.set("SG1115", (infoOnly) => {
	const level = new Level(
		{
			"code": "SG1115",
			"name": "Partikeldynamik med projekt",
			"hp": 7.5
		},
		2, // Homework-tokens
		0, // KS-tokens
		2  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	const spacing = 175;
	const displacementY = 50;
	const numTutorialPlatforms = 15;
	
	const basics = level.defineRegion("basics");
	const particles = level.defineRegion("particles");
	const statics = level.defineRegion("statics");
	const staticsDynamicsTransition = level.defineRegion("staticsDynamicsTransition");
	const dynamicsPt1 = level.defineRegion("dynamicsPt1");
	const dynamicsTransition = level.defineRegion("dynamicsTransition");
	const dynamicsPt2 = level.defineRegion("dynamicsPt2");

	particles.call(() => {
		PlatformDetectionParticle.instances = [];
	})
		.wait(controller.gameArea.gridHeight * 1.1 + displacementY)
		.spawn(PlatformDetectionParticle, 400, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).over(controller.gameArea.gridHeight);

	basics.wait(spacing);
	for (let i = 1; i <= numTutorialPlatforms; i++) {
		basics.spawn(CloakingParticlePlatform, 1, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			// Betydelserna är omvända: cloakLimit = när den börjar försvinna,
			// uncloakLimit = när den är helt försvunnen.
			/*cloakLimit = */ 0.8 + 0.4 * i / numTutorialPlatforms,
			/*uncloakLimit = */ 0.2 + 0.8 * i / numTutorialPlatforms
		]).immediately().wait(spacing);
	}
	basics.spawn(InvisiblePlatform, 10, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing * 0.8)
		.interleave(particles);
	
	statics.wait(spacing)
		.spawn(InvisiblePlatform, 3, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing)
		.spawn(Homework, 1, (e, spawnHistory, l) => [
			0,
			20,
			spawnHistory[spawnHistory.length - 1].object
		]).immediately()
		.wait(spacing)
		.spawn(InvisiblePlatform, 7, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing);

	staticsDynamicsTransition.wait(spacing);
	for (let i = 1; i <= numTutorialPlatforms; i++) {
		staticsDynamicsTransition.spawn(ScrollingCloakingParticlePlatform, 1, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			/*speed = */ Math.random() < 0.5 ? 100 : -100,
			/*cloakLimit = */ 0.8 + 0.4 * i / numTutorialPlatforms,
			/*uncloakLimit = */ 0.2 + 0.8 * i / numTutorialPlatforms
		]).immediately().wait(spacing);
	}
	staticsDynamicsTransition.spawn(InvisibleScrollingPlatform, 10, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			Math.random() < 0.5 ? 100 : -100
		]).spaced(spacing);
	
	dynamicsPt1.wait(spacing)
		.spawn(InvisibleScrollingPlatform, 3, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			Math.random() < 0.5 ? 100 : -100
		]).spaced(spacing)
		.spawn(Tenta, 1, (e, spawnHistory, l) => [
			0,
			20,
			spawnHistory[spawnHistory.length - 1].object
		]).immediately()
		.wait(spacing)
		.spawn(InvisibleScrollingPlatform, 7, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY,
			Math.random() < 0.5 ? 100 : -100
		]).spaced(spacing);

	dynamicsTransition.wait(spacing)
		.spawn(CloakingParticlePlatform, 10, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing)
		.call(PlatformDetectionParticle.startRemovingParticles);

	dynamicsPt2.wait(spacing * 1.1)
		.spawn(DynamicPlatformSpawner, 10, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing * 1.1)
		.wait(spacing * 1.1)
		.spawn(YeetedTenta, 1, (e, sH, l) => [
			Math.random() * controller.gameArea.gridWidth,
			controller.gameArea.bottomEdgeInGrid - 100,
			(Math.random() * 2 - 1) * 100,
			controller.player.physics.bounce_speed * (1.5 - 0.3 * Math.random())
		])
		.spawn(DynamicPlatformSpawner, 10, (e, sH, level) => [
			Math.random() * controller.gameArea.gridWidth,
			level.yCurrent + (Math.random() * 2 - 1) * displacementY
		]).spaced(spacing * 1.1);

	level.initialRegion(basics);
	basics.follower(statics);
	statics.follower(statics, 1, level => level.homeworkCurrent < level.homeworkNeeded);
	statics.follower(dynamicsPt1, 1, level => level.homeworkCurrent >= level.homeworkNeeded);
	dynamicsPt1.follower(dynamicsPt1, 1, level => level.tentaCurrent === 0);
	dynamicsPt1.follower(dynamicsTransition, 1, level => level.tentaCurrent >= 1);
	dynamicsTransition.follower(dynamicsPt2)
	dynamicsPt2.follower(dynamicsPt2);

	return level;
});