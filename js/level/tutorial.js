Level.tutorial = (infoOnly) => {
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
	if (infoOnly)
		return level;

	const stairSpacing = 300;
	const font = "32px Nunito, sans-serif";
	const textCol = "#222222";
	const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;

	const initialStairs = level.defineRegion("initialStairs")
		.call(() => {
			//controller.player.x = controller.gameArea.gridWidth * 2 / 3;
		})
		.wait(stairSpacing);
	
	let step;
	for (step = 1; step <= 5; step++) {
		for (let x = platWidth * 0.6; x < controller.gameArea.gridWidth / 3; x += platWidth)
			initialStairs.spawn(Platform, 1, [x, stairSpacing * step]);
		initialStairs.immediately();
		if (step === 2) {
			initialStairs.spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				controller.gameArea.gridWidth / 3, 5, "\u2190 Hoppa på dessa", font, textCol, spawnHistory[spawnHistory.length - 1].object
			])
				.spawn(Hint, 1, (elapsed, spawnHistory, level) => [
					controller.gameArea.gridWidth / 2, level.yCurrent - stairSpacing / 2,
					"Piltangenter eller A/D för att styra",
					font,
					textCol
				]).immediately();
			initialStairs
				.call(hint => {
					// Eftersom den här hinten spawnas efter spelaren så registreras eventlistenern efter,
					// vilket gör att spelarens .deviceTiltAvailable uppdateras innan
					window.addEventListener("deviceorientation", e => {
						if (controller.player.deviceTiltAvailable)
							hint.text = "Luta mobilen för att styra";
					}, { once: true });
				}, 0, (elapsed, spawnHistory, level) => [spawnHistory[spawnHistory.length - 1].object]);
		}
		if (step === 5) {
			for (let x = platWidth * 0.6; x < controller.gameArea.gridWidth; x += platWidth) {
				if (x >= controller.gameArea.gridWidth / 3) // Så vi skippar de som redan spawnats i övre forloopen
					initialStairs.spawn(Platform, 1, [x, stairSpacing * step]);
			}
			initialStairs.immediately();
		}
		initialStairs.wait(stairSpacing);
	}

	for (; step <= 8; step++) {
		for (let x = controller.gameArea.gridWidth - platWidth * 0.6; x > controller.gameArea.gridWidth * 2 / 3; x -= platWidth)
			initialStairs.spawn(Platform, 1, [x, stairSpacing * step]);
		initialStairs.immediately();
		if (step === 6)
			initialStairs.spawn(Hint, 1, [
				controller.gameArea.gridWidth / 2, stairSpacing * (step - 0.2), "Planen är ekvivalent med en cylinder", font, textCol
			]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				0, -48, "Åker du ut till vänster", font, textCol, spawnHistory[spawnHistory.length - 1].object
			]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				0, -48, "så kommer du in till höger", font, textCol, spawnHistory[spawnHistory.length - 1].object
			]).immediately();
		initialStairs.wait(stairSpacing);
	}

	for (; step <= 13; step++) {
		for (let x = platWidth * 0.6; x < controller.gameArea.gridWidth / 3; x += platWidth) {
			if (step === 13)
				initialStairs.spawn(BasicMovingPlatform, 1, [x + controller.gameArea.gridWidth / 3, stairSpacing * step]);
			else
				initialStairs.spawn(Platform, 1, [x, stairSpacing * step]);
		}
		initialStairs.immediately();
		if (step === 9)
			initialStairs.spawn(Hint, 1, [
				controller.gameArea.gridWidth / 2, stairSpacing * (step - 0.2), "Varje nivå motsvarar en kurs", font, textCol
			]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				0, -48, "Hoppar du av kursen måste du börja om", font, textCol, spawnHistory[spawnHistory.length - 1].object
			]).immediately();
		
		if (step === 12)
			initialStairs.spawn(Hint, 1, [
				controller.gameArea.gridWidth / 2, stairSpacing * (step - 0.2), "Det finns olika sorters plattformar", font, textCol
			]).immediately();
		
		if (step === 13)
			initialStairs.spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				-controller.gameArea.gridWidth / 8, 48, "Till exempel de som rör sig", font, textCol, spawnHistory[spawnHistory.length - 1].object
			]).immediately();
		initialStairs.wait(stairSpacing);
	}
	
	for (; step <= 16; step++) {
		for (let x = controller.gameArea.gridWidth - platWidth * 0.6; x > controller.gameArea.gridWidth * 2 / 3; x -= platWidth)
			initialStairs.spawn(Platform, 1, [x, stairSpacing * step]);
		initialStairs.immediately();

		if (step === 16)
			initialStairs.spawn(Hint, 1, [
				controller.gameArea.gridWidth / 2, stairSpacing * (step - 0.2), "Ibland dyker Föhseriet upp", font, textCol
			]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				0, -48, "och ställer sig i vägen", font, textCol, spawnHistory[spawnHistory.length - 1].object
			]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				0, -48, "Tur då att Jennie-Jan har med sig", font, textCol, spawnHistory[spawnHistory.length - 1].object
			]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				0, -48, "en massa frukt att kasta", font, textCol, spawnHistory[spawnHistory.length - 1].object
			]).immediately();
		initialStairs.wait(stairSpacing);
	}

	for (let x = platWidth * 0.6; x < controller.gameArea.gridWidth / 3; x += platWidth)
		initialStairs.spawn(Platform, 1, [x, stairSpacing * step]);
	initialStairs.immediately();
	step++;
	initialStairs.wait(stairSpacing);

	initialStairs.spawn(Hint, 1, (elapsed, spawnHistory, level) => [
		// Detta spawnas inte in förrän efter ett tag, så vi vet nu att spelarens .deviceTiltAvailable är aktuell
		controller.gameArea.gridWidth / 2, level.yCurrent - 0.2 * stairSpacing,
		controller.player.deviceTiltAvailable ? "Tryck på skärmen för att" : "Tryck på mellanslag för att",
		font, textCol
	]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
		0, -48, "kasta frukt", font, textCol, spawnHistory[spawnHistory.length - 1].object
	]);
	for (let x = controller.gameArea.gridWidth - platWidth * 0.6; x > controller.gameArea.gridWidth * 2 / 3; x -= platWidth)
		initialStairs.spawn(Platform, 1, [x, stairSpacing * step]);
	initialStairs.spawn(TFPassive, 1, [controller.gameArea.gridWidth * 9 / 13, stairSpacing * (step + 0.2)]);
	initialStairs.spawn(OFPassive, 1, [controller.gameArea.gridWidth * 10.5 / 13, stairSpacing * (step + 0.2)]);
	initialStairs.spawn(SFPassive, 1, [controller.gameArea.gridWidth * 12 / 13, stairSpacing * (step + 0.2)]);
	initialStairs.immediately();
	step++;
	initialStairs.wait(stairSpacing);

	for (; step <= 22; step++) {
		for (let x = platWidth * 0.6; x < controller.gameArea.gridWidth / 3; x += platWidth)
			initialStairs.spawn(Platform, 1, [x, stairSpacing * step]);
		initialStairs.immediately();
		if (step === 20)
			initialStairs.spawn(Hint, 1, [
				controller.gameArea.gridWidth / 2, stairSpacing * (step - 0.2), "Uppe till vänster kan du pausa", font, textCol
			]).immediately();

		if (step === 22)
			initialStairs.spawn(Hint, 1, [
				controller.gameArea.gridWidth / 2, stairSpacing * (step - 0.2), "Uppe till höger kan du se hur många", font, textCol
			]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				0, -48, "uppgifter du måste klara för att", font, textCol, spawnHistory[spawnHistory.length - 1].object
			]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
				0, -48, "bli godkänd", font, textCol, spawnHistory[spawnHistory.length - 1].object
			]).immediately();
		initialStairs.wait(stairSpacing);
	}

	for (; step <= 24; step++) {
		for (let x = controller.gameArea.gridWidth - platWidth * 0.6; x > controller.gameArea.gridWidth * 2 / 3; x -= platWidth)
			initialStairs.spawn(Platform, 1, [x, stairSpacing * step]);
		initialStairs.immediately();
		if (step != 24)
			initialStairs.wait(stairSpacing);
	}
	initialStairs.spawn(Hint, 1, [
		controller.gameArea.gridWidth / 2, stairSpacing * (step - 0.2), `För intromatten ${level.code} krävs`, font, textCol
	]).spawn(Hint, 1, (elapsed, spawnHistory, level) => [
		0, -48, "bara en KS", font, textCol, spawnHistory[spawnHistory.length - 1].object
	]).immediately();

	const end = level.defineRegion("end");
	for (let i = 0; i < 2; i++) {
		end.wait(stairSpacing);
		for (let x = platWidth * 0.6; x < controller.gameArea.gridWidth - 0.6 * platWidth; x += platWidth) {
			if (x > controller.gameArea.gridWidth / 3 && x < controller.gameArea.gridWidth * 2 / 3)
				end.spawn(Platform, 1, (e, sH, level) => [x, level.yCurrent]);
		}
		if (i === 0)
			end.spawn(KS, 1, (e, sH, level) => [
				controller.gameArea.gridWidth / 2, level.yCurrent + 20
			]);
		end.immediately();
		end.wait(stairSpacing);
		for (let x = platWidth * 0.6; x < controller.gameArea.gridWidth / 3; x += platWidth)
			end.spawn(Platform, 1, (e, sH, level) => [x, level.yCurrent]);
		end.immediately();
		end.wait(stairSpacing);
		for (let x = controller.gameArea.gridWidth - platWidth * 0.6; x > controller.gameArea.gridWidth * 2 / 3; x -= platWidth)
			end.spawn(Platform, 1, (e, sH, level) => [x, level.yCurrent]);
		end.immediately();
	}

	level.initialRegion(initialStairs);
	initialStairs.follower(end);
	end.follower(end);

	return level;
};
Level.levels.set("SF0003", Level.tutorial);

Level.levels.set("test", infoOnly => {
	const level = new Level(
		{
			"code": "test",
			"name": "Kvalitetstestning",
			"hp": 3.0
		},
		1, // Homework-tokens
		2, // KS-tokens
		3  // Tenta-tokens
	);
	if (infoOnly)
		return level;

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
		.over(regular.length * 9 / 10)
		.interleave(new Region()
			.wait(regular.length / 5)
			.spawn(OFFlipScreen, 1, (e, sH, l) => [controller.gameArea.gridWidth / 2, level.yCurrent])
			.immediately()
			.wait(regular.length * 4 / 5));
	
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
			for (let i = spawnHistory.length - 1; i >= 0; i--) {
				if (spawnHistory[i].object instanceof Platform && !(spawnHistory[i].object instanceof BasicMovingPlatform))
					return [spawnHistory[i].xSpawn, spawnHistory[i].ySpawn + 10];
			}
			return [Math.random() * controller.gameArea.gridWidth, level.yCurrent];
		}).immediately()
		.wait(start.length)
		.spawn(RocketToken, 1, (elapsed, spawnHistory, level) => {
			for (let i = spawnHistory.length - 1; i >= 0; i--) {
				if (spawnHistory[i].object instanceof Platform && !(spawnHistory[i].object instanceof BasicMovingPlatform))
					return [spawnHistory[i].xSpawn, spawnHistory[i].ySpawn + 10];
			}
			return [Math.random() * controller.gameArea.gridWidth, level.yCurrent];
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
