
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
    UNDO: 99,
    REDO: 98
}

const drawingData = {
    activeTool: tools.PEN,
    isDrawingNow: false,
    lines: [],
    linesHistoryIndex: 0,
    linesHistory: [[]],
    annotations: []
}

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
    if (drawingData.activeTool === tools.PEN
        || drawingData.activeTool === tools.ERASER) {
        canvas.style.pointerEvents = 'all';
    } else {
        canvas.style.pointerEvents = '';
    }
}

const beginDrawing = () => {
    drawingData.isDrawingNow = true;
    drawingData.linesHistoryIndex = 0;
}
const endDrawing = () => {
    if (drawingData.isDrawingNow) {
        drawingData.linesHistory.splice(0, 0,
            JSON.parse(JSON.stringify(drawingData.lines)) // clone
        );
    }
    drawingData.isDrawingNow = false;
}

main.addEventListener('mousedown', (mEvt) => {
    if (drawingData.activeTool === tools.PEN) {
        drawingData.lines.push({
            color: '#fff',
            points: []
        });
        beginDrawing();

    } else if (drawingData.activeTool === tools.ERASER) {
        beginDrawing();

    } else if (drawingData.activeTool === tools.CODE) {
        drawingData.annotations.push(addCodeBlock(main, mEvt));
    }
});
window.addEventListener('mouseup', endDrawing);
canvas.addEventListener('pointermove', (evt) => {
    if (!drawingData.isDrawingNow) return;
    if (!drawingData.lines[0]) return;

    var rect = canvas.getBoundingClientRect();
    const mp = {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };

    if (drawingData.activeTool === tools.PEN) {
        const i = drawingData.lines.length - 1;
        drawingData.lines[i].points.push(mp);

    } else if (drawingData.activeTool === tools.ERASER && lastMp) {
        for (let l = 0; l < drawingData.lines.length; l++) {
            const line = drawingData.lines[l];
            for (let p = 1; p < line.points.length; p++) {
                const prev = line.points[p-1];
                const next = line.points[p];

                if (intersects(prev, next, lastMp, mp)) {
                    console.log('WHOA', l);
                    // erase the line
                    drawingData.lines.splice(l, 1);
                    break;
                }

            }
        }
    }

    lastMp = mp;
});

for (const button of document.querySelectorAll('button[data-tool]')) {
    button.addEventListener('click', () => {
        const tool = tools[button.getAttribute('data-tool')];

        if (tool === tools.UNDO || tool === tools.REDO) {
            drawingData.linesHistoryIndex += 1;
            if (tool === tools.REDO) drawingData.linesHistoryIndex -= 2;
            // bounds checking
            if (drawingData.linesHistoryIndex < 0) drawingData.linesHistoryIndex = 0;
            if (drawingData.linesHistoryIndex >= drawingData.linesHistory.length) {
                // over the end? Go back as to not create "empty" "slots"
                drawingData.linesHistoryIndex -= 1;
                return;
            }

            drawingData.lines = JSON.parse(JSON.stringify(drawingData.linesHistory[drawingData.linesHistoryIndex])); // clone
            return;
        }

        for (const ab of document.querySelectorAll('button[data-tool].active')) {
            ab.classList.remove('active');
        }
        button.classList.add('active');
        drawingData.activeTool = tool;
        changeTool();
    });
}

changeTool();