(function() {
    'use strict';

    const tools = Object.create(null);
    const controls = Object.create(null);

    function randomPointInRadius (radius) {
        for(;;) {
            let x = Math.random() * 2 - 1;
            let y = Math.random() * 2 - 1;
            if (x * x + y * y <= 1) {
                return {x: x * radius, y: y * radius};
            }
        }
    }

    function loadImageURL (cx, url) {
        const image = document.createElement('img');
        image.addEventListener('load', () => {
            let color = cx.fillStyle;
            let size = cx.lineWidth;
            cx.canvas.width = image.width;
            cx.canvas.height = image.height;
            cx.drawImage(image, 0, 0);
            cx.fillStyle = color;
            cx.strokStyle = color;
            cx.lineWidth = size;
        });
        image.src = url;
    }

    function trackDrag (onMove, onEnd) {
        function end(event) {
            removeEventListener('mousemove', onMove);
            removeEventListener('mouseup', end);
            if (onEnd) {
                onEnd(event);
            }
        }
        addEventListener('mousemove', onMove);
        addEventListener('mouseup', end);
    };

    function relativePos (event, element) {
        const rect = element.getBoundingClientRect();
        return {x: Math.floor(event.clientX - rect.left),
                y: Math.floor(event.clientY - rect.top)};
    };

    function elt (name, attributes) {
        let node = document.createElement(name);
        if (attributes) {
            for (let attr in attributes) {
                if (attributes.hasOwnProperty(attr)) {
                    node.setAttribute(attr, attributes[attr]);
                }
            }
        }
        for (let i = 2; i < arguments.length; i++) {
            let child = arguments[i];
            if (typeof child === 'string') {
                child = document.createTextNode(child);
            }
            node.appendChild(child);
        }
        return node;
    }

    function createPaint (parent) {
        const canvas = elt('canvas', {width: 500, height: 300});
        const cx = canvas.getContext('2d');
        const toolbar = elt('div', {class: 'toolbar'});
        for (let name in controls) {
            toolbar.appendChild(controls[name](cx));
        }
        const panel = elt('div', {class: 'picture-panel'}, canvas);
        parent.appendChild(elt('div', {class: 'paint-container'}, panel, toolbar));
        canvas.width = document.querySelector('.picture-panel').clientWidth;
        canvas.height = document.querySelector('.picture-panel').clientHeight; 
    }

    controls.tool = function(cx) {
        const select = elt('select');
        for (let name in tools) {
            select.appendChild(elt('option', null, name));
        }
        cx.canvas.addEventListener('mousedown', (e) => {
            if (e.which === 1) {
                tools[select.value](e, cx);
                e.preventDefault();
            }
        })
        return elt('span', {class: 'tool-item'}, 'Tool', select);
    }

    controls.color = (cx) => {
        const input = elt('input', {type: 'color'});
        input.addEventListener('change', () => {
            console.log(event.path[0].value, cx);
            let value = event.path[0].value;
            cx.fillStyle = value;
            cx.strokeStyle = value;
        });
        return elt('span', {class: 'tool-item'}, 'Color', input);
    };

    controls.brushSize = (cx) => {
        const select = elt('select');
        const sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];
        sizes.forEach(item => select.appendChild(elt('option'
        , {value: item}, `${item} pixels`)));
        select.addEventListener('change', () => {
            cx.lineWidth = select.value;
        });
        return elt('span', {class: 'tool-item'}, 'Brush size', select);
    };

    controls.save = (cx) => {
        const link = elt('a', {href: '/'}, 'Save');
        function update () {
            try {
                link.href = cx.canvas.toDataURL();
            } catch (e) {
                if (e instanceof SecurityError) {
                    link.href = `javascript:alert(
                        ${JSON.stringify('Cannot save: ')}
                         ${e.tpString()} )`
                } else {
                    throw e;
                }
            }
        }
        link.addEventListener('mouseover', update);
        link.addEventListener('focus', update);
        return elt('span', {class: 'tool-item'}, '', link);
    }

    controls.openFile = (cx) => {
        const input = elt('input', {type: 'file'});
        input.addEventListener('change', () => {
            if (input.files.length === 0) {
                return; 
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                loadImageURL(cx, reader.result);
            });
            reader.readAsDataURL(input.files[0]);
        });
        return elt('div', {class: 'tool-item'}, 'Open file ', input);
    }

    controls.openURL = (cx) => {
        const input = elt('input', {type: 'text'});
        const form = elt('form', {class: 'tool-item'}, 'Open url ', input
        , elt('button', {type: 'submit'}, 'load'));
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            loadImageURL(cx, form.querySelector('input').value);
        })
        return form;
    }

    tools.Line = (event, cx, onEnd) => {
        cx.lineCap = 'round';
        let pos = relativePos(event, cx.canvas);
        trackDrag(function (event) {
            cx.beginPath();
            cx.moveTo(pos.x, pos.y);
            pos = relativePos(event, cx.canvas);
            cx.lineTo(pos.x, pos.y);
            cx.stroke();
        }, onEnd)
    };

    tools.Erase = (event, cx) => {
        cx.globalCompositeOperation = 'destination-out';
        tools.Line(event, cx, function() {
            cx.globalCompositeOperation = 'source-over';
        });
    };

    tools.Text = (event, cx) => {
        let text = prompt('Text: ', '');
        if (text) {
            const pos = relativePos(event, cx.canvas);
            cx.font = `${Math.max(7, cx.lineWidth)}px sans-serif`;
            cx.fillText(text, pos.x, pos.y);
        }
    }

    tools.Spray = function(event, cx) {
        let radius = cx.lineWidth / 2;
        let area = radius * radius * Math.PI;
        let dotsPerTick  = Math.ceil(area / 30);
        let currentPos = relativePos(event, cx.canvas);
        let spray = setInterval(() => {
            for (let i = 0; i < dotsPerTick; i++) {
                let offset = randomPointInRadius(radius);
                cx.fillRect(currentPos.x + offset.x
                    , currentPos.y + offset.y, 1, 1);
            }
        }, 25);
        trackDrag(event => {
            currentPos = relativePos(event, cx.canvas)
        }, () => {clearInterval(spray)});
    };

    createPaint(document.body);
    
}());
