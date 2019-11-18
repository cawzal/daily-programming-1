const placeholderEl = document.createElement('div');
placeholderEl.textContent = 'PLACEHOLDER';
placeholderEl.className = 'placeholder-el item';

const itemEls = document.querySelectorAll('.item');
const listEls = document.querySelectorAll('.list-items');
const listsEls = document.querySelectorAll('.list');

let dragStartData = null;

function mousedownHandler(event) {
	event.preventDefault();

	if (dragStartData)
		return;

	const target = event.target;

	dragStartData = {
		targetEl: target,
		targetStartX: target.getBoundingClientRect().x,
		targetStartY: target.getBoundingClientRect().y,
		mouseStartX: event.clientX,
		mouseStartY: event.clientY,
		dragType: target.classList.contains('item') ? 'item' : 'list',
	};

	if (dragStartData.type === 'item') {
		placeholderEl.style.height = `${target.getBoundingClientRect().height}px`;

		const deltaX = event.clientX - dragStartData.mouseStartX;
		const deltaY = event.clientY - dragStartData.mouseStartY;
		target.style.width = `${target.getBoundingClientRect().width}px`;
		target.style.position = 'absolute';
		target.style.left = `${dragStartData.targetStartX + deltaX}px`;
		target.style.top = `${dragStartData.targetStartY + deltaY}px`;

		target.parentNode.replaceChild(placeholderEl, target);
		document.body.appendChild(target);
	}
}

function mousemoveHandler(event) {
	event.preventDefault();

	if (!dragStartData)
		return;

	const target = dragStartData.targetEl;

	const deltaX = event.clientX - dragStartData.mouseStartX;
	const deltaY = event.clientY - dragStartData.mouseStartY;
	target.style.left = `${dragStartData.targetStartX + deltaX}px`;
	target.style.top = `${dragStartData.targetStartY + deltaY}px`;

	let parentList = null;
	listEls.forEach((el) => {
		const left = el.getBoundingClientRect().x;
		const width = el.getBoundingClientRect().width;
		if ((left <= event.clientX) && (event.clientX <= left + width)) {
			parentList = el;
		}
	});

	if (parentList === null)
		return;

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
	console.log(placeholderEl.parentNode);
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
		if (event.clientY < (parentList.firstElementChild.getBoundingClientRect().y + parentList.firstElementChild.getBoundingClientRect().height)) {
			parentList.insertBefore(placeholderEl, parentList.firstElementChild);
		} else {
			parentList.appendChild(placeholderEl);
		}
		return;
	}

	parentList.insertBefore(placeholderEl, currentItem);
}

function mouseupHandler(event) {
	event.preventDefault();

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

itemEls.forEach((el) => {
	el.addEventListener('mousedown', mousedownHandler);
});

listsEls.forEach((el) => {
	el.addEventListener('mousedown', mousedownHandler);
});

document.body.addEventListener('mousemove', mousemoveHandler);
document.addEventListener('mouseup', mouseupHandler);