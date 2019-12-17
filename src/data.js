function getCounter(initial) {
	let count = initial;
	return function() {
		return count++;
	}
}

const getItemId = getCounter(1);
const getListId = getCounter(1);

function makeSize(listIndex, ItemIndex, repititions) {
	return data.lists[listIndex].items[ItemIndex] = `${data.lists[listIndex].items[ItemIndex]} `.repeat(repititions);
}

function makeMedium(listIndex, ItemIndex) {
	return makeSize(listIndex, ItemIndex, 10);
}

function makeLarge(listIndex, ItemIndex) {
	return makeSize(listIndex, ItemIndex, 25);
}

function insertListAt(listIndex, positionIndex) {
	const list = data.lists.splice(listIndex, 1);
	data.lists.splice(positionIndex, 0, list[0]);
	displayListNames();
}

function displayListNames() {
	const names = data.lists.map((list) => list.name);
	console.log(JSON.stringify(names));
}

const data = {
	name: 'Name',
	lists: []
};

for (let i = 0; i < 10; i++) {
	const list = {
		name: `List ${getListId()}`,
		items: []
	};
	const limit = (i % 2 === 0) ? 10 : 25;
	for (let j = 0; j < limit; j++) {
		list.items.push(`Item ${getItemId()}`);
	}
	data.lists.push(list);
}

makeMedium(0, 0);
makeMedium(1, 3);
makeLarge(1, 4);