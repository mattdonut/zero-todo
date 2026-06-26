import { Store } from './store.js';

export const TODO_SCALE = {
    MINUTES: 'MINUTES',
    HOURS: 'HOURS',
    DAYS: 'DAYS',
    MONTHS: 'MONTHS',
    YEARS: 'YEARS',
    ALWAYS: 'ALWAYS',
    NEVER: 'NEVER',
}

export const KIND = {
    WORKING: 'WORKING',
    WAITING: 'WAITING'
}

export const ACTIONS = {
    ADD_TODO: 'ADD_TODO',
    REMOVE_TODO: 'REMOVE_TODO',
    UPDATE_TODO: 'UPDATE_TODO',
    ADD_DEPENDENCY: 'ADD_DEPENDENCY',
}

export const storageKey = 'TODO_STORAGE_KEY';

function todoKey(index) {
    return `todo::${index}`;
}

function keyIndex(key) {
    return +key.split('::')[1];
}

class TodoStore extends Store {
    constructor() {
        super((state, { type, payload }) => {
            switch (type) {
                case ACTIONS.ADD_TODO:
                case ACTIONS.UPDATE_TODO:
                    return state.set(payload.key, payload);
                case ACTIONS.REMOVE_TODO:
                    return state.delete(payload);
                case ACTIONS.ADD_DEPENDENCY: {
                    const superTodo = state.get(payload.superKey)
                    const subTodo = state.get(payload.subKey)
                    if (!superTodo || !subTodo) return state;
                    state.set(payload.superKey, { ...superTodo, dependencies: superTodo.dependencies.concat([payload.subKey]) });
                    this.setRoot(state, superTodo.root, payload.subKey);
                    return state;
                }
            }
        }, new Map(), storageKey)
        this.lastKeyIndex = Math.max(0, ...this.state.values().map((todo) => keyIndex(todo.key)));
    }

    replacer(key, value) {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
        } else {
            return value;
        }
    }

    reviver(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }

    createTodo(label, description, scale, kind = KIND.WORKING, dependencies = []) {
        this.lastKeyIndex = this.lastKeyIndex + 1;

        return {
            key: todoKey(this.lastKeyIndex),
            label,
            description,
            scale,
            kind,
            dependencies,
            root: todoKey(this.lastKeyIndex),
        }
    }

    addTodo(label, scale, description) {
        const newThing = this.createTodo(label, description, scale)
        this.dispatch({ type: ACTIONS.ADD_TODO, payload: newThing });
        return newThing;
    }

    createDependency(superKey, subKey) {
        this.dispatch({ type: ACTIONS.ADD_DEPENDENCY, payload: { superKey, subKey } })
    }

    useTodo(key, cb) {
        let prev = null;
        return this.use((state) => {
            const todo = state.get(key)
            if (prev !== todo) {
                cb(todo)
                prev = todo;
            }
        })
    }

    isDone(key) {
        const todo = this.state.get(key);
        return todo.dependencies.every((subkey) => this.isDone(subkey)) && todo.done
    }

    getRoots() {
        return this._getRoots(this.state);
    }

    _getRoots(state) {
        return state.values().filter((todo) => todo.key === todo.root).map((todo) => todo.key).toArray();
    }

    getActive(key) {
        const todo = this.state.get(key);
        const subactive = todo.dependencies.map((subkey) => this.getActive(subkey)).flat()
        if (subactive.length > 0) {
            return subactive;
        }
        return todo.done ? [] : [todo.key]
    }

    useActiveFor(key, listener) {
        let prev = null;
        return this.use((state) => {
            const newActive = new Set(this.getActive(key))
            if (!prev) {
                prev = [...newActive];
                listener(prev);
            }
            else {
                const prevSet = new Set(prev)
                if (!prevSet.isSubsetOf(newActive) || !newActive.isSubsetOf(prevSet)) {
                    prev = [...newActive]
                    listener(prev);
                }
            }
        })

    }

    useActive(listener) {
        let prev = null;
        return this.use((state) => {
            const roots = this._getRoots(state)
            const newActive = new Set(roots.map((rootKey) => this.getActive(rootKey)).flat())
            if (!prev) {
                prev = [...newActive];
                listener(prev);
            }
            else {
                const prevSet = new Set(prev)
                if (!prevSet.isSubsetOf(newActive) || !newActive.isSubsetOf(prevSet)) {
                    prev = [...newActive]
                    listener(prev);
                }
            }
        })
    }

    useRoots(listener) {
        let prev = null;
        return this.use((state) => {
            const newRoots = new Set(state.values().filter((todo) => todo.key === todo.root).map((todo) => todo.key))
            console.log('New Roots', newRoots, prev);
            if (!prev) {
                console.log('First time')
                prev = [...newRoots];
                return listener(prev);
            }
            else {
                const prevSet = new Set(prev)
                console.log('Sets', prevSet, newRoots)
                if (!prevSet.isSubsetOf(newRoots) || !newRoots.isSubsetOf(prevSet)) {
                    prev = [...newRoots]
                    return listener(prev);
                }
            }
        })
    }

    setRoot(state, root, key) {
        const todo = state.get(key);
        state.set(key, { ...todo, root })
        todo.dependencies.forEach((subKey) => this.setRoot(state, rootKey, subKey))
    }

    toggleDone(key) {
        const prev = this.state.get(key)
        const payload = { ...prev, done: !prev.done };
        this.dispatch({ type: ACTIONS.UPDATE_TODO, payload })
    }

    removeTodo(key) {
        this.dispatch({ type: ACTIONS.REMOVE_TODO, payload: key });
    }
}

export const todoStore = new TodoStore();