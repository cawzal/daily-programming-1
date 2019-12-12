function getCounter(initial) {
	let count = initial;
	return function() {
		return count++;
	}
}
const getItemId = getCounter(1);
const getListId = getCounter(1);

const container = document.querySelector('.container');

const placeholderContainerEl = createElements(
	['div|placeholder-el item-container', ['div']]
);

const modalEl = createElements(['div|modal']);

const listsEl = document.querySelector('.lists');
const itemEls = document.querySelectorAll('.item');
const listEls = document.querySelectorAll('.list-items');
const listsEls = document.querySelectorAll('.list');
const addBtns = document.querySelectorAll('.list-new button');
const newListBtn = document.querySelector('.new');

let potentialDrag = false;
let dragging = false;
let dragStartData = null;
let editing = false;
let editingTarget = null;
let scrollZone = '';
let scrolling = false;
let addingNewItem = false;
let addingTarget = null;

function mousedownHandler(event) {
	let target = event.target;

	if (target === document.body)
		return;

	if (target.parentNode.classList.contains('item-container')) {
		potentialDrag = true;
		target = target.parentNode;
		dragStartData = {
			targetEl: target,
			targetStartX: target.getBoundingClientRect().x,
			targetStartY: target.getBoundingClientRect().y,
			mouseStartX: event.clientX,
			mouseStartY: event.clientY,
			dragType: 'item'
		};
		return;
	}

	if (target.parentNode.parentNode.classList.contains('list-header')) {
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
			placeholderContainerEl.children[0].style.width = `${target.getBoundingClientRect().width - 10}px`; // list only

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
			displayModel();
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
	dragStartData = null;
	dragging = false;
	potentialDrag = false;
}

function mouseclickHandler(event) {
	if (editing) {
		editing = false;

		if (editingTarget === headerEl) {
			headerEl.children[0].classList.remove('hide');
			headerEl.children[1].classList.add('hide');
		} else {
			editingTarget.lastElementChild.style.zIndex = '-1';
		}
		return;
	}

	const target = event.target;
	if (target.tagName !== 'BUTTON')
		return;

	const inputEl = target.previousElementSibling;

	if (target.classList.contains('add')) {
		if (addingTarget !== null) {
			addingTarget.children[2].style.display = 'block';
		}
		addingNewItem = true;
		const nItem = newItem();
		const parent = target.closest('.list');
		addingTarget = parent;
		const button = target.closest('.new-item-div');
		button.style.display = 'none';
		parent.children[1].appendChild(insertNewItemInputContainer);
		// scroll if required
		const itemsContainer = parent.children[1];
		if (itemsContainer.clientHeight < itemsContainer.scrollHeight) {
			itemsContainer.scrollTop = itemsContainer.scrollHeight - itemsContainer.clientHeight;
		}
		return;
	}

	if (target.classList.contains('new')) {
		const nList = newList();
		listsEl.insertBefore(nList, listsEl.lastElementChild);
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

function newList() {
	return createElements(
		['div|list-container',
			['div|list|settitle:getListId',
				['div|list-header', ['div|header-title', ['span||:title']],
					['div|header-edit hide', ['textarea']]
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

for (let i = 0; i < 10; i++) {
	addListHandler(null, i % 2 === 0 ? 50 : 10);
}

const headerEl = document.querySelector('.header');
headerEl.addEventListener('click', (event) => {
	const el = headerEl;
	const titleDiv = el.children[0];
	const titleSpan = titleDiv.firstElementChild;

	const editorDiv = el.children[1];
	const editorDivTextarea = editorDiv.firstElementChild;

	editorDivTextarea.style.width = `${titleSpan.getBoundingClientRect().width}px`;
	editorDivTextarea.style.padding = '5px';

	event.stopPropagation();
	editing = true;
	editingTarget = headerEl;

	editorDivTextarea.value = titleSpan.textContent;
	editorDiv.style.zIndex = '1';

	editorDivTextarea.addEventListener('input', (event) => {
		titleSpan.textContent = editorDivTextarea.value;
		if (editorDivTextarea.value === '') {
			return;
		}
		editorDivTextarea.style.width = `${titleSpan.getBoundingClientRect().width}px`;
	});
});

const editingHelperContainer = document.createElement('div');
editingHelperContainer.className = 'editing-helper-container';

const editingHelper = document.createElement('div');
editingHelper.className = 'editing-helper';
editingHelperContainer.appendChild(editingHelper);

const listTitleEls = document.querySelectorAll('.list-header');
listTitleEls.forEach((el) => {
	const titleDiv = el.children[0];
	const titleSpan = titleDiv.firstElementChild;
	titleSpan.style.minHeight = '19px';
	titleSpan.style.padding = '5px';
	titleDiv.style.paddingRight = '15px';

	const editorDiv = el.children[1];
	const editorDivTextarea = editorDiv.firstElementChild;

	editorDiv.style.position = 'absolute';
	editorDiv.style.left = '0';
	editorDiv.style.top = '0';
	editorDiv.style.zIndex = '-1';
	editorDiv.style.padding = '5px';
	editorDiv.style.paddingRight = '15px';
	editorDiv.style.width = '100%';

	editorDivTextarea.style.height = `${titleSpan.getBoundingClientRect().height}px`;
	editorDivTextarea.style.width = '100%';
	editorDivTextarea.style.padding = '5px';

	el.addEventListener('click', (event) => {
		event.stopPropagation();
		editing = true;
		editingTarget = el;

		editorDivTextarea.value = titleSpan.textContent;
		editorDiv.style.zIndex = '1';

		editorDivTextarea.addEventListener('input', (event) => {
			titleSpan.textContent = editorDivTextarea.value;
			if (editorDivTextarea.value === '') {
				return;
			}
			editorDivTextarea.style.height = `${titleSpan.getBoundingClientRect().height}px`;
		});
	});
});

document.body.addEventListener('keypress', (event) => {});

function displayModel(content) {
	modalEl.innerHTML = content;
	document.body.appendChild(modalEl);
}

modalEl.addEventListener('click', (event) => {
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
objB.className = 'eh';
objB.addEventListener('click', (event) => {
	if (textarea.value === '')
		return;

	const list = event.target.closest('.list');

	list.children[1].insertBefore(newItem(helper.textContent), insertNewItemInputContainer);
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
objC.className = 'eh';
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

inputContainerButtonsDiv.appendChild(objB);
inputContainerButtonsDiv.appendChild(objC);
insertNewItemInputContainer.appendChild(inputContainerButtonsDiv);

textarea.addEventListener('input', (event) => {
	helper.textContent = textarea.value;
	textarea.style.height = `${helper.getBoundingClientRect().height}px`;
});


// container.scrollLeft = container.scrollWidth - container.clientWidth; // scrolled right on refresh

document.querySelectorAll('.list-items')[3].appendChild(newItem('makelarge'.repeat(20)));
document.querySelectorAll('.list-items')[2].appendChild(newItem('makelarge'.repeat(20)));
document.querySelectorAll('.list-items')[1].appendChild(newItem('makemedium'.repeat(6)));
document.querySelectorAll('.list-items')[3].appendChild(newItem('makemedium'.repeat(6)));
document.querySelectorAll('.list-items')[4].appendChild(newItem('makemedium'.repeat(6)));