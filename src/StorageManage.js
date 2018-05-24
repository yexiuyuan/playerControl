class Storage {
    static get(name) {
        return JSON.parse(localStorage.getItem(name))
    }
    static set(name, val) {
        localStorage.setItem(name, JSON.stringify(val))
    }
    static add(name, addVal) {
        let oldVal = Storage.get(name)
        let newVal = Object.assign(oldVal, addVal);
        Storage.set(name, newVal)
    }
}

export default Storage;