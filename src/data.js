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
	const list = data.lists.splice(listIndex, 1)[0];
	data.lists.splice(positionIndex, 0, list);
	displayListNames();
}

function displayListNames() {
	const names = data.lists.map((list) => list.name);
	console.log(JSON.stringify(names));
}

function insertItemAt(listIndex, itemIndex, positionIndex) {
	const item = data.lists[listIndex].items.splice(itemIndex, 1)[0];
	data.lists[listIndex].items.splice(positionIndex, 0, item);
	displayItems(listIndex);
}

function insertItemAt2(listIndex1, listIndex2, itemIndex, positionIndex) {
	const item = data.lists[listIndex1].items.splice(itemIndex, 1)[0];
	data.lists[listIndex2].items.splice(positionIndex, 0, item);
	displayItems(listIndex1);
	displayItems(listIndex2);
}

function displayItems(listIndex) {
	const items = data.lists[listIndex].items.map((item) => item);
	console.log(JSON.stringify(items));
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
	const limit = (i % 2 === 0) ? 10 : 10;
	for (let j = 0; j < limit; j++) {
		list.items.push(`Item ${getItemId()}`);
	}
	data.lists.push(list);
}

makeMedium(0, 0);
makeMedium(1, 3);
makeLarge(1, 4);