export class Store {
    constructor(reducer, initialState, storageKey) {
        this.storageKey = storageKey;
        console.log('Initial storage state', this.storageKey, localStorage.getItem(this.storageKey))
        this.state = JSON.parse(localStorage.getItem(this.storageKey), this.reviver ? (key, val) => this.reviver(key, val) : undefined) ?? initialState;
        this.listeners = [];
        this.reducer = reducer;
    }

    dispatch(action) {
        this.state = this.reducer(this.state, action);
        localStorage.setItem(this.storageKey, JSON.stringify(this.state, this.replacer ? (key, val) => this.replacer(key, val) : undefined));
        this.listeners.forEach((listener) => {
            if (listener.cleanup) {
                listener.cleanup();
            }
            listener.cleanup = listener.callback(this.state)
        })
    }

    use(callback) {
        const listener = {
            cleanup: callback(this.state),
            callback
        };
        this.listeners.push(listener);
        return () => this.listeners.filter((removeCandidate) => removeCandidate.callback !== callback);
    }
}