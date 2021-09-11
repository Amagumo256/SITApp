export class IdedSet extends Set {
    constructor(arg) {
        super(arg);
    }

    toJSON() {
        return [...this].reduce((p, v) => {
            p.push(v.inShort());
            return p;
        }, []);
    }
}

export class IdedMap extends Map {
    constructor(arg = []) {
        const lastId = arg.reduce((p, [id, d]) => Math.max(p, d.id), 0);
        super(arg);
        this.lastId = lastId;

        for (let [i, data] of arg) {
            this.initAdd(data);
        }
    }

    toJSON() {
        const res = [{
            type: "MetaData",
            lastId: this.lastId
        }];
        for (let [id, d] of this.entries()) {
            res.push(d);
        }
        return res;
    }

    //constructor: 型が明確なものの場合使われる。
    //create: 新しくインスタンスを作成(or すでに作成済みなら、作成済みのインスタンスを返す)
    //from: 作成済みのインスタンスを用いて
    static from(data) {
        const res = new IdedMap();
        let lastId = 0;
        for (let d of data) {
            if (d == null) continue;
            if (d.type === "MetaData") {
                lastId = d.lastId;
            } else {
                res.set(d.id, IdedData.from(d));
            }
        }
        res.lastId = lastId;
        return res;
    }

    initAdd(data, prevData) {
        this.addToIndexes(data, prevData);
        this.addToSelect(data, prevData);
    }

    initRemove() {

    }

    add(data) {
        data.id = ++this.lastId;
        this.set(this.lastId, data);
        this.initAdd(data);
        return this;
    }

    set(id, data) {
        if (arguments.length === 1) {
            data = id;
            id = data.id;
        }
        if (id == null) return this.add(data);
        
        const prevData = this.get(id);
        this.Mapset(id, data);
        this.lastId = Math.max(this.lastId, id);
        this.initAdd(data, prevData);
        return this;
    }    

    createIndex(...columns) {
        const columnIndex = new Map(),
            columnString = columns.join("-.nextcolumn.->");
        this.indexes.set(columnString, columnIndex);

        for (let data of this.values()) {
            this.addToIndex(data, columnString, columnIndex);
        }
        return columnIndex;
    }

    addToIndexes(data) {
        for (let [columnString, columnIndex] of this.indexes) {
            this.addToIndex(data, columnString, columnIndex);
        }
    }

    addToIndex(data, columnString, columnIndex) {
        const value = arrayCrawl(data, columnString.split("-.nextcolumn.->"));
        if (!columnIndex.has(value)) {
            columnIndex.set(value, new Set());
        }
        columnIndex.get(value).add(data);
    }

    select(tag, func) {
        if (func == null && typeof tag == "function") {
            func = tag;
        }
        const list = new IdedMap();
        for (let [id, data] of this) {
            if (func(data)) list.set(id, data);
        }
        this.selects.set(tag, { func, list });
        return list;
    }

    addToSelect(data) {
        for (let [selectTag, {func, list}] of this.selects) {
            if (func(data)) list.set(data);
        }
    }

    /**
     * 
     * @param {* | function} value 
     * @param  {...string} columns 
     * @returns {Set} columnsが指定されていた場合
     * @returns {*} columnsが指定されていない場合
     */
    get(value, ...columns) {
        if (columns.length === 0) {
            return this.Mapget(value);
        }
        if (typeof value === "function") {
            const searchFunc = value,
                res = new Set();
            for (let [id, d] of this.entries()) {
                if (searchFunc(arrayCrawl(d, columns))) {
                    res.add(d);
                }
            }
            return res;
        } else {
            if (this.indexes.has(columns.join("-,-"))) {
                return this.indexes.get(column).get(value) || new Set();
            } else {
                const res = new Set();
                for (let [id, d] of this.entries()) {
                    if (arrayCrawl(d, columns) === value) {
                        res.add(d);
                    }
                }
                return res;
            }
        }
    }

    indexes = new Map();
    selects = new Map();
}

IdedMap.prototype.Mapget = Map.prototype.get;
IdedMap.prototype.Mapset = Map.prototype.set;


function arrayCrawl(arr, props = []) {
    if (props.length === 0) return arr;
    if (props.length === 1) {
        return arr[props[0]];
    } else {
        return arrayCrawl(arr[props[0]], props.slice(1));
    }
}

export default class IdedData {
    constructor(data = {}) {
        this.id = data.id;
        this.type = data.type;

        if (IdedData.instances.has(this.type)) {
            IdedData.instances.get(this.type).set(this.id, this);
        }
    }
    
    toJSON() {
        return Object.entries(this).reduce((p, [k, v]) => {p[k] = typeof v === "object" && "inShort" in v ? v.inShort() : v; return p}, {});
    }

    inShort() {
        return {
            type: this.type,
            id: this.id
        }
    }

    static instances = new IdedMap();
    static Constructors = new IdedMap();

    //typeがごっちゃな場合、ここから作成可能。というか基本的にここから作成でもいいのでは。
    //(作成時点でtypeが明確にわかってる場合はこれではなくnew Faculty()など明示した形式をとる)
    static create(data) {
        if (data.type === "MetaData") return null;
        const instances = IdedData.instances.get(data.type);
        if (instances.has(data.id)) return instances.get(data.id);
        return new (IdedData.Constructors.get(data.type))(data);
    }

    static from(shortData) {
        let instances = IdedData.instances.get(shortData.type);

        if (instances == null) throw new Error("Error: IdedData.type is invalid : " + JSON.stringify(shortData) + "\n instances:" + instances);

        return instances.get(shortData.id);
    }
}

IdedData.defineClass = function defineClass(className, Constructor) {
    const list = new IdedMap();
    IdedData.instances.set(className, list);
    IdedData.Constructors.set(className, Constructor);
    return list;
}


// toJSON() {
//     return Object.entries(this).reduce((p, [k, v]) => {p[k] = typeof v === "object" && "inShort" in v ? v.inShort() : v; return p}, {});
// }

// inShort() {
//     return {
//         type: this.type,
//         id: this.id
//     }
// }