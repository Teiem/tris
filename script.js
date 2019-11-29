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
            lastEl: null,

            cur: [null, null],
            curEl: null,
        }
    };

    const changeState = {
        x: null,
        y: null,
        is: []
    };

    const unselectTris = (el = get([changeState.x, changeState.y])) => {
        el.classList.remove("focus");
        main.classList.remove("focused");
        [...el.children].forEach(subEl => subEl.classList.remove("activated"));

        /* makes Tris clickable again */
        setTimeout(() => {
            changeState.y = null;
            changeState.x = null;
            changeState.is = [];
        }, 200);
    };

    const apply = ([x, y], el, newState) => {
        state.arr[y][x] = changeState.is;
        [...el.children].forEach((subEl, i) => {
            subEl.style.willChange = "rotate";
            subEl.firstElementChild.style.transform = `rotate(${newState.findIndex(it => it === i) * 90}deg)`;
        });

        setTimeout(() => [...el.children].forEach((subEl) => subEl.style.willChange = "initial"), 200);
    };

    const edit = ([x, y], index, el) => {
        if ((changeState.y !== null && (changeState.y !== y)) || (changeState.x !== null && (changeState.x !== x)) || changeState.is.includes(index)) return;

        const _pEl = el.parentElement;
        changeState.y = changeState.y || y;
        changeState.x = changeState.x || x;
        _pEl.classList.add("focus")
        main.classList.add("focused");
        el.classList.add("activated");

        changeState.is.push(index);

        if (changeState.is.length !== 3) return;
        [0, 1, 2, 3].some(i => !changeState.is.includes(i) && changeState.is.push(i))


        apply([x, y], _pEl, changeState.is);
        setTimeout(() => unselectTris(_pEl), 200);
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

        main.innerHTML = state.arr.map((subarr, y) => (subarr.map((el, x) => `
            <div class="group" data-x="${x}" data-y="${y}" style="${x === 0 ? "clear:left" : ""}">
                ${el.map((rot, i) => getTriangle([x, y], i, rot)).join("")}
            </div>
        `).join(""))).join("");
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
        state.colorMain = color;
        applyColor()
    };

    const setColorSec = (color) => {
        state.colorSec = color;
        applyColor()
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
        state.drag.mouseHasBeenMoved = true;

        if (state.drag.curEl === state.drag.lastEl) return;
        state.drag.lastEl = state.drag.curEl;

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
                    (isInCur && !isInLast) === state.drag.wasSelected ? selectionFuncts.removeFromSelection([x, y], get([x, y])) : selectionFuncts.addToSelection([x, y], get([x, y]))
                }
            }

            state.drag.last.start = curStart;
            state.drag.last.end = curEnd;

        } else if (state.mouseButton === 0) state.drag.wasSelected ? selectionFuncts.removeFromSelection(curCoords, state.drag.curEl) : selectionFuncts.addToSelection(curCoords, state.drag.curEl);

        if (!state.drag.addedFirst) {
            state.drag.wasSelected ? selectionFuncts.removeFromSelection(state.drag.init, state.drag.initEl) : selectionFuncts.addToSelection(state.drag.init, state.drag.initEl)
            state.drag.addedFirst = true;
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
        if (changeState.y !== null) return edit([x, y], i, e.target);

        const _el = e.target.parentElement;
        if (state.selectCallback) {
            const _cc = state.selectCallback;
            state.selectCallback = null;
            return _cc(_el, [x, y]);

        }
        if (e.ctrlKey || e.button === 1) {
            return state.selectionArr[y][x] ? selectionFuncts.removeFromSelection([x, y], _el) : selectionFuncts.addToSelection([x, y], _el);

        }
        if (e.shiftKey) {
            // need some kind of highligh besides selection 
            selectionFuncts.addToSelection([x, y], _el);
            return selectionFuncts.selectOneOnNextClick(toEl => selectionFuncts.callForMultiple([x, y], getXYFromEl(toEl), state.selectionArr[y][x] ? selectionFuncts.removeFromSelection : selectionFuncts.addToSelection));
        }

        state.drag.init = [x, y];
        state.drag.initEl = e.target.parentElement;
        state.drag.lastEl = e.target.parentElement;
        state.drag.wasSelected = state.selectionArr[y][x];
        state.drag.mouseHasBeenMoved = false;
        state.drag.addedFirst = false;

        state.drag.last.start = [x, y];
        state.drag.last.end = [x, y];

        state.mouseButton = e.button;

        main.addEventListener("mouseover", mouseMoveHandler)
        document.addEventListener("mouseup", () => mouseUpHandler([x, y], i, e), {
            once: true
        })
    };

    const mouseUpHandler = ([x, y], i, e) => {
        main.removeEventListener("mouseover", mouseMoveHandler)

        if (state.drag.mouseHasBeenMoved) return;

        if (state.mouseButton === 0) edit([x, y], i, e.target)
    };

    const mouseMoveHandler = e => {
        state.drag.curEl = e.target.parentElement;
        requestAnimationFrame(animate);
    };

    const keyBoardHandler = e => {
        // console.log("keyDown", e.keyCode, e);

        if (e.key === "a" && e.ctrlKey) {
            selectionFuncts.select()
            e.preventDefault()
        } else if (e.keyCode === 27) {
            selectionFuncts.unselect();
            unselectTris();
        }
    };

    document.addEventListener("keydown", keyBoardHandler);
    main.addEventListener("contextmenu", e => e.preventDefault());

    const selectionFuncts = (() => {

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

        const select = () => state.selectionArr.forEach((subArr, y) => subArr.forEach((el, x) => !state.selectionArr[y][x] && addToSelection([x, y], get([x, y]))));
        const unselect = () => state.selectionArr.forEach((subArr, y) => subArr.forEach((el, x) => state.selectionArr[y][x] && removeFromSelection([x, y], get([x, y]))));

        const copy = e => selectOneOnNextClick(copyFrom => selectOneOnNextClick(copyTo => [...copyFrom.children].forEach((copyFromSVGs, i) => {
            [...copyTo.children][i].firstElementChild.style.transform = copyFromSVGs.firstElementChild.style.transform;
            unselect()
        })))

        const _symTopDown = () => { // ???
            state.arr = state.arr.map(subArr => subArr.reverse());
            tris.generate(state.arr);
        };

        const action = (() => {
            const fill = (newFill) => state.selectionArr.forEach((subarr, y) => subarr.forEach((isSelected, x) => isSelected && apply([x, y], get([x, y]), newFill)))

            const applyChanges = (arr) => arr.forEach((subArr, y) => subArr.forEach((newArr, x) => {
                const curArr = state.arr[y][x];
                const isSame = curArr.some((curEl, i) => curEl !== curArr[i]);

                if (!isSame) apply([x, y], get([x, y], newArr));
            }));

            return {
                fill,
                applyChanges,
            };
        })();

        return {
            addToSelection,
            removeFromSelection,
            callForMultiple,
            selectOneOnNextClick,
            unselect,
            select,
            copy,
            action,
            _db: {
                _symTopDown,
            }
        };
    })();

    return {
        create,
        mouseDownHandler,
        functs: selectionFuncts,
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