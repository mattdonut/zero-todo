import { html } from '../app/lib.js'
import { todoStore } from '../stores/todos.js'
export const NewTodoFormTag = 'new-todo-form';
export const NewTodoEvent = 'new-todo-event';

export class NewTodoForm extends HTMLElement {
    constructor() {
        super();
        const template = html`
            <style>
                input {
                    flex: 1 1 auto;
                }
                select, select option {
                    flex: 0 1 auto;
                }
                input,
                select,
                select option {
                    font-size: large;
                    height: 2em;
                    background-color: var(--main-body-color);
                    color: lightgray;
                    border-color: lightgray;
                    border-radius: 0.5em;
                }
                .form-row {
                    display: flex;
                    align-content: space-between;
                    margin-top: 0.5em;
                    gap: 0.5em;
                }
            </style>
            <form id="todo-adder">
                <div class="form-row">
                    <select id="scale-select">
                        <option value="MINUTES" label="Minutes" />
                        <option value="HOURS" label="Hours" />
                        <option value="DAYS" label="Days" />
                        <option value="WEEKS" label="Weeks" />
                    </select>
                    <input id="adder-input" type="text" placeholder="Enter Task" />
                </div>
            </form>
        `;
        // Create a shadow root
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.appendChild(document.importNode(template.content, true));
    }

    connectedCallback() {
        const scaleSelect = this.shadow.getElementById('scale-select');
        const adderForm = this.shadow.getElementById('todo-adder');
        const adderFormInput = this.shadow.getElementById('adder-input');
        // Hook up our input form
        const adder = adderForm.addEventListener('submit', (ev) => {
            this.dispatchEvent(new CustomEvent(NewTodoEvent, {
                bubbles: true,
                detail: {
                    label: adderFormInput.value,
                    scale: scaleSelect.value,
                },
            }))
            adderFormInput.value = ''
            ev.preventDefault();
        })

    }
}

customElements.define(NewTodoFormTag, NewTodoForm);