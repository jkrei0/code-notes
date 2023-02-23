
function addCodeBlock(main, mEvt, isPreview) {
    const data = {
        content: `// Say hello\nconsole.log('Hello, world!');`
    }

    const block = document.createElement('div');

    block.classList.add('annotation');
    block.classList.add('code');

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

function addTextBlock(main, mEvt, isHeading) {
    const data = {
        type: 'text',
        is: isHeading ? 'heading' : 'text',
        content: `Text`,
        position: {x: mEvt.offsetX - 10, y: mEvt.offsetY - 20},
        size: {x: 300, y: isHeading ? 65 : 140}
    }

    const block = document.createElement('div');

    block.classList.add('annotation');
    block.classList.add('text');

    const menu = document.createElement('div');
    menu.classList.add('menu');

    const handle = document.createElement('div');
    handle.classList.add('handle');
    handle.innerHTML = '<i class="bi bi-grip-vertical"></i>';
    const deletebutton = document.createElement('button');
    deletebutton.classList.add('delete');
    deletebutton.innerHTML = '<i class="bi bi-trash"></i>';
    deletebutton.addEventListener('click', () => {
        block.parentElement.removeChild(block);
    });

    menu.appendChild(handle);
    menu.appendChild(deletebutton);


    const content = data.is === 'heading' ? document.createElement('h1') : document.createElement('div');
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

    const fixEditorSize = () => {
        const box = snippet.getBoundingClientRect();
        const scrollHeight = snippet.scrollHeight - box.height;
        const scrollWidth = snippet.scrollWidth - box.width;
        if (scrollHeight > 0) {
            content.style.height = snippet.scrollHeight + 30 + 'px';
        }
        if (scrollWidth > 0) {
            content.style.width = snippet.scrollWidth + 30 + 'px';
        }
        const newbox = snippet.getBoundingClientRect();
        data.size.x = newbox.width;
        data.size.y = newbox.height;
    }
    const saveContents = () => {
        data.content = snippet.innerHTML;
    }
    snippet.addEventListener('keyup', () => {
        saveContents();
        fixEditorSize();
    });
    const minMenuHeight = data.is === 'heading' ? 65 : 140;
    content.style.width = data.size.x + 'px';
    content.style.height = data.size.y + 'px';
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
    
    block.style.left = data.position.x + 'px';
    block.style.top = data.position.y + 'px';
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
        block.classList.add('focused');
        rsStart = {x: evt.clientX, y: evt.clientY};
        rsInitial = {x: content.scrollWidth, y: content.scrollHeight};
    });

    document.addEventListener('pointermove', (evt) => {
        if (down) {
            block.style.left = initial.x + evt.clientX - start.x + 'px';
            block.style.top = initial.y + evt.clientY - start.y + 'px';
            data.position.x = block.style.left;
            data.position.y = block.style.top;
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
        fixEditorSize(); // Make sure all the text is still visible
        block.classList.remove('focused');
    });

    return [data, block];
}