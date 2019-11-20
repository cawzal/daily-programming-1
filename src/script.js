function getCounter(initial) {
	let count = initial;
	return function() {
		return count++;
	}
}
const getItemId = getCounter(51);
const getListId = getCounter(5);

const placeholderEl = document.createElement('div');
placeholderEl.textContent = 'PLACEHOLDER';
placeholderEl.className = 'placeholder-el item';

const modalEl = document.createElement('modal');
modalEl.textContent = 'MODAL';
modalEl.className = 'modal';

const listsEl = document.querySelector('.lists');
const itemEls = document.querySelectorAll('.item');
const listEls = document.querySelectorAll('.list-items');
const listsEls = document.querySelectorAll('.list');
const addBtns = document.querySelectorAll('.list-new button');
const newListBtn = document.querySelector('.new');

let dragStartData = null;

function mousedownHandler(event) {
	// event.preventDefault(); prevents focus on text inputs

	if (dragStartData)
		return;

	let target = event.target;

	if (target.classList.contains('item')) {
		dragStartData = {
			targetEl: target,
			targetStartX: target.getBoundingClientRect().x,
			targetStartY: target.getBoundingClientRect().y,
			mouseStartX: event.clientX,
			mouseStartY: event.clientY,
			dragType: 'item'
		};

		placeholderEl.style.height = `${target.getBoundingClientRect().height}px`;

		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.width = `${target.getBoundingClientRect().width}px`;
		target.style.position = 'absolute';
		target.style.left = `${dragStartData.targetStartX + deltaX}px`;
		target.style.top = `${dragStartData.targetStartY + deltaY}px`;

		target.parentNode.replaceChild(placeholderEl, target);
		document.body.appendChild(target);

		return;
	}

	if (target.classList.contains('list-header')) {
		target = target.parentNode;

		dragStartData = {
			targetEl: target,
			targetStartX: target.getBoundingClientRect().x,
			targetStartY: target.getBoundingClientRect().y,
			mouseStartX: event.clientX,
			mouseStartY: event.clientY,
			dragType: 'list'
		};

		placeholderEl.style.height = `${target.getBoundingClientRect().height}px`;
		placeholderEl.style.width = `${target.getBoundingClientRect().width}px`; // list only

		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.width = `${target.getBoundingClientRect().width}px`;
		target.style.position = 'absolute';
		target.style.left = `${dragStartData.targetStartX + deltaX}px`;
		target.style.top = `${dragStartData.targetStartY + deltaY}px`;

		target.parentNode.replaceChild(placeholderEl, target);
		document.body.appendChild(target);

		return;
	}
}

function mousemoveHandler(event) {
	event.preventDefault();

	if (!dragStartData)
		return;

	const target = dragStartData.targetEl;

	if (dragStartData.dragType === 'item') {
		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.left = `${dragStartData.targetStartX + deltaX}px`;
		target.style.top = `${dragStartData.targetStartY + deltaY}px`;

		let parentList = null;
		[...document.querySelector('.lists').children].forEach((el) => {
			const left = el.getBoundingClientRect().x;
			const width = el.getBoundingClientRect().width;
			if ((left <= event.clientX) && (event.clientX <= left + width)) {
				parentList = el;
			}
		});

		if (parentList === null)
			return;

		parentList = parentList.children[1];
		if (parentList === placeholderEl.parentNode) {
			const listItemEls = parentList.querySelectorAll('.item');
			
			let currentItem = null;
			listItemEls.forEach((el) => {
				const top = el.getBoundingClientRect().y;
				const height = el.getBoundingClientRect().x;
				if ((top <= event.clientY) && (event.clientY <= top + height)) {
					currentItem = el;
				}
			});

			if (currentItem === null)
				return;

			if (currentItem === placeholderEl)
				return;

			const placeholderElY = placeholderEl.getBoundingClientRect().y;
			const currentItemY = currentItem.getBoundingClientRect().y;
			if (currentItemY < placeholderElY) {
				parentList.insertBefore(placeholderEl, currentItem);
			} else {
				parentList.insertBefore(currentItem, placeholderEl);
			}
			return;
		}

		placeholderEl.parentNode.removeChild(placeholderEl);
		const listItemEls = parentList.querySelectorAll('.item');
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
				parentList.appendChild(placeholderEl);
				return;
			}

			if (event.clientY < (parentList.firstElementChild.getBoundingClientRect().y + parentList.firstElementChild.getBoundingClientRect().height)) {
				parentList.insertBefore(placeholderEl, parentList.firstElementChild);
			} else {
				parentList.appendChild(placeholderEl);
			}
			return;
		}

		parentList.insertBefore(placeholderEl, currentItem);
		return;
	}

	if (dragStartData.dragType === 'list') {
		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.left = `${dragStartData.targetStartX + deltaX}px`;
		target.style.top = `${dragStartData.targetStartY + deltaY}px`;

		const listsEl = document.querySelector('.lists');
		let parentList = null;
		[...listsEl.children].forEach((el) => {
			const left = el.getBoundingClientRect().x;
			const width = el.getBoundingClientRect().width;
			if ((left <= event.clientX) && (event.clientX <= left + width)) {
				parentList = el;
			}
		});

		if (parentList === null)
			return;

		if (parentList === placeholderEl)
			return;

		const placeholderElX = placeholderEl.getBoundingClientRect().x;
		const currentItemX = parentList.getBoundingClientRect().x;

		if (placeholderElX < currentItemX) {
			parentList.parentNode.insertBefore(parentList, placeholderEl); // moving left towards right
		} else {
			parentList.parentNode.insertBefore(placeholderEl, parentList);
		}
		return;
	}
}

function mouseupHandler(event) {
	event.preventDefault();

	if (event.target.tagName === 'BUTTON')
		return;

	if (!dragStartData)
		return;

	const target = dragStartData.targetEl;
	placeholderEl.parentNode.replaceChild(target, placeholderEl);
	target.style.position = 'relative';
	target.style.left = '';
	target.style.top = '';
	target.style.width = '';
	dragStartData = null;
}

function mouseclickHandler(event) {
	if (event.target.tagName !== 'BUTTON')
		return;

	const target = event.target;
	const inputEl = target.previousElementSibling;
}

function newItem() {
	const div = document.createElement('div');
	div.textContent = `Item ${getItemId()}`;
	div.className = 'item';
	return div;
}

function newList() {
	const listDiv = document.createElement('div');
	listDiv.className = 'list';

	const headerDiv = document.createElement('div');
	headerDiv.className = 'list-header';
	headerDiv.textContent = `List ${getListId()}`;
	listDiv.appendChild(headerDiv);
	
	const itemsDiv = document.createElement('div');
	itemsDiv.className = 'list-items';
	listDiv.appendChild(itemsDiv);

	const newItemDiv = document.createElement('div');
	const newItemBtn = document.createElement('button');
	newItemBtn.textContent = 'Add';
	newItemDiv.appendChild(newItemBtn);
	listDiv.appendChild(newItemDiv);

	return listDiv;
}

function addItemHandler(event) {
	const parentList = event.currentTarget.closest('.list');
	parentList.children[1].appendChild(newItem());
}

function addListHandler(event) {
	const nList = newList();
	for (let i = 0; i < 5; i++) {
		nList.children[1].appendChild(newItem());
	}
	listsEl.appendChild(nList);
}

document.body.addEventListener('mousedown', mousedownHandler);
document.body.addEventListener('mousemove', mousemoveHandler);
document.body.addEventListener('mouseup', mouseupHandler);
document.body.addEventListener('click', mouseclickHandler);

addListHandler();
addListHandler();
addListHandler();