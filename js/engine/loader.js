/**
 * Ger ett Promise som resolvas när alla de listade sakerna hämtats (eller någon failar).
 * @param {any[][]} resources En array med saker att hämta. Dessa är i sig arrayer: [path, type, map, onErr]. De första tre motsvarar argumenten till loadResource(). onErr körs om inte objektet kan hämtas.
 * @param {*} defaultType Om en array i resources inte specificerar en typ används denna.
 * @param {Function} onUpdate Körs varje gång ett objekt har hämtats (och onload körts). Kan t.ex. användas för loading bars.
 */
function loadResources(resources, defaultType = Image, onUpdate = null) {
	let progress = 0;
	let items = [];

	const singleResource = typeof (resources) === "string";
	if (singleResource)
		resources = [resources];

	for (let resource of resources) {
		if (typeof (resource) === "string")
			resource = [resource];

		let path = resource[0];
		let type = resource.length >= 2 ? resource[1] : defaultType;
		let map = resource.length >= 3 ? resource[2] : null;
		let onErr = resource.length >= 4 ? resource[3] : null;

		let promise = loadResource(path, type, map, onErr);
		
		if (onErr)
			promise = promise.catch(onErr);

		promise.finally(() => {
			progress++;
			if (onUpdate)
				onUpdate(progress, items.length);
		});

		items.push(promise);
	}
	if (singleResource)
		return items[0];
	else
		return Promise.all(items);
}

/**
 * Ger ett promise som resolvas när saken hämtats.
 * @param {string} path URI till objektet.
 * @param {*} type Vad för slags objekt det är som hämtas (ex. Image, Audio).
 * @param {Function} map Anropas med objektet när det hämtats. Om ett returvärde ges skickas det vidare till det promise som returneras av loadResource().
 */
function loadResource(path, type = Image, map = null) {
	let promise;
	if (type === JSON)
		promise = new Promise((resolve, reject) => {
			fetch(path).then(response => {
				if (response.ok)
					resolve(response.json());
				else
					reject(response);
			}).catch(reason => reject(reason));
		});
	else
		promise = new Promise((resolve, reject) => {
			const item = new type();
			if (item instanceof Audio) {
				item.addEventListener('canplaythrough', () => resolve(item));
				item.preload = true;
			}
			else
				item.addEventListener('load', () => resolve(item));
			item.addEventListener('error', reject);
			item.src = path;
		}).catch(reason => reject(reason));

	if (map)
		promise = promise.then(item => {
			const mappedItem = map(item);
			if (mappedItem === undefined)
				return item;
			else
				return mappedItem;
		});

	return promise;
}