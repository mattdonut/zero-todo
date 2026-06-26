import { html, createElementWithAttrs, keyedList } from '../app/lib.js'
import { todoStore } from '../stores/todos.js'
import { TodoListEntryTag } from './TodoListEntry.js'
export const ActiveTodosTag = 'active-todos';

export class ActiveTodos extends HTMLElement {
    static observedAttributes = ['data-key'];
    constructor() {
        console.log('Constructing ActiveTodo')
        super();
        const template = html`
        <style>
            .active-todos {
                display: flex;
                flex-direction: column;
                gap: 0.3em;
            }
        </style>
            <div>
                <label id="root-label">
                    <!-- The label for the root todo -->
                </label>
                <div class="active-todos" id="todo-list">
                    <!-- Target for the active list of todos -->
                </div>
            </div>
        `;
        // Create a shadow root
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.appendChild(document.importNode(template.content, true));
        this.labelElement = this.shadow.getElementById('root-label');
        this.listElement = this.shadow.getElementById('todo-list');
    }

    init() {
        const key = this.dataset.key;
        const todoList = this.shadow.getElementById('todo-list');
        if (this.disconnect) {
            this.disconnect()
        }
        this.disconnect = todoStore.useTodo(key, (todo) => {
            this.renderTodo(todo);
        })
        if (this.listDisconnect) {
            this.listDisconnect()
        }
        this.listDisconnect = todoStore.useActiveFor(key, (keyList) => {
            this.renderDependencies(keyList);
        })
    }

    connectedCallback() {
        console.log('Active Todo Connected....')
        this.init();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.init();
    }

    disconnectedCallback() {
        if (this.disconnect) this.disconnect();
        if (this.listDisconnect) this.listDisconnect();
    }

    renderTodo(todo) {
        this.labelElement.textContent = todo.label;
    }

    renderDependencies(keyList) {
        keyedList(this.listElement, keyList, (key) => {
            return createElementWithAttrs(TodoListEntryTag, [['data-key', key]]);
        })
    }
}

customElements.define(ActiveTodosTag, ActiveTodos);