class TodoList {
    constructor(selectorsIds = {}) {
        this.list = document.getElementById(selectorsIds.list) || document.getElementById('todo-list');
        this.addButton = document.getElementById(selectorsIds.addButton) || document.getElementById('todo-add');
        this.items = [];
        this.loadList();
        this.attachListeners();
    }

    attachListeners() {
        this.addButton.addEventListener('click', () => {
            this.addItemNode();
        });

        document.addEventListener('focusout', (event) => {
            if (event.target && event.target.classList.contains('todo-text')) {
                this.saveItem(event.target);
            }
        });

        document.addEventListener('click', (event) => {
            if (event.target && event.target.classList.contains('todo-text')) {
                this.editItem(event.target);
            }

            if (event.target && event.target.classList.contains('todo-delete')) {
                this.removeItem(event.target.parentNode.parentNode);
            }

            if (event.target && event.target.classList.contains('todo-status')) {
                this.toggleItemStatus(event.target);
            }
        });
    }

    toggleItemStatus(checkbox) {
        const itemNode = checkbox.parentNode.parentNode.parentNode;
        const itemIndex = this.items.findIndex((item => item.id == itemNode.getAttribute('id')));

        if (itemNode.classList.contains('todo-done')) {
            itemNode.classList.remove('todo-done');
            checkbox.setAttribute('checked', false);

            this.items[itemIndex].done = false;
        }
        else {
            itemNode.classList.add('todo-done');
            checkbox.setAttribute('checked', true);

            this.items[itemIndex].done = true;
        }

        this.storeList();
    }

    removeItem(itemNode) {
        this.items = this.items.filter((item) => {
            return item.id !== itemNode.getAttribute('id');
        });

        this.storeList();
        itemNode.remove();
    }

    editItem(input) {
        // this.toggleFocus(input, true);
    }

    addItemNode() {
        const node = TodoItem.buildNode();
        this.list.append(node);

        node.classList.add('editable');
        node.querySelector('.todo-text').focus();
    }

    saveItem(input) {
        const itemNode = input.parentNode.parentNode;

        if (input.value.length < 3) {
            itemNode.remove();
            this.removeItem(itemNode);
            return;
        }

        const itemIndex = this.items.findIndex((item => item.id == itemNode.getAttribute('id')));

        if (itemIndex >= 0) {
            this.items[itemIndex].name = input.value;
        }
        else {
            this.items.push(new TodoItem(itemNode.getAttribute('id'), input.value, null, []));
        }

        this.storeList();
    }

    loadList() {
        this.items = JSON.parse(localStorage.getItem('todoList')) || [];
        this.constructNodes();
    }

    storeList() {
        localStorage.setItem('todoList', JSON.stringify(this.items));
    }

    constructNodes() {
        for (let item of this.items) {
            let node = TodoItem.buildNode();
            node = TodoItem.setNodeData(node, item.name);
            node.setAttribute('id', item.id);

            if (item.done) {
                node.classList.add('todo-done');
                node.querySelector('input[type="checkbox"]').setAttribute('checked', true);
            }

            this.list.append(node);
        }
    }
}

class TodoItem {
    constructor(id, name, date, labels) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.labels = labels;
        this.done = false;
    }

    static generateUid() {
        return Math.random().toString(36).slice(-6) + '-' + Math.random().toString(36).slice(-6);
    }

    static buildNode() {
        let li = document.createElement('li');
        li.classList.add('mdc-list-item');
        li.setAttribute('id', TodoItem.generateUid());
        li.setAttribute('role', 'checkbox');
        li.innerHTML = TodoItem.getNodeTemplate().trim();

        return li;
    }

    static setNodeData(node, name, date = null, labels = []) {
        const input = node.querySelector('.todo-text'),
            label = node.querySelector('.todo-label');

        input.value = name;

        return node;
    }

    static getNodeTemplate() {
        return `<span class="mdc-list-item__ripple"></span>
    <span class="mdc-list-item__graphic">
      <div class="mdc-checkbox">
        <input type="checkbox"
                class="mdc-checkbox__native-control todo-status" />
        <div class="mdc-checkbox__background">
          <svg class="mdc-checkbox__checkmark"
                viewBox="0 0 24 24">
            <path class="mdc-checkbox__checkmark-path"
                  fill="none"
                  d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
          </svg>
          <div class="mdc-checkbox__mixedmark"></div>
        </div>
      </div>
    </span>
    <div class="mdc-text-field text-field mdc-text-field--fullwidth mdc-text-field--no-label mdc-ripple-upgraded todo-input"
                style="--mdc-ripple-fg-size:720px; --mdc-ripple-fg-scale:1.68237; --mdc-ripple-fg-translate-start:-290.5px, -316px; --mdc-ripple-fg-translate-end:240px, -332px;">
                <input type="text" placeholder="Write your todo here..." class="mdc-text-field__input todo-text"
                    aria-label="">
            </div>
    <span class="mdc-list-item__meta">
      <button class="mdc-icon-button material-icons todo-delete">delete</button>
    </span>
  `;
    }
}