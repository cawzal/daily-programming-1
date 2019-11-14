function createElement(element, name, parent=null) {
	const el = document.createElement(element);
	el.className = name;
	if (parent !== null)
		parent.appendChild(el);
	return el;
}

function generateId() {
	let counter = 0;
	return function () {
		let id = counter;
		counter++;
		return id;
	}
}
const getId = generateId();

const listsEl = document.querySelector('.lists');
const newList = document.querySelector('.new-list');
const addList = document.querySelector('.add');
const inputList = document.querySelector('input');

addList.addEventListener('click', (event) => {
	const listWrapperEl = createElement('div', 'list-wrapper');
	const listEl = createElement('div', 'list', listWrapperEl);
	const titleWrapperEl = createElement('div', 'title-wrapper', listEl);
	const titleEl = createElement('div', 'title', titleWrapperEl);
	titleEl.textContent = `Title ${getId()}`;
	const listMoveHandleEl = createElement('div', 'list-move-handle', titleWrapperEl);
	listMoveHandleEl.textContent = 'Move';
	const itemsEl = createElement('div', 'items', listEl);
	
	for (let i = 0; i < 15; i++) {
		const itemWrapperEl = createElement('div', 'item-wrapper', itemsEl);
		const itemEl = createElement('div', 'item', itemWrapperEl);
		const itemTextEl = createElement('div', 'item-text', itemEl);
		itemTextEl.textContent = getId();
		const itemMoveHandleEl = createElement('div', 'item-move-handle', itemEl);
		itemMoveHandleEl.textContent = 'Move';
	}

	listsEl.appendChild(listWrapperEl);
});


let moveTarget = null;
let moveContainer = null;
let dropTarget = null;
let begin = null;
let moving = false;
const positions = [];
let onItemDown = false;
let moveItem = null;
let dropItem = null;
let itemPositions = [];

// addList.addEventListener('click', (event) => {
// 	const listContainer = document.createElement('div');
// 	listContainer.className = 'list-container';

// 	const listDiv = document.createElement('div');
// 	listDiv.className = 'list';
// 	listContainer.appendChild(listDiv);

// 	const titleDiv = document.createElement('div');
// 	titleDiv.className = 'title';
// 	titleDiv.textContent = inputList.value || `Default ${getId()}`;
// 	listDiv.appendChild(titleDiv);

// 	const newItem = newList.cloneNode(true);
// 	listDiv.appendChild(newItem);
// 	const addItem = newItem.querySelector('.add');
// 	const inputItem = newItem.querySelector('input');

// 	addItem.addEventListener('click', (event) => {
// 		const itemContainer = document.createElement('div');
// 		itemContainer.className = 'item-container';

// 		const itemDiv = document.createElement('div');
// 		itemDiv.textContent = inputItem.value || `Default ${getId()}`;
// 		itemDiv.className = 'item';
// 		itemContainer.appendChild(itemDiv);

// 		itemDiv.addEventListener('mousedown', (event) => {
// 			console.log('Item mouse down!'); // @_@
// 			onItemDown = true;
// 			moveItem = itemDiv;
// 			dropItem = itemDiv.parentNode;
// 			begin = {
// 				mX: event.clientX,
// 				mY: event.clientY,
// 				bX: moveItem.parentNode.offsetLeft,
// 				bY: moveItem.parentNode.offsetTop,
// 			};
// 		});

// 		const removeButton = document.createElement('button');
// 		removeButton.textContent = 'X';
// 		itemDiv.appendChild(removeButton);

// 		removeButton.addEventListener('click', (event) => {
// 			itemDiv.parentNode.removeChild(itemDiv);
// 		});

// 		newItem.insertAdjacentElement('beforebegin', itemContainer);
// 	});

// 	listDiv.addEventListener('mousedown', (event) => {
// 		if (onItemDown)
// 			return;
// 		console.log('Listmouse down!'); // @_@
// 		moveTarget = listDiv;
// 		dropTarget = listDiv.parentNode;
// 		begin = {
// 			mX: event.clientX,
// 			mY: event.clientY,
// 			bX: moveTarget.parentNode.offsetLeft,
// 			bY: moveTarget.parentNode.offsetTop,
// 		};
// 	});

// 	runFunction(addItem, 'click', 15);

// 	newList.insertAdjacentElement('beforebegin', listContainer);
// 	positions.push({
// 		x: listContainer.offsetLeft,
// 		y: listContainer.offsetTop,
// 		ref: listContainer
// 	});
// });

document.addEventListener('mousemove', (event) => {
	event.preventDefault();
	if (moveTarget != null) {
		if (!moving) {
			moving = true;
			moveTarget.style.position = 'absolute';
			moveTarget.style.zIndex = 3;
			document.body.appendChild(moveTarget); // take off parent container
		} else {
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
		}
	}

	// started to move an item
	if (dropItem) {
		if (!moving) {
			itemPositions = [];
			[...dropItem.parentNode.querySelectorAll('.item-container')].forEach((el) => {
				itemPositions.push({
					x: el.offsetLeft,
					y: el.offsetTop,
					ref: el
				});
			});

			const parent = moveItem.parentNode;
			const  { offsetHeight } = parent;
			parent.style.height = `${offsetHeight}px`;
			moving = true;

			const { offsetWidth } = moveItem;
			moveItem.style.position = 'absolute';
			moveItem.style.zIndex = 3;
			moveItem.style.width = `${offsetWidth}px`;
			document.body.appendChild(moveItem); // take off parent container
		} else {
			moveItem.style.top = `${begin.bY - (begin.mY - event.clientY)}px`;
			moveItem.style.left = `${begin.bX - (begin.mX - event.clientX)}px`;

			const mX = event.clientX;
			const mY = event.clientY;
			let target = null;
			for (let i = 0; i < itemPositions.length; i++) {
				const t = itemPositions[i];
				if (mY < t.y + 25 && mY > t.y) {
					target = t.ref;
					break;
				}
			}
			if (target === dropItem || target == null)
				return;
			dropItem.style.height = '';
			const child = target.firstElementChild;
			target.style.height = `${moveItem.offsetHeight}px`;
			target.removeChild(child);
			dropItem.appendChild(child);
			dropItem = target;
		}
	}
});

document.addEventListener('mouseup', (event) => {
	if (dropTarget) {
		dropTarget.appendChild(moveTarget);
		moveTarget.style.left = '0px';
		moveTarget.style.top = '0px';
		moveTarget = null;
		dropTarget = null;
		begin = null;
		moving = false;
	}
	if (dropItem) {
		dropItem.appendChild(moveItem);
		dropItem.style.height = '';
		moveItem.style.left = '0px';
		moveItem.style.top = '0px';
		moveItem.style.position = 'relative';
		moveItem = null;
		dropItem = null;
		begin = null;
		moving = false;
		onItemDown = false;
	}
});

function runFunction(el, fn, num) {
	for (let i = 0; i < num; i++) {
		el[fn]();
	}
}


// const getId = generateId();

runFunction(addList, 'click', 5);