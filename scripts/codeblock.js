
function addCodeBlock(main, mEvt, isPreview) {
    const data = {
        content: `// Say hello\nconsole.log('Hello, world!');`
    }

    const block = document.createElement('div');

    block.classList.add('annotation');

    const menu = document.createElement('div');
    menu.classList.add('menu');

    const handle = document.createElement('div');
    handle.classList.add('handle');
    handle.innerHTML = '<i class="bi bi-grip-vertical"></i>';
    const runbutton = document.createElement('button');
    runbutton.classList.add('run');
    runbutton.innerHTML = '<i class="bi bi-play-fill"></i>';
    const resetbutton = document.createElement('button');
    resetbutton.classList.add('reset');
    resetbutton.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';
    const deletebutton = document.createElement('button');
    deletebutton.classList.add('delete');
    deletebutton.innerHTML = '<i class="bi bi-trash"></i>';
    deletebutton.addEventListener('click', () => {
        block.parentElement.removeChild(block);
    });

    menu.appendChild(runbutton);
    menu.appendChild(resetbutton);
    menu.appendChild(handle);
    menu.appendChild(deletebutton);


    const content = document.createElement('div');
    content.classList.add('content');

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    resizeHandle.innerHTML = '<i class="bi bi-arrow-down-right"></i>';
    const snippet = document.createElement('div');
    snippet.innerHTML = data.content;
    snippet.setAttribute('contenteditable', 'true');

    content.appendChild(snippet);
    content.appendChild(resizeHandle);

    const editor = ace.edit(snippet);
    editor.setTheme("ace/theme/gruvbox");
    editor.session.setMode("ace/mode/javascript");
    editor.setOptions({
        fontSize: "16px"
    });

    let isManuallyResized = false;
    const fixEditorSize = () => {
        if (isManuallyResized) return;
        const scrollHeight = snippet.querySelector('.ace_scrollbar-v').scrollHeight;
        const scrollWidth = snippet.querySelector('.ace_scrollbar-h').scrollWidth;
        if (!scrollHeight && !scrollWidth) return;
        if (scrollHeight) {
            content.style.height = scrollHeight + 34 + 'px';
        }
        if (scrollWidth) {
            content.style.width = scrollWidth + 52 + 'px'; console.log(scrollWidth);
        }
        editor.resize();
    }
    const saveContents = () => {
        data.content = editor.session.getValue();
    }
    snippet.addEventListener('keyup', () => {
        fixEditorSize();
        saveContents();
    });
    const minMenuHeight = 140;
    content.style.height = minMenuHeight + 1 + 'px';
    const fixMenuLayout = () => {
        if (content.scrollHeight < minMenuHeight) {
            block.style.flexDirection = 'column';
            menu.style.flexDirection = 'row';
            menu.style.setProperty('--padding', '3px 7px');
        } else {
            block.style.flexDirection = 'row';
            menu.style.flexDirection = 'column';
            menu.style.setProperty('--padding', '7px 5px');
        }
    }

    block.appendChild(menu);
    block.appendChild(content);
    main.appendChild(block);
    block.addEventListener('pointerdown', (evt)=>evt.stopPropagation());

    let down = false;
    let initial = {x: block.offsetLeft, y: block.offsetTop};
    let start;
    
    block.style.left = mEvt.offsetX - 10 + 'px';
    block.style.top = mEvt.offsetY - 20 + 'px';
    handle.addEventListener('pointerdown', (evt) => {
        down = true;
        start = {x: evt.clientX, y: evt.clientY};
        initial = {x: block.offsetLeft, y: block.offsetTop};
    });
    let rsDown = false;
    let rsInitial = {x: content.scrollWidth, y: content.scrollHeight};
    let rsStart;
    resizeHandle.addEventListener('pointerdown', (evt) => {
        rsDown = true;
        rsStart = {x: evt.clientX, y: evt.clientY};
        rsInitial = {x: content.scrollWidth, y: content.scrollHeight};
    });

    document.addEventListener('pointermove', (evt) => {
        if (down) {
            block.style.left = initial.x + evt.clientX - start.x + 'px';
            block.style.top = initial.y + evt.clientY - start.y + 'px';
        } else if (rsDown) {
            isManuallyResized = true;
            content.style.width = rsInitial.x + evt.clientX - rsStart.x + 'px';
            content.style.height = rsInitial.y + evt.clientY - rsStart.y + 'px';
            fixMenuLayout();
            editor.resize();
        }
    });
    document.addEventListener('pointerup', () => {
        down = false;
        rsDown = false;
    });

    return [data, block];
}

function addTextBlock(main, mEvt) {
    const data = {
        content: `This is a note`
    }

    const block = document.createElement('div');

    block.classList.add('annotation');

    const menu = document.createElement('div');
    menu.classList.add('menu');

    const handle = document.createElement('div');
    handle.classList.add('handle');
    handle.innerHTML = '<i class="bi bi-grip-vertical"></i>';
    const runbutton = document.createElement('button');
    runbutton.classList.add('run');
    runbutton.innerHTML = '<i class="bi bi-play-fill"></i>';
    const resetbutton = document.createElement('button');
    resetbutton.classList.add('reset');
    resetbutton.innerHTML = '<i class="bi bi-arrow-counterclockwise"></i>';
    const deletebutton = document.createElement('button');
    deletebutton.classList.add('delete');
    deletebutton.innerHTML = '<i class="bi bi-trash"></i>';
    deletebutton.addEventListener('click', () => {
        block.parentElement.removeChild(block);
    });

    menu.appendChild(runbutton);
    menu.appendChild(resetbutton);
    menu.appendChild(handle);
    menu.appendChild(deletebutton);


    const content = document.createElement('div');
    content.classList.add('content');

    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle');
    resizeHandle.innerHTML = '<i class="bi bi-arrow-down-right"></i>';
    const snippet = document.createElement('div');
    snippet.innerHTML = data.content;
    snippet.setAttribute('contenteditable', 'true');
    snippet.classList.add('textbox');

    content.appendChild(snippet);
    content.appendChild(resizeHandle);
    
    const saveContents = () => {
        data.content = snippet.innerHTML;
    }
    snippet.addEventListener('keyup', () => {
        saveContents();
    });
    const minMenuHeight = 140;
    content.style.height = minMenuHeight + 1 + 'px';
    const fixMenuLayout = () => {
        if (content.scrollHeight < minMenuHeight) {
            block.style.flexDirection = 'column';
            menu.style.flexDirection = 'row';
            menu.style.setProperty('--padding', '3px 7px');
        } else {
            block.style.flexDirection = 'row';
            menu.style.flexDirection = 'column';
            menu.style.setProperty('--padding', '7px 5px');
        }
    }

    block.appendChild(menu);
    block.appendChild(content);
    main.appendChild(block);
    block.addEventListener('pointerdown', (evt)=>evt.stopPropagation());

    let down = false;
    let initial = {x: block.offsetLeft, y: block.offsetTop};
    let start;
    
    block.style.left = mEvt.offsetX - 10 + 'px';
    block.style.top = mEvt.offsetY - 20 + 'px';
    handle.addEventListener('pointerdown', (evt) => {
        down = true;
        start = {x: evt.clientX, y: evt.clientY};
        initial = {x: block.offsetLeft, y: block.offsetTop};
    });
    let rsDown = false;
    let rsInitial = {x: content.scrollWidth, y: content.scrollHeight};
    let rsStart;
    resizeHandle.addEventListener('pointerdown', (evt) => {
        rsDown = true;
        rsStart = {x: evt.clientX, y: evt.clientY};
        rsInitial = {x: content.scrollWidth, y: content.scrollHeight};
    });

    document.addEventListener('pointermove', (evt) => {
        if (down) {
            block.style.left = initial.x + evt.clientX - start.x + 'px';
            block.style.top = initial.y + evt.clientY - start.y + 'px';
        } else if (rsDown) {
            isManuallyResized = true;
            content.style.width = rsInitial.x + evt.clientX - rsStart.x + 'px';
            content.style.height = rsInitial.y + evt.clientY - rsStart.y + 'px';
            fixMenuLayout();
        }
    });
    document.addEventListener('pointerup', () => {
        down = false;
        rsDown = false;
    });

    return [data, block];
}