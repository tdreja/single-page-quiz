interface Changes<KEY> {
    readonly toDelete: Array<Element>;
    readonly toUpdate: Map<KEY, Element>;
    readonly toCreate: Array<KEY>;
    template: Element | null;
}

function checkElementForChanges<KEY, VALUE>(
    attribute: string,
    map: Map<KEY, VALUE>,
    item: Element,
    changes: Changes<KEY>
) {
    const attributeValue = item.getAttribute(attribute);
    if (!attributeValue) {
        changes.toDelete.push(item);
        return;
    }

    // Treat template special
    if (attributeValue === 'template') {
        changes.template = item;
        return;
    }

    // Only update the given KEY once!
    const key: KEY = attributeValue as KEY;
    if (map.has(key) && !changes.toUpdate.has(key)) {
        changes.toUpdate.set(key, item);
        return;
    }

    // Unused or duplicate instances are deleted!
    changes.toDelete.push(item);
}

function checkRequiredChanges<KEY,VALUE>(
    html: Element, 
    attribute: string,
    map: Map<KEY, VALUE>
): Changes<KEY> {
    // Find all changes
    const changes: Changes<KEY> = {
        toDelete: [],
        toCreate: [],
        toUpdate: new Map(),
        template: null,
    };
    html.querySelectorAll(`[${attribute}]`).forEach((item) =>
        checkElementForChanges(attribute, map, item, changes)
    );
    map.forEach((_, key) => {
        if(!changes.toUpdate.has(key)) {
            changes.toCreate.push(key);
        }
    });

    return changes;
}

function updateElement<KEY,VALUE>(
    key: KEY,
    element: Element,
    map: Map<KEY,VALUE>,
    updater: (html: Element, key: KEY, value: VALUE, newElement: boolean) => void,
    newElement: boolean) {
    const value = map.get(key);
    if(!value) {
        return;
    }
    updater(element, key, value, newElement);
}

export function updateFromMap<KEY, VALUE>(
    html: Element,
    attribute: string,
    map: Map<KEY, VALUE>,
    updater: (html: Element, key: KEY, value: VALUE, newElement: boolean) => void
) {
    // Find all changes
    const changes: Changes<KEY> = checkRequiredChanges(html, attribute, map);
    const template = changes.template;
    if(!template) {
        console.warn('No template found!', html);
        return;
    }
    console.log('changes for', map, 'changes:', changes);

    // Delete unused first
    for(const item of changes.toDelete) {
        if(item.parentNode) {
            item.parentNode.removeChild(item);
        }
    }

    // Update existing next
    changes.toUpdate.forEach((item,key) => updateElement(key, item, map, updater, false));

    // Create the missing ones
    for(const key of changes.toCreate) {
        const element = template.cloneNode(true) as Element;
        element.setAttribute(attribute, `${key}`);
        html.appendChild(element);
        updateElement(key, element, map, updater, true);
    }
}

export function getPart(html: Element, partName: string | null): Element | null {
    if(partName) {
        const atElement = html.getAttribute("part");
        if(atElement === partName) {
            return html;
        }
        return html.querySelector(`[part=${partName}]`);
    }
    return html;
}

export function updatePartInnerHtml(html: Element, partName: string | null, innerHtml: string) {
    const part = getPart(html, partName);
    if(part) {
        part.innerHTML = innerHtml;
    }
}

export function updateAttributeAtPart(
    html: Element,
    partName: string | null,
    attributeName: string,
    value: string | null | undefined) {
    const part = getPart(html, partName);
    if(part) {
        if(value === null || value === undefined) {
            part.removeAttribute(attributeName);
        } else {
            part.setAttribute(attributeName, value);
        }
    }
}

export function updateStyleAtPart(html: Element, partName: string | null, className: string, active: boolean) {
    const part = getPart(html, partName);
    if(part) {
        if(active) {
            part.classList.add(className);
        } else {
            part.classList.remove(className);
        }
    }
}

export function addClickListenerToPart(html: Element, partName: string | null, listener: EventListener) {
    const part = getPart(html, partName);
    if(part) {
        part.addEventListener('click', listener);
    }
}