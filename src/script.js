let counter = 0;
const newList = document.querySelector('.new-list');
const addList = document.querySelector('.add');
const inputList = document.querySelector('input');
let moveTarget = null;
let moveContainer = null;
let dropTarget = null;
let begin = null;
let moving = false;
const positions = [];

const placeholderList = document.createElement('div');
placeholderList.className = 'placeholder-list';

addList.addEventListener('click', (event) => {
	const listContainer = document.createElement('div');
	listContainer.className = 'list-container';

	const listDiv = document.createElement('div');
	listDiv.className = 'list';
	listContainer.appendChild(listDiv);

	const titleDiv = document.createElement('div');
	titleDiv.className = 'title';
	titleDiv.textContent = inputList.value || `Default ${counter}`;
	listDiv.appendChild(titleDiv);


	const newItem = newList.cloneNode(true);
	listDiv.appendChild(newItem);
	const addItem = newItem.querySelector('.add');
	const inputItem = newItem.querySelector('input');

	addItem.addEventListener('click', (event) => {
		const itemContainer = document.createElement('div');
		itemContainer.className = 'item-container';

		const itemDiv = document.createElement('div');
		itemDiv.textContent = inputItem.value || 'Default';
		itemDiv.className = 'item';
		itemContainer.appendChild(itemDiv);

		const removeButton = document.createElement('button');
		removeButton.textContent = 'X';
		itemDiv.appendChild(removeButton);

		removeButton.addEventListener('click', (event) => {
			itemDiv.parentNode.removeChild(itemDiv);
		});

		newItem.insertAdjacentElement('beforebegin', itemContainer);
	});

	listDiv.addEventListener('mousedown', (event) => {
		moveTarget = listDiv;
		dropTarget = listDiv.parentNode;
		begin = {
			mX: event.clientX,
			mY: event.clientY,
			bX: moveTarget.parentNode.offsetLeft,
			bY: moveTarget.parentNode.offsetTop,
		};
	});

	runFunction(addItem, 'click', 15);

	newList.insertAdjacentElement('beforebegin', listContainer);
	positions.push({
		x: listContainer.offsetLeft,
		y: listContainer.offsetTop,
		ref: listContainer
	});
	counter++;
});

document.addEventListener('mousemove', (event) => {
	if (moveTarget == null)
		return;
	if (!moving) {
		moving = true;
		moveTarget.style.position = 'absolute';
		moveTarget.style.zIndex = 3;
		document.body.appendChild(moveTarget); // take off parent container
	}
	moveTarget.style.top = `${begin.bY - (begin.mY - event.clientY)}px`;
	moveTarget.style.left = `${begin.bX - (begin.mX - event.clientX)}px`;

	// assign new drop target?
	const mX = event.clientX;
	const mY = event.clientY;
	let target = null;
	for (let i = 0; i < positions.length; i++) {
		const t = positions[i];
		if (mX < t.x + 200 && mX > t.x) {
			target = t.ref;
			break;
		}
	}
	if (target === dropTarget || target == null)
		return;

	// moved over another container
	// move that list to the current drop target and update drop target
	const child = target.firstElementChild;
	target.removeChild(child);
	dropTarget.appendChild(child);
	dropTarget = target;
});

document.addEventListener('mouseup', (event) => {
	dropTarget.appendChild(moveTarget);
	moveTarget.style.left = '0px';
	moveTarget.style.top = '0px';
	moveTarget = null;
	dropTarget = null;
	begin = null;
	moving = false;
});

function runFunction(el, fn, num) {
	for (let i = 0; i < num; i++) {
		el[fn]();
	}
}

runFunction(addList, 'click', 5);