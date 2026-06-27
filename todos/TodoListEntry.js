import { html } from '../app/lib.js'
import { todoStore } from '../stores/todos.js'
export const TodoListEntryTag = 'todo-list-entry';

export class TodoListItem extends HTMLElement {
    static observedAttributes = ['data-key'];
    constructor() {
        super();
        const template = html`
            <style>
                .todo-list-item {
                    display: flex;
                    padding: 8px;
                    height: 2em;
                    background-color: #333;
                    border-radius: 8px;
                    gap: 8px;
                }
                .todo-list-item.done {
                    color: #888;
                    background-color: #111;
                }
                .todo-list-item > * {
                    align-self: center;
                }
                .todo-list-item:hover {
                    background-color: #444;
                }
                .todo-description {
                    flex: 3 3 100px;
                }
                .todo-label {
                    flex: 1 1 100px;
                }
            </style>
            <div id="list-item" class="todo-list-item">
                <span class="todo-label" id="todo-label"></span>
                <span class="todo-description" id="todo-description"></span>
            </div>
        `;
        // Create a shadow root
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.appendChild(document.importNode(template.content, true));
    }

    renderTodo(todo) {
        this.shadow.getElementById('todo-label').textContent = todo.label;
        this.shadow.getElementById('todo-description').textContent = todo.description;
        if (todo.done) {
            this.shadow.getElementById('list-item').classList.add('done')
        }
        const listItem = this.shadow.getElementById('list-item')
        listItem.setAttribute('title', todo.description)
        listItem.addEventListener('click', (ev) => {
            window.location = `details.html#${todo.key}`;
        });
    }

    connectedCallback() {

    }
    disconnectedCallback() {
        if (this.disconnect) {
            this.disconnect();
        }
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (this.disconnect) {
            this.disconnect()
        }
        this.disconnect = todoStore.useTodo(this.dataset.key, (todo) => {
            this.renderTodo(todo);
        })
    }
}

customElements.define(TodoListEntryTag, TodoListItem);