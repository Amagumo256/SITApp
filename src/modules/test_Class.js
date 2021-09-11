const PRIVATE = Symbol("private properties");

export default class MyClass {
    constructor() {
        this[PRIVATE] = {};

        this[PRIVATE].data = {};
    }

    set data(data) {
        this[PRIVATE].data = data;
    }

    get data() {
        return this[PRIVATE].data;
    }
}

for (let key of Object.keys(new MyClass())) {
    console.log(key);
}