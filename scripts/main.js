
const main = document.querySelector('.editor-main');
const canvas = document.querySelector('#editor-canvas');
const ctx = canvas.getContext("2d");

const drawLine = (x, y, x2, y2, color = '#fff', weight = 2) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = weight;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

const fixCanvasSize = () => {
    canvas.removeAttribute('width');
    canvas.removeAttribute('height');
    canvas.style.height;
    const cnvBox = canvas.getBoundingClientRect();
    canvas.setAttribute('width', cnvBox.width);
    canvas.setAttribute('height', cnvBox.height);
}
fixCanvasSize();

const tools = {
    PEN: 1,
    CODE: 2,
    TEXT: 3,
    HEADING: 4,
    ERASER: 5,
    UNDO: 99,
    REDO: 98
}

let toolData = {
    activeTool: tools.PEN,
    currentColor: '#fff',
    isDrawingNow: false,
}
let drawingData = {
    lines: [],
    annotations: []
}
const drawingHistory = {
    index: 0,
    states: [],
    pushState: () => {
        drawingHistory.index = 0;
        drawingHistory.states.splice(0, 0, JSON.parse(JSON.stringify(drawingData)));
    },
    restoreState: () => {
        drawingData = JSON.parse(JSON.stringify(drawingHistory.states[drawingHistory.index]));
    },
    undo: () => {
        drawingHistory.index += 1;
        // bounds checking
        if (drawingHistory.index >= drawingHistory.states.length) {
            // over the end? Go back as to not create "empty" "slots"
            drawingHistory.index -= 1;
            return;
        }
        drawingHistory.restoreState();
    },
    redo: () => {
        drawingHistory.index -= 1;
        // bounds checking (stop, don't wrap)
        if (drawingHistory.index < 0) drawingHistory.index = 0;
        drawingHistory.restoreState();
    }
};

const draw = () => {
    requestAnimationFrame(draw);
    fixCanvasSize();
    for (const line of drawingData.lines) {
        for (let p = 1; p < line.points.length; p++) {
            const prev = line.points[p-1];
            const next = line.points[p];
            drawLine(prev.x, prev.y, next.x, next.y, line.color);
        }
    }
}
draw();

let lastMp;
const changeTool = () => {
    lastMp = undefined;
    const currentToolString = Object.keys(tools).find(key => tools[key] === toolData.activeTool);
    if (currentToolString === undefined) {
        throw 'Unknown tool';
    }
    main.setAttribute('data-active-tool', currentToolString);
    if (toolData.activeTool === tools.PEN
        || toolData.activeTool === tools.ERASER) {
        canvas.style.pointerEvents = 'all';
    } else {
        canvas.style.pointerEvents = '';
    }
}

const beginDrawing = () => {
    main.classList.add('drawing');
    if (drawingHistory.index !== 0) {
        drawingHistory.pushState();
    }
    toolData.isDrawingNow = true;
}
const endDrawing = () => {
    main.classList.remove('drawing');
    if (toolData.isDrawingNow) {
        drawingHistory.pushState();
    }
    toolData.isDrawingNow = false;
}
const toolDown = (mEvt) => {
    if (toolData.activeTool === tools.PEN) {
        drawingData.lines.push({
            color: toolData.currentColor,
            points: []
        });
        beginDrawing();

    } else if (toolData.activeTool === tools.ERASER) {
        beginDrawing();

    } else if (toolData.activeTool === tools.CODE) {
        const [data, block] = addCodeBlock(main, mEvt);
        drawingData.annotations.push(data);
    } else if (toolData.activeTool === tools.TEXT) {
        const [data, block] = addTextBlock(main, mEvt);
        drawingData.annotations.push(data);
    }  else if (toolData.activeTool === tools.HEADING) {
        const [data, block] = addTextBlock(main, mEvt, true);
        drawingData.annotations.push(data);
    }
}
const toolMove = (evt) => {
    if (!toolData.isDrawingNow) return;
    if (!drawingData.lines[0]) return;

    var rect = canvas.getBoundingClientRect();
    const mp = {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };

    if (toolData.activeTool === tools.PEN) {
        const i = drawingData.lines.length - 1;
        drawingData.lines[i].points.push(mp);

    } else if (toolData.activeTool === tools.ERASER && lastMp) {
        for (let l = 0; l < drawingData.lines.length; l++) {
            const line = drawingData.lines[l];
            for (let p = 1; p < line.points.length; p++) {
                const prev = line.points[p-1];
                const next = line.points[p];

                if (intersects(prev, next, lastMp, mp)) {
                    console.log('Erasing', l);
                    // erase the line
                    drawingData.lines.splice(l, 1);
                    break;
                }

            }
        }
    }

    lastMp = mp;
}

main.addEventListener('pointerdown', toolDown);
window.addEventListener('pointerup', endDrawing);
canvas.addEventListener('pointermove', toolMove);

for (const button of document.querySelectorAll('button[data-tool]')) {
    button.addEventListener('click', () => {
        const tool = tools[button.getAttribute('data-tool')];

        if (tool === tools.UNDO) {
            drawingHistory.undo();
            return;
        } else if (tool === tools.REDO) {
            drawingHistory.redo();
            return;
        }

        for (const ab of document.querySelectorAll('button[data-tool].active')) {
            ab.classList.remove('active');
        }
        button.classList.add('active');
        toolData.activeTool = tool;
        changeTool();
    });
}

for (const button of document.querySelectorAll('button[data-color]')) {
    button.style.backgroundColor = button.getAttribute('data-color');
    button.addEventListener('click', () => {
        toolData.currentColor = button.getAttribute('data-color');
        for (const ab of document.querySelectorAll('button[data-color].active')) {
            ab.classList.remove('active');
        }
        button.classList.add('active');
    });
    
}
changeTool();