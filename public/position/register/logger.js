const LL_STATES = {
    'LOADING': 'loading',
    'SUCCESS': 'success',
    'ERROR': 'error',
}

class LoggerLine {
    constructor(logger, {text, state}) {
        this.element = document.createElement('li');
        this.element.classList.add('logger-line')

        this.logger = logger;

        this.data = {
            text,
            state
        }

        return this.init();
    }

    init() {
        this.logger.container.appendChild(this.element)
        this.update(this.data);
        return this;
    }

    update({text, state}) {
        if(text) {
            this.data.text = text;
            this.element.innerText = this.data.text;
        }
        if(state) {
            this.data.state = state
            this.element.dataset.state = this.data.state;
        }
        return this;
    }

    getElement() {
        return this.element
    }
}

class Logger {
    constructor(container) {
        this.container = container;
        this.lines = [];
    }

    log(lineParams) {
        let line = new LoggerLine(this, lineParams)
        this.lines.push(line)
    }

    getLast() {
        return this.lines[this.lines.length-1];
    }
}