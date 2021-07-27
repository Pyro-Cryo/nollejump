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

	const stairSpacing = 300;
	const font = "32px Nunito";
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
					"",
					font,
					textCol
				]).immediately();
			initialStairs
				.call(hint => {
					// Eftersom den här hinten spawnas efter spelaren så registreras eventlistenern efter,
					// vilket gör att spelarens .deviceTiltAvailable uppdateras innan
					window.addEventListener("deviceorientation", e => {
						hint.text = controller.player.deviceTiltAvailable ? "Luta mobilen för att styra" : "Piltangenter eller A/D för att styra";
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
				0, -48, "Tur då att Janne-Jan har med sig", font, textCol, spawnHistory[spawnHistory.length - 1].object
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
	end.wait(stairSpacing);
	for (let x = platWidth * 0.6; x < controller.gameArea.gridWidth - 0.6 * platWidth; x += platWidth)
		if (x > controller.gameArea.gridWidth / 3 && x < controller.gameArea.gridWidth * 2 / 3)
			end.spawn(Platform, 1, (e, sH, level) => [x, level.yCurrent]);
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

	level.initialRegion(initialStairs);
	initialStairs.follower(end);
	end.follower(end);

	return level;
};

Level.choice = () => {
	const level = new Level(
		{
			"code": "antagning.se",
			"name": "Val av utbildning",
			"hp": 0
		},
		0, // Homework-tokens
		0, // KS-tokens
		0  // Tenta-tokens
	);

	const platWidth = Platform.image.width * Platform.scale / controller.gameArea.unitWidth;
	const initialWait = 10;
	const n = 50;
	const ctfys = level.defineRegion()
		.call(() => {
			controller.screenWrap = false;
			console.log("no screen wrap");
		})
		.spawn(CTFYSRight, 1, [
			controller.gameArea.gridWidth / 2,
			controller.gameArea.gridHeight * 2 / 3
		]).immediately()
		.wait(initialWait)
		.spawn(Platform, n, (elapsed, spawnHistory, level) => [
			controller.gameArea.gridWidth + platWidth * Math.floor((spawnHistory.length - 1) / 2),
			initialWait
		]).immediately();

	const ctmat = new Region()
		.spawn(CTMATLeft, 1, [
			controller.gameArea.gridWidth / 2,
			controller.gameArea.gridHeight * 1 / 3
		]).immediately()
		.wait(initialWait)
		.spawn(Platform, n, (elapsed, spawnHistory, level) => [
			-platWidth * Math.floor((spawnHistory.length - 1) / 2),
			initialWait
		]).immediately(platWidth);

	ctfys.interleave(ctmat).wait(controller.gameArea.gridHeight * 2);
	level.initialRegion(ctfys);

	return level;
};