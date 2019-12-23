const mousedownQueue = [];

document.body.addEventListener('mousedown', (event) => {
	for (let i = 0; i < mousedownQueue.length; i++) {
		if (mousedownQueue[i](event)) {
			mousedownQueue.splice(i, 1);
			i--;
		}
	}
});

let potentialDrag = false;
let dragging = false;
let dragStartData = null;
let editing = false;
let editingTarget = null;
let scrollZone = '';
let scrolling = false;
let addingNewItem = false;
let addingTarget = null;
let editingItemTarget = null;

function mousedownHandler(event) {
	let target = event.target;

	if (target === document.body)
		return;

	if (target.parentNode.classList.contains('item-container')) {
		potentialDrag = true;
		target = target.parentNode;
		dragStartData = {
			startingListIndex: Number(target.closest('.list-container').dataset['index']),
			targetEl: target,
			targetStartX: target.getBoundingClientRect().x,
			targetStartY: target.getBoundingClientRect().y,
			mouseStartX: event.clientX,
			mouseStartY: event.clientY,
			dragType: 'item'
		};
		return;
	}

	if (target.parentNode.parentNode.classList.contains('list-header-title-container')) {
		potentialDrag = true;
		target = target.parentNode.parentNode.parentNode.parentNode;
		dragStartData = {
			targetEl: target,
			targetStartX: target.getBoundingClientRect().x,
			targetStartY: target.getBoundingClientRect().y,
			mouseStartX: event.clientX,
			mouseStartY: event.clientY,
			dragType: 'list'
		};
		return;
	}
}

function mousemoveHandler(event) {
	event.preventDefault();

 	// move event prevents click from firing, see SO topic regarding bug
	// console.log(`mousemove: ${event.target}`);

	if (!potentialDrag)
		return;

	const target = dragStartData.targetEl;

	if (!dragging) {
		dragging = true;

		if (dragStartData.dragType === 'item') {
			const padding = 10;
			// adding height to placeholder child
			placeholderContainerEl.firstElementChild.style.height = `${target.getBoundingClientRect().height - padding}px`;
			placeholderContainerEl.firstElementChild.style.width = `${target.getBoundingClientRect().width - padding}px`;

			const deltaX = event.clientX - dragStartData.mouseStartX;
			const deltaY = event.clientY - dragStartData.mouseStartY;
			target.style.width = `${target.getBoundingClientRect().width}px`;
			// target.style.position = 'absolute';
			target.style.left = `${dragStartData.targetStartX + deltaX}px`;
			target.style.top = `${dragStartData.targetStartY + deltaY}px`;

			target.parentNode.replaceChild(placeholderContainerEl, target);

			target.style.position = 'absolute';
			document.body.appendChild(target);
		} else {
			const padding = 10;
			placeholderContainerEl.style.height = `${target.firstElementChild.getBoundingClientRect().height + padding}px`;
			placeholderContainerEl.children[0].style.width = `${target.getBoundingClientRect().width - padding}px`; // list only

			console.log(placeholderContainerEl.style.position);

			const deltaX = event.clientX - dragStartData.mouseStartX;
			const deltaY = event.clientY - dragStartData.mouseStartY;
			target.style.width = `${target.getBoundingClientRect().width}px`;
			// target.style.position = 'absolute';
			target.style.left = `${dragStartData.targetStartX + deltaX}px`;
			target.style.top = `${dragStartData.targetStartY + deltaY}px`;

			target.parentNode.replaceChild(placeholderContainerEl, target);

			target.style.position = 'absolute';
			document.body.appendChild(target);
		}
	}

	if (dragStartData.dragType === 'item') {
		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.left = `${dragStartData.targetStartX + deltaX}px`;
		target.style.top = `${dragStartData.targetStartY + deltaY}px`;

		let parentList = null;
		[...document.querySelector('.lists').children].slice(0, -1).forEach((el) => {
			const left = el.getBoundingClientRect().x;
			const width = el.getBoundingClientRect().width;
			if ((left <= event.clientX) && (event.clientX <= left + width)) {
				parentList = el;
			}
		});

		if (parentList === null) // change nothing if not over any list
			return;

		parentList = parentList.children[0].children[1];
		
		if (parentList !== placeholderContainerEl.parentNode) {
			scrollZone = ''; // stop scrolling previous list
		}

		// same list
		if (parentList === placeholderContainerEl.parentNode) {
			const listItemEls = parentList.querySelectorAll('.item-container');
			let currentItem = null;
			[...listItemEls].some((el) => {
				const top = el.getBoundingClientRect().y;
				const height = el.getBoundingClientRect().height;
				const half = height / 2;
				if ((top <= event.clientY) && (event.clientY <= top + height)) {
					if (placeholderContainerEl.getBoundingClientRect().y < top) {
						if (top + half <= event.clientY) {
							currentItem = el;
							return true;
						}
					} else {
						if (event.clientY <= top + half) {
							currentItem = el;
							return true;
						}
					}
				}
				return false;
			});

			if ((parentList.clientHeight < parentList.scrollHeight)) {
				const top = parentList.getBoundingClientRect().top;
				const mouseY = event.clientY;
				if ((top < mouseY) && (mouseY < top + 100)) {
					if (parentList.scrollTop !== 0) {
						scrollZone = 'up';
						if (!scrolling) {
							scrolling = true;
							startScrollUp(parentList);
						}
					}
				} else if ((top + parentList.clientHeight - 100 < mouseY) && (mouseY < top + parentList.clientHeight)) {
					if (parentList.scrollTop + parentList.clientHeight < parentList.scrollHeight) {
						scrollZone = 'down';
						if (!scrolling) {
							scrolling = true;
							startScrollDown(parentList);
						}
					}
				} else {
					scrollZone = '';
				}
			}

			// if (scrolling)
			// 	return;

			if (currentItem === null)
				return;

			if (currentItem === placeholderContainerEl) {
				return;
			}

			const placeholderContainerElY = placeholderContainerEl.getBoundingClientRect().y;
			const currentItemY = currentItem.getBoundingClientRect().y;

			if (currentItemY < placeholderContainerElY) {;
				parentList.insertBefore(placeholderContainerEl, currentItem);
			} else {
				const sibling = currentItem.nextElementSibling;
				if (sibling) {
					parentList.insertBefore(placeholderContainerEl, currentItem.nextElementSibling);
					return;
				}
				parentList.appendChild(placeholderContainerEl);
			}
			return;
		}

		// change lists
		placeholderContainerEl.parentNode.removeChild(placeholderContainerEl);
		const listItemEls = parentList.querySelectorAll('.item-container');
		let currentItem = null;
		let dir = '';
		[...listItemEls].some((el) => {
			const top = el.getBoundingClientRect().y;
			const height = el.getBoundingClientRect().height;
			const half = height / 2;
			if ((top <= event.clientY) && (event.clientY <= top + height)) {
				if (top + half <= event.clientY) {
					currentItem = el;
					dir = 'below';
					return true;
				} else {
					currentItem = el;
					dir = 'above';
					return true;
				}
			}
			return false;
		});

		if (currentItem === null) {
			if (parentList.children.length === 0) {
				parentList.appendChild(placeholderContainerEl);
				return;
			}

			// not over any lists, so either above or below
			const top = parentList.firstElementChild.getBoundingClientRect().y;
			if (event.clientY < top) {
				parentList.insertBefore(placeholderContainerEl, parentList.firstElementChild);
			} else {
				if (parentList.lastElementChild !== insertNewItemInputContainer) {
					parentList.appendChild(placeholderContainerEl);
					return;
				}
				parentList.insertBefore(placeholderContainerEl, parentList.lastElementChild);
			}
			return;
		}

		if (dir === 'above') {
			parentList.insertBefore(placeholderContainerEl, currentItem);
		} else if (dir === 'below') {
			const sibling = currentItem.nextElementSibling;
			if (sibling) {
				parentList.insertBefore(placeholderContainerEl, sibling);
				return;
			}
			parentList.appendChild(placeholderContainerEl);
		}
		return;
	}

	if (dragStartData.dragType === 'list') {
		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.left = `${dragStartData.targetStartX + deltaX}px`;
		target.style.top = `${dragStartData.targetStartY + deltaY}px`;

		const listsEl = document.querySelector('.lists');
		let parentList = null;
		[...listsEl.children].slice(0, -1).forEach((el) => {
			const left = el.getBoundingClientRect().x;
			const width = el.getBoundingClientRect().width;
			if ((left <= event.clientX) && (event.clientX <= left + width)) {
				parentList = el;
			}
		});

		// try to put scrolling in here...
		const scrollX = container.scrollLeft;
		const widthX = container.scrollWidth;
		const mouseX = event.clientX;
		const pageWidth = container.clientWidth;

		if ((0 < mouseX) && (mouseX < 100)) {
			if (scrollX !== 0) {
				scrollZone = 'left';
				if (!scrolling) {
					scrolling = true;
					startScrollLeft();
				}
			}
		} else if (((pageWidth - 100) < mouseX) && (mouseX < pageWidth)) {
			if ((scrollX + pageWidth) !== widthX) {
				scrollZone = 'right';
				if (!scrolling) {
					scrolling = true;
					startScrollRight();
				}
			}
		} else {
			scrollZone = '';
		}

		if (parentList === null)
			return;

		if (parentList === placeholderContainerEl)
			return;

		const placeholderContainerElX = placeholderContainerEl.getBoundingClientRect().x;
		const currentItemX = parentList.getBoundingClientRect().x;

		if (placeholderContainerElX < currentItemX) {
			parentList.parentNode.insertBefore(parentList, placeholderContainerEl); // moving left towards right
		} else {
			parentList.parentNode.insertBefore(placeholderContainerEl, parentList);
		}
		return;
	}
}

function mouseupHandler(event) {
	event.preventDefault();

	if (addingNewItem && dragging) {
		const target = dragStartData.targetEl;
		placeholderContainerEl.parentNode.replaceChild(target, placeholderContainerEl);
		target.style.removeProperty('position');
		target.style.removeProperty('left');
		target.style.removeProperty('top');
		target.style.removeProperty('width');
		placeholderContainerEl.style.removeProperty('height');
		if (dragStartData.dragType === 'item') {
			placeholderContainerEl.firstElementChild.style.removeProperty('height');

			// copied and pasted...
			const startingItemIndex = Number(target.dataset['index']);
			const currentList = Number(target.closest('.list-container').dataset['index']);

			if (currentList === dragStartData.startingListIndex) {
				let insertItemAtIndex = -1;
				const previousElement = target.previousElementSibling;
				if (previousElement) {
					insertItemAtIndex = Number(previousElement.dataset['index']);
				}

				if (startingItemIndex === insertItemAtIndex + 1) {
					// leave as is
				} else if (startingItemIndex < insertItemAtIndex) {
					insertItemAt(currentList, startingItemIndex, insertItemAtIndex);
				} else {
					insertItemAt(currentList, startingItemIndex, insertItemAtIndex + 1);
				}

				const index = getCounter(0);
				[...listsEl.children[currentList].querySelectorAll('.item-container')].forEach((el) => {
					el.dataset['index'] = index()
				});
			} else {
				let insertItemAtIndex = -1;
				const previousElement = target.previousElementSibling;
				if (previousElement) {
					insertItemAtIndex = Number(previousElement.dataset['index']);
				}
				insertItemAt2(dragStartData.startingListIndex, currentList, startingItemIndex, insertItemAtIndex + 1);

				const index = getCounter(0);
				[...listsEl.children[currentList].querySelectorAll('.item-container')].forEach((el) => {
					el.dataset['index'] = index()
				});
				const index2 = getCounter(0);
				[...listsEl.children[dragStartData.startingListIndex].querySelectorAll('.item-container')].forEach((el) => {
					el.dataset['index'] = index2()
				});
			}

		}
		dragStartData = null;
		dragging = false;
		potentialDrag = false;
		return;
	}

	if (addingNewItem && !event.target.classList.contains('eh')) {
		const list = addingTarget;
		list.children[1].removeChild(insertNewItemInputContainer);
		list.children[2].style.display = 'block';
		textarea.value = '';
		helper.textContent = '';
		addingNewItem = false;
		addingTarget = null;
		return;
	}

	potentialDrag = false;

	if (scrolling) {
		scrolling = false;
		scrollZone = '';
	}

	if (event.target.classList.contains('item')) {
		if (!dragging) {
			editingItemTarget = event.target;
			const text = editingItemTarget.textContent;
			displayModel(itemDisplayInformationContainer, text);
			return;
		}
	}

	if (event.target.tagName === 'BUTTON')
		return;

	if (!dragStartData)
		return;

	if (!dragging)
		return;

	const target = dragStartData.targetEl;
	placeholderContainerEl.parentNode.replaceChild(target, placeholderContainerEl);
	target.style.removeProperty('position');
	target.style.removeProperty('left');
	target.style.removeProperty('top');
	target.style.removeProperty('width');
	placeholderContainerEl.style.removeProperty('height');
	if (dragStartData.dragType === 'item') {
		placeholderContainerEl.firstElementChild.style.removeProperty('height');
	}

	if (dragStartData.dragType === 'item') {
		const startingItemIndex = Number(target.dataset['index']);
		const currentList = Number(target.closest('.list-container').dataset['index']);

		if (currentList === dragStartData.startingListIndex) {
			let insertItemAtIndex = -1;
			const previousElement = target.previousElementSibling;
			if (previousElement) {
				insertItemAtIndex = Number(previousElement.dataset['index']);
			}

			if (startingItemIndex === insertItemAtIndex + 1) {
				// leave as is
			} else if (startingItemIndex < insertItemAtIndex) {
				insertItemAt(currentList, startingItemIndex, insertItemAtIndex);
			} else {
				insertItemAt(currentList, startingItemIndex, insertItemAtIndex + 1);
			}

			const index = getCounter(0);
			[...listsEl.children[currentList].querySelectorAll('.item-container')].forEach((el) => {
				el.dataset['index'] = index()
			});
		} else {
			let insertItemAtIndex = -1;
			const previousElement = target.previousElementSibling;
			if (previousElement) {
				insertItemAtIndex = Number(previousElement.dataset['index']);
			}
			insertItemAt2(dragStartData.startingListIndex, currentList, startingItemIndex, insertItemAtIndex + 1);

			const index = getCounter(0);
			[...listsEl.children[currentList].querySelectorAll('.item-container')].forEach((el) => {
				el.dataset['index'] = index()
			});
			const index2 = getCounter(0);
			[...listsEl.children[dragStartData.startingListIndex].querySelectorAll('.item-container')].forEach((el) => {
				el.dataset['index'] = index2()
			});
		}

	} else {
		const startingIndex = Number(target.dataset['index']);
		let insertAtIndex = 0;
		const previousElement = target.previousElementSibling;
		if (previousElement) {
			insertAtIndex = Number(previousElement.dataset['index']);
		}

		if (startingIndex <= insertAtIndex) {
			insertListAt(startingIndex, insertAtIndex);
		} else {
			insertListAt(startingIndex, insertAtIndex + 1);
		}

		const index = getCounter(0);
		[...document.querySelectorAll('.list-container')].forEach((el) => el.dataset['index'] = index());
	}
	dragStartData = null;
	dragging = false;
	potentialDrag = false;
}

function mouseclickHandler(event) {
	const target = event.target;
	if (target.classList.contains('editable')) {
		makeTargetEditable(event.target);
		return;
	}
	if (target.classList.contains('add')) {
		showAddNewItemContainer(event.target);
		return;
	}

	if (target.tagName !== 'BUTTON')
		return;

	if (target.classList.contains('new')) {
		data.lists.push({
			name: 'empty',
			items: []
		});
		const nList = newList();
		listsEl.insertBefore(nList, listsEl.lastElementChild);
		nList.dataset['index'] = Number(nList.previousElementSibling.dataset['index']) + 1;
	}
}

function createElements(structure, info={}) {
	if (Array.isArray(structure)) {
		const data = structure[0].split('|');
		const el = document.createElement(data[0]);
		if (data[1])
			el.className = data[1];
		if (data[2]) {
			if (data[2].includes(':')) {
				const extra = data[2].split(':');
				if (extra[0].startsWith('set')) {
					const fn = `${extra[1]}()`;
					info[extra[0].replace('set', '')] = `List ${eval(fn)}`;
				} else {
					el.textContent = info[extra[1]];
				}
			} else {
				el.textContent = data[2];
			}
		}
		for (let i = 1; i < structure.length; i++) {
			el.appendChild(createElements(structure[i], info));
		}
		return el;
	}
}

function newList(title) {
	return createElements(
		['div|list-container',
			['div|list',
				['div|list-header-title-container editable-container grow-height', ['div|list-header-title', [`span|editable|${title}`]],
					['div|list-header-edit', ['textarea']]
				],
				['div|list-items'],
				['div|new-item-div', ['button|add|Add Item']]
			]
		]
	);
}

function newItem(title=`Item ${getItemId()}`) {
	return createElements(
		['div|item-container',
			['div|item|' + title]
		]
	);
}

function addListHandler(event, n) {
	const nList = newList();
	for (let i = 0; i < n; i++) {
		nList.children[0].children[1].appendChild(newItem());
	}
	listsEl.insertBefore(nList, listsEl.lastElementChild);
}

document.body.addEventListener('mousedown', mousedownHandler);
document.body.addEventListener('mousemove', mousemoveHandler);
document.body.addEventListener('mouseup', mouseupHandler);
document.body.addEventListener('click', mouseclickHandler);

const container = document.querySelector('.lists-container');
const placeholderContainerEl = createElements(
	['div|placeholder-el item-container', ['div']]
);

const listsEl = document.querySelector('.lists');

init();

const modalEl = createElements(['div|modal']);
const itemEls = document.querySelectorAll('.item');
const listEls = document.querySelectorAll('.list-items');
const listsEls = document.querySelectorAll('.list');
const addBtns = document.querySelectorAll('.list-new button');
const newListBtn = document.querySelector('.new');

function makeTargetEditable(el) {
	const containerEl = el.closest('.editable-container');
	const displayEl = containerEl.firstElementChild.firstElementChild;
	const inputContainerEl = containerEl.lastElementChild;
	const inputEl = inputContainerEl.firstElementChild;

	if (inputEl.tagName === 'TEXTAREA') {
		inputEl.textContent = displayEl.textContent;
	} else {
		inputEl.value = displayEl.textContent;
	}

 	// replace this with dataset attribute?
	let growProperty = 'width';
	if (containerEl.classList.contains('grow-height')) {
		growProperty = 'height';
	}

	inputEl.style[growProperty] = `${displayEl.getBoundingClientRect()[growProperty]}px`;
	inputContainerEl.style.zIndex = 1;

	const editableInputHandler = (event) => {
		displayEl.textContent = inputEl.value;
		inputEl.style[growProperty] = `${displayEl.getBoundingClientRect()[growProperty]}px`;
	}

	inputEl.addEventListener('input', editableInputHandler);
	inputEl.focus();
	inputEl.setSelectionRange(-1, -1);

	mousedownQueue.push((event) => {
		const target = event.target;
		if (target === inputEl)
			return false;

		// todo: update data object
		inputEl.removeEventListener('input', editableInputHandler);
		inputContainerEl.style.zIndex = -1;
		return true;
	});
}

function displayModel(content, text) {
	const span = itemDisplayInformationContainer.querySelector('span');
	span.textContent = text;
	const textArea = itemDisplayInformationContainer.querySelector('textarea');
	textArea.value = text;
	textArea.style.height = '0px';

	modalEl.appendChild(content);
	document.body.appendChild(modalEl);
}

modalEl.addEventListener('click', (event) => {
	if (event.target !== modalEl)
		return;
	if (editingItemTarget !== null) {
		editingItemTarget.textContent = itemDisplayInformationContainer.querySelector('span').textContent;
		itemDisplayInformationContainer.querySelector('textarea').parentNode.style.zIndex = -1;
		editingItemTarget = null;
	}
	document.body.removeChild(modalEl);
});

function startScrollUp(elm) {
	elm.scrollTop -= 20;
	if (scrollZone === 'up' && elm.scrollTop !== 0) {
		setTimeout(() => startScrollUp(elm), 50);
	} else {
		scrolling = false;
	}
}

function startScrollDown(elm) {
	elm.scrollTop += 20;
	if (scrollZone === 'down' && (elm.scrollTop + elm.clientHeight) !== elm.scrollHeight) {
		setTimeout(() => startScrollDown(elm), 50);
	} else {
		scrolling = false;
	}
}

function startScrollLeft() {
	container.scrollLeft = container.scrollLeft - 5;
	if (scrollZone === 'left' && container.scrollLeft !== 0) {
		setTimeout(startScrollLeft, 25);
	} else {
		scrolling = false;
	}
}

function startScrollRight() {
	container.scrollLeft = container.scrollLeft + 5;
	if (scrollZone === 'right' && (container.scrollLeft + container.clientWidth) !== container.scrollWidth) {
		setTimeout(startScrollRight, 25);
	} else {
		scrolling = false;
	}
}

const insertNewItemInputContainer = document.createElement('div');
insertNewItemInputContainer.className = 'insert-new-item-input-container';

const inputContainerTextareaDiv = document.createElement('div');

const helper = document.createElement('div');
helper.className = 'helper';

const textarea = document.createElement('textarea');
textarea.className = "new-textarea eh";

inputContainerTextareaDiv.appendChild(textarea);
insertNewItemInputContainer.appendChild(helper);
insertNewItemInputContainer.appendChild(inputContainerTextareaDiv);

const inputContainerButtonsDiv = document.createElement('div');
inputContainerButtonsDiv.className = 'new-buttons-area';

const objB = document.createElement('button');
objB.textContent = 'Add';
objB.className = 'eh adding';
objB.addEventListener('click', (event) => {
	if (textarea.value === '')
		return;

	const list = event.target.closest('.list');
	const o = newItem(helper.textContent);
	list.children[1].insertBefore(o, insertNewItemInputContainer);
	data.lists[Number(list.closest('.list-container').dataset['index'])].items.push(helper.textContent);
	o.dataset['index'] = (o.previousElementSibling === null) ? 0 : Number(o.previousElementSibling.dataset['index']) + 1;
	textarea.value = '';
	helper.textContent = '';
	textarea.style.height = '';
	const itemsContainer = list.children[1];
	if (itemsContainer.clientHeight < itemsContainer.scrollHeight) {
		itemsContainer.scrollTop = itemsContainer.scrollHeight - itemsContainer.clientHeight;
	}
	addingNewItem = false;
	addingTarget = null;
});

const objC = document.createElement('button');
objC.className = 'eh cancel';
objC.textContent = 'Cancel';
objC.addEventListener('click', (event) => {
	addingNewItem = false;
	addingTarget = null;
	const list = event.target.closest('.list');
	list.children[1].removeChild(insertNewItemInputContainer);
	list.children[2].style.display = 'block';
	textarea.value = '';
	helper.textContent = '';
	textarea.style.height = '';
});

function showAddNewItemContainer(el) {
	const list = el.closest('.list');
	const button = el.closest('.new-item-div');
	button.style.display = 'none'
	const itemsContainer = list.children[1];
	itemsContainer.appendChild(insertNewItemInputContainer);

	if (itemsContainer.clientHeight < itemsContainer.scrollHeight) {
		itemsContainer.scrollTop = itemsContainer.scrollHeight - itemsContainer.clientHeight;
	}

	mousedownQueue.push((event) => {
		const target = event.target;
		if (target.tagName === 'TEXTAREA' || target.classList.contains('adding') || target.parentNode.parentNode.classList.contains('list-header')) {
			return false;
		}

		if (target.classList.contains('add')) {
			itemsContainer.removeChild(insertNewItemInputContainer);
			button.style.display = 'block';
			return true;
		}

		if (target.classList.contains('cancel')) {
			return true;
		}

		if (textarea.value === '') {
			itemsContainer.removeChild(insertNewItemInputContainer);
			button.style.display = 'block';
			return true;
		}

		const o = newItem(helper.textContent);
		itemsContainer.insertBefore(o, insertNewItemInputContainer);
		textarea.value = '';
		helper.textContent = '';
		itemsContainer.removeChild(insertNewItemInputContainer);
		button.style.display = 'block';

		return true;
	});
}

inputContainerButtonsDiv.appendChild(objB);
inputContainerButtonsDiv.appendChild(objC);
insertNewItemInputContainer.appendChild(inputContainerButtonsDiv);

textarea.addEventListener('input', (event) => {
	helper.textContent = textarea.value;
	textarea.style.height = `${helper.getBoundingClientRect().height}px`;
});

// container.scrollLeft = container.scrollWidth - container.clientWidth; // scrolled right on refresh

const itemDisplayInformationContainer = createElements(
	['div|item-display-container',
		['div|item-header editable-container grow-height', ['div|item-header-display', ['span|editable|placeholder']],
			['div|item-header-edit', ['textarea']]
		]
	]
);

function init() {
	const getListIndex = getCounter(0);
	data.lists.forEach((list) => {
		const nList = newList(list.name);
		nList.dataset['index'] = getListIndex();
		const getItemIndex = getCounter(0);
		const listItemsEl = nList.querySelector('.list-items');
		list.items.forEach((item) => {
			const o = newItem(item);
			o.dataset['index'] = getItemIndex();
			listItemsEl.appendChild(o);
		});
		listsEl.insertBefore(nList, listsEl.lastElementChild);
	});
}