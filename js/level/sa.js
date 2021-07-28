Level.levels.set("SA1006", (infoOnly) => {
	const level = new Level(
		{
			"code": "SA1006",
			"name": "Ingenjörsfärdigheter i teknisk matematik",
			"hp": 4
		},
		2, // Homework-tokens
		0, // KS-tokens
		0  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	// ...

	return level;
});