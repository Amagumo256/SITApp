export default function $(...args) {
    if (args.length === 0) {

    }

    if (args.length === 1) {
        const arg = args[0];
        if (typeof arg === "string") {
            if (arg === "body") return createdList.get("body");
            if (arg.match(/\<.*\>/)) {
                const container = document.createElement("div");
                container.innerHTML = arg;
                return new MyDOMElement(container.children);
            } else {
                const elems = document.querySelectorAll(args);
                let ids = [];

                for (let elem of elems) {
                    if (!observedDOMElementIdList.list.has(elem)) {
                        observedDOMElementIdList.list.set(elem, ++observedDOMElementIdList.lastId);
                    }
                    ids.push(observedDOMElementIdList.list.get(elem));
                }
                
                const idString = JSON.stringify(ids.sort());
                if (!createdList.has(idString)) {
                    createdList.set(idString, new MyDOMElement(elems));
                }
                return createdList.get(idString);
            }
        }
        if (arg instanceof HTMLElement || arg instanceof Node) {
            const elem = arg;
            if (!observedDOMElementIdList.list.has(elem)) {
                observedDOMElementIdList.list.set(elem, ++observedDOMElementIdList.lastId);
            }
            const idString = JSON.stringify([observedDOMElementIdList.list.get(elem)]);
            if (!createdList.has(idString)) {
                createdList.set(idString, new MyDOMElement(elem));
            }
            return createdList.get(idString);
        }
    }
}

class MyDOMElement extends Array {
    constructor(elems) {
        super();
        if (elems instanceof NodeList || elems instanceof HTMLCollection) {
            this.push(...elems);
        } else {
            this.push(elems);
        }
    }

    children(query) {
        const $ret = new MyDOMElement();
        for (let thisElem of this) {
            $ret.push(...thisElemm.querySelectorAll(":scope>" + query));
        }
    }

    find(query) {
        const $ret = new MyDOMElement();
        for (let thisElem of this) {
            $ret.push(...thisElemm.querySelectorAll(query));
        }
    }

    append($elem = new MyDOMElement()) {
        for (let thisElem of this) {
            for (let elem of $elem) {
                thisElem.appendChild(elem);
            }
        }
        return this;
    }

    css(name, value) {
        for (let thisElem of this) {
            thisElem.style.setProperty(name, value);
        }
        return this;
    }

    text(text) {
        if (text == null) return this[0].textContent;
        for (let thisElem of this) {
            thisElem.textContent = text;
        }
        return this;
    }

    html(html) {
        for (let thisElem of this) {
            thieElem.innerHTML = html;
        }
        return this;
    }
}


const observedDOMElementIdList = {
    list: new Map([["body", document.body]]),
    lastId: 0
}, createdList = new Map([
    ["body", new MyDOMElement(document.body)]
]);