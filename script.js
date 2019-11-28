const main = document.getElementById("main");

const tris = (() => {
    const state = {
        arr: null,
        selectionArr: null,
        selectCallback: null,
        colorMain: "black",
        colorSec: "white",
        colorMix: "grey",
        mouseButton: null,
        drag: {
            wasSelected: false,
            mouseHasBeenMoved: false,
            init: [null, null],
            last: {
                start: null,
                end: null
            },
            curEl: null,
            lastEl: null,
            cur: [null, null],
        }
    };

    const changeState = {
        x: null,
        y: null,
        is: []
    };

    const unselectTris = (el = get([changeState.x, changeState.y])) => {
        el.parentElement.classList.remove("focus");
        main.classList.remove("focused");
        [...el.parentElement.children].forEach(el => {
            el.classList.remove("activated");
            el.style.willChange = "initial";
        });

        /* makes Tris clickable again */
        setTimeout(() => {
            changeState.x = null;
            changeState.y = null;
            changeState.is = [];
        }, 200);
    };
    const change = ([x, y], index, el) => {
        if ((changeState.x !== null && (changeState.x !== y)) || (changeState.y !== null && (changeState.y !== x)) || changeState.is.includes(index)) return;

        changeState.x = changeState.x || y;
        changeState.y = changeState.y || x;
        el.parentElement.classList.add("focus")
        el.classList.add("activated");
        main.classList.add("focused");

        changeState.is.push(index);

        if (changeState.is.length !== 3) return;
        [0, 1, 2, 3].some(i => !changeState.is.includes(i) && changeState.is.push(i))

        //change style back
        state.arr[y][x] = changeState.is;
        [...get([x, y]).children].forEach((el, i) => {
            el.style.willChange = "rotate";
            el.firstElementChild.style.transform = `rotate(${changeState.is.findIndex(it => it === i) * 90}deg)`;
        })

        setTimeout(() => unselectTris(el), 200);
    };

    /**
     * 
     * @param {[number, number]} param0 
     */
    const get = ([x, y]) => main.children[getIndex([x, y])];
    const getIndex = ([x, y]) => y * state.arr[0].length + x;
    const getXY = index => [index % state.arr[0].length, Math.floor(index / state.arr[0].length)];
    const getXYFromEl = el => [+el.getAttribute("data-x"), +el.getAttribute("data-y")];

    const getTriangle = ([x, y], i, rot) => `    
    <svg width="100" height="100" viewBox="0 0 100 100" onmousedown="tris.mouseDownHandler([${x}, ${y}], ${i}, event)">
        <polygon points="0,0 0,100 100,100" style="fill: var(--colorMain); transform: rotate(${rot * 90}deg); pointer-events: none;"/>
    </svg>`;

    const generate = () => {
        applyColor();
        let htmlString = "";
        state.arr.forEach((subarr, y) => {
            subarr.forEach((el, x) => {
                htmlString += `
                <div class="group" data-x="${x}" data-y="${y}" style="${x === 0 ? "clear:left" : ""}">
                    ${el.map((rot, i) => getTriangle([x, y], i, rot)).join("")}
                </div>
                `;
            })
            // htmlString += `<div class="linebreak"></div>`;
        });

        main.innerHTML = htmlString;
    };

    const create = ({
        w,
        h,
        shape = [2, 1, 0, 3],
        colorMain,
        colorSec
    }) => {
        if (!w || !h) return;

        if (colorMain) setColorMain(colorMain);
        if (colorSec) setColorSec(colorSec);
        state.arr = (new Array(h)).fill("").map(_ => (new Array(w).fill(shape)));
        state.selectionArr = (new Array(h)).fill("").map(_ => (new Array(w).fill(false)));
        generate()
    };

    // Colors
    const setColorMain = (color) => {
        state.colorMain = color
    };

    const setColorSec = (color) => {
        state.colorSec = color
    };

    const applyColor = () => {
        document.documentElement.style.setProperty("--colorMain", state.colorMain);
        document.documentElement.style.setProperty("--colorSec", state.colorSec);
        document.documentElement.style.setProperty("--colorMix", state.colorMix);
    };

    const swapColors = () => ([state.colorMain, state.colorSec] = [state.colorSec, state.colorMain]) && applyColor();

    /**
     * updates visual representation of newly selected elements
     */
    const animate = () => {
        if (state.drag.curEl === state.drag.lastEl) return;

        state.drag.lastEl = state.drag.curEl;
        state.drag.mouseHasBeenMoved = true;

        const curCoords = getXYFromEl(state.drag.curEl);
        
        if (state.mouseButton === 2) {
            const curStart = [Math.min(state.drag.init[0], curCoords[0]), Math.min(state.drag.init[1], curCoords[1])];
            const curEnd = [Math.max(state.drag.init[0], curCoords[0]), Math.max(state.drag.init[1], curCoords[1])];
    
            const startCords = [Math.min(curStart[0], state.drag.last.start[0]), Math.min(curStart[1], state.drag.last.start[1])];
            const endCords = [Math.max(curEnd[0], state.drag.last.end[0]), Math.max(curEnd[1], state.drag.last.end[1])];
    
            for (let y = startCords[1]; y <= endCords[1]; y++) {
                for (let x = startCords[0]; x <= endCords[0]; x++) {
                    
                    const isInCur = x >= curStart[0] && y >= curStart[1] && x <= curEnd[0] && y <= curEnd[1];
                    const isInLast = x >= state.drag.last.start[0] && y >= state.drag.last.start[1] && x <= state.drag.last.end[0] && y <= state.drag.last.end[1];
    
                    if (isInCur && isInLast) continue;
                    (isInCur && !isInLast) === state.drag.wasSelected ? functs.removeFromSelection([x, y], get([x, y])) : functs.addToSelection([x, y], get([x, y]))
                }
            }
    
            state.drag.last.start = curStart;
            state.drag.last.end = curEnd;
        } else if (state.mouseButton === 0) {
            if (!state.drag.addedFirst) {
                state.drag.wasSelected ? functs.removeFromSelection(state.drag.init, state.drag.initEl) : functs.addToSelection(state.drag.init, state.drag.initEl)
                state.drag.addedFirst = true;
            }
            state.drag.wasSelected ? functs.removeFromSelection(curCoords, state.drag.curEl) : functs.addToSelection(curCoords, state.drag.curEl)
        }
    };

    /**
     * Initial function for Mouse interaction, gets called from inline onlick event
     * @param {number} y 
     * @param {number} x 
     * @param {number} i index of all tiles
     * @param {Event} e event
     */
    const mouseDownHandler = ([x, y], i, e) => {
        if (changeState.x !== null) return change([x, y], i, e.target);

        console.log(e);
        
        state.drag.init = [x, y];
        state.drag.initEl = e.target.parentElement;
        state.drag.lastEl = e.target.parentElement;
        state.drag.wasSelected = state.selectionArr[y][x];
        state.drag.mouseHasBeenMoved = false;
        state.drag.addedFirst = false;

        state.drag.last.start = [x + 1, y + 1];
        state.drag.last.end = [x - 1, y - 1];

        state.mouseButton = e.button;

        main.addEventListener("mouseover", mouseMoveHandler)
        document.addEventListener("mouseup", () => mouseUpHandler([x, y], i, e), {
            once: true
        })
    };

    const mouseUpHandler = ([x, y], i, e) => {
        main.removeEventListener("mouseover", mouseMoveHandler)

        if (state.drag.mouseHasBeenMoved) return;

        clickHandler(y, x, i, e);
    };

    const mouseMoveHandler = e => {
        state.drag.curEl = e.target.parentElement;
        requestAnimationFrame(animate);
    };

    const clickHandler = (y, x, i, e) => {
        console.log("click", x, y);

        const _el = e.target.parentElement;
        if (state.selectCallback) {
            const _cc = state.selectCallback;
            state.selectCallback = null;
            return _cc(_el, [x, y]);

        }
        if (e.ctrlKey) {
            const _isSelected = state.selectionArr[y][x];
            return _isSelected ? functs.removeFromSelection([x, y], _el) : functs.addToSelection([x, y], _el);

        }
        if (e.shiftKey) {
            const areRemoving = state.selectionArr[y][x];
            functs.addToSelection([x, y], _el);
            return functs.selectOneOnNextClick(toEl => {
                functs.callForMultiple([x, y], getXYFromEl(toEl), areRemoving ? functs.removeFromSelection : functs.addToSelection);
            })

        }
        // only used first time;
        change([x, y], i, e.target)
    };

    const keyBoardHandler = e => {
        console.log("keyDown", e.keyCode, e);
        
        if (e.key === "a" && e.ctrlKey) {
            functs.select()
            e.preventDefault()
        } else if (e.keyCode === 27) {
            functs.unselect();
            unselectTris();
        }
    };

    document.addEventListener("keydown", keyBoardHandler);
    main.addEventListener("contextmenu", e => e.preventDefault());


    const functs = (() => {
        //could be done better, pseudo element below tile with border - problem shadow

        const updateBorder = ([x, y]) => {
            get([x, y]).style.clipPath = "inset(" + [
                [x, y - 1],
                [x + 1, y],
                [x, y + 1],
                [x - 1, y],
            ].map(([x, y]) => state.selectionArr[y] !== undefined && state.selectionArr[y][x] ? 4 : -40).join("px ") + "px)"
        };

        const addToSelection = ([x, y], el) => {
            if (state.selectionArr[y][x]) return;

            el.classList.add("selected");

            const _t = state.selectionArr;

            _t[y][x] = true;
            [
                [x + 1, y],
                [x - 1, y],
                [x, y + 1],
                [x, y - 1],
            ].forEach(([x, y]) => {
                if (_t[y] !== undefined && _t[y][x]) {
                    updateBorder([x, y]);
                }
            })
            updateBorder([x, y]);
        };

        const removeFromSelection = ([x, y], el) => {
            if (!state.selectionArr[y][x]) return;

            el.classList.remove("selected");
            el.style.clipPath = "initial"

            const _t = state.selectionArr;

            _t[y][x] = false;
            [
                [x + 1, y],
                [x - 1, y],
                [x, y + 1],
                [x, y - 1],
            ].forEach(([x, y]) => {
                if (_t[y] !== undefined && _t[y][x]) {
                    updateBorder([x, y]);
                }
            })
        };

        const callForMultiple = ([fromX, fromY], [toX, toY], callback) => {
            if (fromX === toX && fromY === toY) return addToSelection([fromX, fromY], get([fromX, fromY]));

            const fromIndex = getIndex([fromX, fromY]);
            const toIndex = getIndex([toX, toY]);
            const dirIsForward = fromIndex < toIndex;

            for (let i = fromIndex; dirIsForward ? i <= toIndex : i >= toIndex; dirIsForward ? i++ : i--) {
                callback(getXY(i), get(getXY(i)));
            }
        };

        const selectOneOnNextClick = callback => {
            state.selectCallback = (el, [x, y]) => {
                addToSelection([x, y], el)
                callback(el, [x, y]);
            };
        };

        const unselect = () => state.selectionArr.forEach((subArr, y) => subArr.forEach((el, x) => state.selectionArr[y][x] && removeFromSelection([x, y], get([x, y]))))

        const select = () => state.selectionArr.forEach((subArr, y) => subArr.forEach((el, x) => !state.selectionArr[y][x] && addToSelection([x, y], get([x, y]))))

        const copy = e => {
            selectOneOnNextClick(copyFrom => {
                selectOneOnNextClick(copyTo => {
                    [...copyFrom.children].forEach((copyFromSVGs, i) => {
                        [...copyTo.children][i].firstElementChild.style.transform = copyFromSVGs.firstElementChild.style.transform;
                        unselect()
                    })
                })
            })
        }
        const swap = e => selectOneOnNextClick(select1 => selectOneOnNextClick(select2 => [...select1.children].forEach((copyFromSVGs, i) => [...select2.children][i].firstElementChild.style.transform = copyFromSVGs.firstElementChild.style.transform) || unselect()));

        const _symTopDown = () => { // ???
            state.arr = state.arr.map(subArr => subArr.reverse());
            tris.generate(state.arr);
        };

        return {
            addToSelection,
            removeFromSelection,
            callForMultiple,
            selectOneOnNextClick,
            unselect,
            select,
            copy,
            _db: {
                _symTopDown,
            }
        };
    })();

    return {
        globalState: state,
        change,
        generate,
        create,
        mouseDownHandler,
        clickHandler,
        functs,
        db: {
            get,
            swapColors
        }
    };
})();

tris.create({
    w: 6,
    h: 4
});