class BackgroundGenerator {
	static toColor(col) {
		if (col.length === 4)
			return `rgba(${col.join(",")})`;
		else
			return `rgb(${col.join(",")})`;
	}

	static renderGraphImg(width, height, n, interpolationFunction, gradients, sizes, transparent = false) {
        if (gradients.length !== sizes.length)
            throw new Error(`Mismatch of length between gradients (${gradients.length}) and sizes (${sizes.length})`);

		let canvas;
		if (width instanceof HTMLCanvasElement)
			canvas = width;
		else {
        	canvas = document.createElement("canvas");
			canvas.width = width;
			canvas.height = height;
		}
        const ctx = canvas.getContext("2d", {alpha: !transparent});
        let fillStyle = ctx.fillStyle;
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let spec_ind = 0; spec_ind < sizes.length; spec_ind++) {
            for (let i = 0; i < n; i++) {
                ctx.beginPath();
                ctx.arc(
					...interpolationFunction(i / (n - 1)),
					sizes[spec_ind] / 2,
					0,
					2 * Math.PI);
				ctx.fillStyle = this.toColor(
					Splines.interpolateLinear(
						i / (n - 1),
						gradients[spec_ind]));
                ctx.fill();
            }
        }

        ctx.fillStyle = fillStyle;
        return canvas;
    }

	static randMargin(length, margin) {
		return margin / 2 + Math.random() * (length - margin);
	}

	static createGraph(distance, width, nPoints, prevPath = null, uniformPoints = false) {
		const gradients = [
				[[0, 0, 0, 0.1]],
				[[0, 0, 0]],
				[[30, 30, 20]],
				[[30, 30, 20]]
			];
		const sizes = [
			18,
			13,
			8,
			3
		];
		const margin = 1.5 * Math.max(...sizes);

		const path = [];
		if (prevPath !== null) {
			if (prevPath instanceof Array) {
				if (prevPath.length >= 2) {
					const first = prevPath[prevPath.length - 2];
					first[1] -= prevPath[prevPath.length - 1][1];
					path.push(first);
				}
				if (prevPath.length >= 1)
					path.push([prevPath[prevPath.length - 1][0], 0]);
			} else {
				path.push([prevPath, 0]);
			}
		} else
			path.push([this.randMargin(width, margin), 0]);

		for (let i = 1; i < nPoints - 1; i++) {
			path.push([
				this.randMargin(width, margin),
				distance * (uniformPoints ? i / (nPoints - 1) : Math.random() * 0.95 + 0.05)]);
		}
		path.push([this.randMargin(width, margin), distance]);

		if (!uniformPoints)
			path.sort((p1, p2) => p1[1] - p2[1]);
			
		const img = this.renderGraphImg(
			width,
			distance,
			Math.round(distance / 2),
			t => Splines.interpolateHermite(t, path),
			gradients,
			sizes);

		return [img, path];
	}
}