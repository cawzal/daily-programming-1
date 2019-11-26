function getCounter(initial) {
	let count = initial;
	return function() {
		return count++;
	}
}
const getItemId = getCounter(1);
const getListId = getCounter(1);

const placeholderContainerEl = document.createElement('div');
placeholderContainerEl.appendChild(document.createElement('div'));
placeholderContainerEl.className = 'placeholder-el item-container';

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
let editing = false;
let editingTarget = null;

function mousedownHandler(event) {
	// event.preventDefault(); prevents focus on text inputs

	if (dragStartData)
		return;

	let target = event.target;

	if (target.parentNode.classList.contains('item-container')) {
		target = target.parentNode;
		dragStartData = {
			targetEl: target,
			targetStartX: target.getBoundingClientRect().x,
			targetStartY: target.getBoundingClientRect().y,
			mouseStartX: event.clientX,
			mouseStartY: event.clientY,
			dragType: 'item'
		};

		placeholderContainerEl.style.height = `${target.getBoundingClientRect().height}px`;

		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.width = `${target.getBoundingClientRect().width}px`;
		target.style.position = 'absolute';
		target.style.left = `${dragStartData.targetStartX + deltaX}px`;
		target.style.top = `${dragStartData.targetStartY + deltaY}px`;

		target.parentNode.replaceChild(placeholderContainerEl, target);
		document.body.appendChild(target);

		return;
	}

	if (target.classList.contains('list-header')) {
		target = target.parentNode.parentNode;

		dragStartData = {
			targetEl: target,
			targetStartX: target.getBoundingClientRect().x,
			targetStartY: target.getBoundingClientRect().y,
			mouseStartX: event.clientX,
			mouseStartY: event.clientY,
			dragType: 'list'
		};

		placeholderContainerEl.style.height = `${target.getBoundingClientRect().height}px`;
		placeholderContainerEl.style.width = `${target.getBoundingClientRect().width}px`; // list only

		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.width = `${target.getBoundingClientRect().width}px`;
		target.style.position = 'absolute';
		target.style.left = `${dragStartData.targetStartX + deltaX}px`;
		target.style.top = `${dragStartData.targetStartY + deltaY}px`;

		target.parentNode.replaceChild(placeholderContainerEl, target);
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

			if (currentItem === null)
				return;

			if (currentItem === placeholderContainerEl) {
				return;
			}

			const placeholderContainerElY = placeholderContainerEl.getBoundingClientRect().y;
			const currentItemY = currentItem.getBoundingClientRect().y;
			if (currentItemY < placeholderContainerElY) {
				parentList.insertBefore(placeholderContainerEl, currentItem);
			} else {
				parentList.insertBefore(currentItem, placeholderContainerEl);
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

	if (event.target.tagName === 'BUTTON')
		return;

	if (!dragStartData)
		return;

	const target = dragStartData.targetEl;
	placeholderContainerEl.parentNode.replaceChild(target, placeholderContainerEl);
	target.style.position = 'relative';
	target.style.left = '';
	target.style.top = '';
	target.style.width = '';
	dragStartData = null;
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

		}
		return;
	}

	// const target = event.target;

	// if (editing) {
	// 	editing = false;
	// 	editingTarget.children[0].textContent = editingTarget.children[1].children[0].value;
	// 	editingTarget.children[1].style.display = 'none';
	// 	editingTarget.children[0].style.display = 'block';
	// 	return;
	// }

	// if (target.tagName !== 'BUTTON')
	// 	return;

	// const inputEl = target.previousElementSibling;

	// if (target.classList.contains('add')) {
	// 	const nItem = newItem();
	// 	const parent = target.closest('.list');
	// 	parent.children[1].appendChild(nItem);
	// 	return;
	// }

	// if (target.classList.contains('new')) {
	// 	const nList = newList();
	// 	listsEl.appendChild(nList);
	// }
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
	const inputEl = document.createElement('input');
	newItemDiv.appendChild(inputEl);
	const newItemBtn = document.createElement('button');
	newItemBtn.textContent = 'Add';
	newItemBtn.className = 'add';
	newItemDiv.appendChild(newItemBtn);
	listDiv.appendChild(newItemDiv);
	listContainerEl.appendChild(listDiv);

	return listContainerEl;
}

function addItemHandler(event) {
	const parentList = event.currentTarget.closest('.list');
	parentList.children[1].appendChild(newItem());
}

function addListHandler(event) {
	const nList = newList();
	for (let i = 0; i < 10; i++) {
		nList.children[0].children[1].appendChild(newItem());
	}
	listsEl.appendChild(nList);
}

document.body.addEventListener('mousedown', mousedownHandler);
document.body.addEventListener('mousemove', mousemoveHandler);
document.body.addEventListener('mouseup', mouseupHandler);
document.body.addEventListener('click', mouseclickHandler);

for (let i = 0; i < 5; i++) {
	addListHandler();
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

document.body.appendChild(editingHelperContainer);

const listTitleEls = document.querySelectorAll('.list-header');
listTitleEls.forEach((el) => {
	el.addEventListener('click', (event) => {
		event.stopPropagation();
		editing = true;
		editingTarget = el;

		el.children[1].classList.remove('hide');
		el.children[0].classList.add('hide');

		editingHelper.textContent = el.children[0].firstElementChild.textContent;
		editingHelper.style.width = `${Math.ceil(el.children[1].firstElementChild.getBoundingClientRect().width)}px`;
		el.children[1].firstElementChild.style.height = `${Math.ceil(editingHelper.getBoundingClientRect().height)}px`;

		el.children[1].firstElementChild.addEventListener('input', (event) => {
			editingHelper.textContent = event.target.value;
			el.children[1].firstElementChild.style.height = `${Math.ceil(editingHelper.getBoundingClientRect().height)}px`;
		});
	});
});

document.body.addEventListener('keypress', (event) => {});