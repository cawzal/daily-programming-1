const newList = document.querySelector('.new-list');
const addList = document.querySelector('.add');
const inputList = document.querySelector('input');

addList.addEventListener('click', (event) => {
	const listDiv = document.createElement('div');
	listDiv.className = 'list';

	const titleDiv = document.createElement('div');
	titleDiv.className = 'title';
	titleDiv.textContent = inputList.value || 'Default';
	listDiv.appendChild(titleDiv);

	const newItem = newList.cloneNode(true);
	listDiv.appendChild(newItem);
	const addItem = newItem.querySelector('.add');
	const inputItem = newItem.querySelector('input');

	addItem.addEventListener('click', (event) => {
		const itemDiv = document.createElement('div');
		itemDiv.textContent = inputItem.value || 'Default';
		itemDiv.className = 'item';

		const removeButton = document.createElement('button');
		removeButton.textContent = 'X';
		itemDiv.appendChild(removeButton);

		removeButton.addEventListener('click', (event) => {
			itemDiv.parentNode.removeChild(itemDiv);
		});

		newItem.insertAdjacentElement('beforebegin', itemDiv);
	});
	runFunction(addItem, 'click', 5);

	newList.insertAdjacentElement('beforebegin', listDiv);
});

function runFunction(el, fn, num) {
	for (let i = 0; i < num; i++) {
		el[fn]();
	}
}

runFunction(addList, 'click', 5);