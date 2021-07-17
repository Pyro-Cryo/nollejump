Level.levels.set("SK1104", () => {
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

	// ...

	return level;
});
Level.levels.set("SK1105", () => {
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

	// ...

	return level;
});