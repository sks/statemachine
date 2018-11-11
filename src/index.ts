import './style/main.scss';

function component() {
    let element = document.createElement('div');

    element.innerHTML = 'Hello world';
    element.classList.add('hello');

    return element;
}

document.body.appendChild(component());
