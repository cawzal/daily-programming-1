function getCounter(initial) {
	let count = initial;
	return function() {
		return count++;
	}
}
const getItemId = getCounter(1);
const getListId = getCounter(1);

const container = document.querySelector('.container');

const placeholderContainerEl = document.createElement('div');
placeholderContainerEl.appendChild(document.createElement('div'));
placeholderContainerEl.className = 'placeholder-el item-container';

const modalEl = document.createElement('modal');
modalEl.className = 'modal';

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
			target.style.left = `${window.pageXOffset + dragStartData.targetStartX + deltaX}px`;
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
			target.style.left = `${window.pageXOffset + dragStartData.targetStartX + deltaX}px`;
			target.style.top = `${dragStartData.targetStartY + deltaY}px`;

			target.parentNode.replaceChild(placeholderContainerEl, target);

			target.style.position = 'absolute';
			document.body.appendChild(target);
		}

		console.log(placeholderContainerEl.getBoundingClientRect());
	}



	if (dragStartData.dragType === 'item') {
		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.left = `${window.pageXOffset + dragStartData.targetStartX + deltaX}px`;
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
		if (parentList === placeholderContainerEl.parentNode) {
			const listItemEls = parentList.querySelectorAll('.item-container');
			
			let currentItem = null;
			listItemEls.forEach((el) => {
				const top = el.getBoundingClientRect().y;
				const height = el.getBoundingClientRect().x;
				if ((top <= event.clientY) && (event.clientY <= top + height)) {
					currentItem = el;
				}
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

		placeholderContainerEl.parentNode.removeChild(placeholderContainerEl);
		const listItemEls = parentList.querySelectorAll('.item-container');
		let currentItem = null;
		listItemEls.forEach((el) => {
			const top = el.getBoundingClientRect().y;
			const height = el.getBoundingClientRect().x;
			if ((top <= event.clientY) && (event.clientY <= top + height)) {
				currentItem = el;
			}
		});

		if (currentItem === null) {
			if (parentList.children.length === 0) {
				parentList.appendChild(placeholderContainerEl);
				return;
			}

			if (event.clientY < (parentList.firstElementChild.getBoundingClientRect().y + parentList.firstElementChild.getBoundingClientRect().height)) {
				parentList.insertBefore(placeholderContainerEl, parentList.firstElementChild);
			} else {
				parentList.appendChild(placeholderContainerEl);
			}
			return;
		}

		parentList.insertBefore(placeholderContainerEl, currentItem);
		return;
	}

	if (dragStartData.dragType === 'list') {
		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.left = `${window.pageXOffset + dragStartData.targetStartX + deltaX}px`;
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
			editingTarget.children[0].classList.remove('hide');
			editingTarget.children[1].classList.add('hide');
			editingTarget.children[0].firstElementChild.textContent = editingHelper.textContent;
			editingTarget.children[1].removeChild(editingHelperContainer);
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

function newItem(title=getItemId()) {
	const itemContainerEl = document.createElement('div');
	itemContainerEl.className = 'item-container';
	const itemEl = document.createElement('div');
	itemEl.textContent = `Item ${title}`;
	itemEl.className = 'item';
	itemContainerEl.appendChild(itemEl);
	return itemContainerEl;
}

function newList() {
	const listContainerEl = document.createElement('div');
	listContainerEl.className = 'list-container';

	const listDiv = document.createElement('div');
	listDiv.className = 'list';

	const headerDiv = document.createElement('div');
	headerDiv.className = 'list-header';

	const headerTitle = document.createElement('div');
	headerTitle.className = 'header-title';

	const headerSpan = document.createElement('span');
	headerSpan.textContent = `List ${getListId()}`;
	headerTitle.appendChild(headerSpan);
	headerDiv.appendChild(headerTitle);

	const headerEdit = document.createElement('div');
	headerEdit.className = 'header-edit hide';

	const headerInput = document.createElement('textarea');
	headerInput.value = headerTitle.textContent;

	headerEdit.appendChild(headerInput);
	headerDiv.appendChild(headerEdit);


	listDiv.appendChild(headerDiv);
	
	const itemsDiv = document.createElement('div');
	itemsDiv.className = 'list-items';
	listDiv.appendChild(itemsDiv);

	const newItemDiv = document.createElement('div');
	newItemDiv.className = 'new-item-div';
	const newItemBtn = document.createElement('button');
	newItemBtn.textContent = 'Add Item';
	newItemBtn.className = 'add';
	newItemDiv.appendChild(newItemBtn);
	listDiv.appendChild(newItemDiv);
	listContainerEl.appendChild(listDiv);

	return listContainerEl;
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
	event.stopPropagation();

	editing = true;
	editingTarget = headerEl;

	headerEl.children[1].classList.remove('hide');
	headerEl.children[0].classList.add('hide');

	headerEl.children[1].firstElementChild.style.width = `${Math.ceil(headerEl.children[0].firstElementChild.getBoundingClientRect().width) + 20}px`;

	headerEl.children[1].firstElementChild.addEventListener('input', (event) => {
		headerEl.children[0].firstElementChild.textContent = event.target.value;
		headerEl.children[1].firstElementChild.style.width = `${Math.ceil(headerEl.children[0].firstElementChild.getBoundingClientRect().width) + 20}px`;
	});
});

const editingHelperContainer = document.createElement('div');
editingHelperContainer.className = 'editing-helper-container';

const editingHelper = document.createElement('div');
editingHelper.className = 'editing-helper';
editingHelperContainer.appendChild(editingHelper);

const listTitleEls = document.querySelectorAll('.list-header');
listTitleEls.forEach((el) => {
	el.addEventListener('click', (event) => {
		event.stopPropagation();
		editing = true;
		editingTarget = el;

		el.children[1].classList.remove('hide');
		el.children[0].classList.add('hide');

		el.children[1].appendChild(editingHelperContainer);
		editingHelper.textContent = el.children[0].firstElementChild.textContent;
		el.children[1].firstElementChild.style.height = `${Math.ceil(editingHelper.getBoundingClientRect().height)}px`;

		el.children[1].firstElementChild.addEventListener('input', (event) => {
			editingHelper.textContent = event.target.value;
			el.children[1].firstElementChild.style.height = `${Math.ceil(editingHelper.getBoundingClientRect().height)}px`;
		});
	});
});

document.body.addEventListener('keypress', (event) => {});

function displayModel() {
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

const objA = document.createElement('textarea');
objA.className = "new-textarea";
inputContainerTextareaDiv.appendChild(objA);
insertNewItemInputContainer.appendChild(inputContainerTextareaDiv);

const inputContainerButtonsDiv = document.createElement('div');
inputContainerButtonsDiv.className = 'new-buttons-area';

const objB = document.createElement('button');
objB.textContent = 'Add';
objB.addEventListener('click', (event) => {
	const list = event.target.closest('.list');
	list.children[1].insertBefore(newItem(), insertNewItemInputContainer);
	const itemsContainer = list.children[1];
	if (itemsContainer.clientHeight < itemsContainer.scrollHeight) {
		itemsContainer.scrollTop = itemsContainer.scrollHeight - itemsContainer.clientHeight;
	}
});

const objC = document.createElement('button');
objC.textContent = 'Cancel';
objC.addEventListener('click', (event) => {
	addingNewItem = false;
	addingTarget = null;
	const list = event.target.closest('.list');
	list.children[1].removeChild(insertNewItemInputContainer);
	list.children[2].style.display = 'block';
});

inputContainerButtonsDiv.appendChild(objB);
inputContainerButtonsDiv.appendChild(objC);
insertNewItemInputContainer.appendChild(inputContainerButtonsDiv);


// container.scrollLeft = container.scrollWidth - container.clientWidth; // scrolled right on refresh