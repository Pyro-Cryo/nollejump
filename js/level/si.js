Level.levels.set("SI1121", (infoOnly) => {
	const level = new Level(
		{
			"code": "SI1121",
			"name": "Termodynamik",
			"hp": 6
		},
		2, // Homework-tokens
		1, // KS-tokens
		1  // Tenta-tokens
	);
	if (infoOnly)
		return level;

	// ...

	return level;
});