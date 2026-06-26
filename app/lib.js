export async function loadTemplate(path, base) {
    const templateInner = await fetch(new URL(path, base)).then((response) => response.text());
    const template = document.createElement('template')
    template.innerHTML = templateInner;
    return template;
}

const myStringPolicy = trustedTypes.createPolicy('my-local', {
    createHTML: (string) => string,
});

export function html(strings, ...values) {
    const inner = strings.reduce((acc, part, i) => `${acc}${values[i - 1]}${part}`);
    const trusted = myStringPolicy.createHTML(inner);
    const template = document.createElement('template');
    template.innerHTML = inner;
    return template;
};

export function createElementWithAttrs(tagName, attrs) {
    const ele = document.createElement(tagName);
    attrs.forEach(([attr, val]) => ele.setAttribute(attr, val));
    return ele;
}

export function keyedList(host, keyList, builder) {
    const lookup = Array.from(host.children).reduce((acc, ele) => {
        return { ...acc, [ele.dataset.key]: ele };
    }, {});
    const keyedBuilder = (key) => {
        const ele = builder(key);
        ele.setAttribute('data-key', key);
        return ele
    }
    const newChildren = keyList.map((key) => lookup[key] ?? keyedBuilder(key))
    host.replaceChildren(...newChildren);
}