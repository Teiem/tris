const main = document.getElementById("main");

const tris = (() => {
    const globalState = {
        arr: null,
        selection: null,
        disableChanges: false,
        colorMain: "black",
        colorSec: "white",
        colorMix: "grey",
    };

    const changeState = {
        x: null,
        y: null,
        is: []
    };

    // y and x are swaped
    const change = (x, y, index, e) => {
        if (globalState.disableChanges || (changeState.x !== null && (changeState.x !== x)) || (changeState.y !== null && (changeState.y !== y)) || changeState.is.includes(index)) return;

        changeState.x = changeState.x || x;
        changeState.y = changeState.y || y;
        e.target.parentElement.classList.add("focus")
        e.target.classList.add("activated");
        main.classList.add("focused");


        changeState.is.push(index);

        if (changeState.is.length !== 3) return;
        [0, 1, 2, 3].some(i => !changeState.is.includes(i) && changeState.is.push(i))

        globalState.arr[x][y] = changeState.is;
        [...get(y, x)].forEach((el, i) => {
            el.firstElementChild.style.transform = `rotate(${changeState.is.findIndex(it => it === i) * 90}deg)`;
            el.style.willChange = "rotate";
        })

        setTimeout(() => {
            e.target.parentElement.classList.remove("focus");
            main.classList.remove("focused");
            [...e.target.parentElement.children].forEach(el => {
                // console.log(el.style);

                el.classList.remove("activated");
                el.style.willChange = "initial";
            });
        }, 200);

        setTimeout(() => {
            changeState.x = null;
            changeState.y = null;
            changeState.is = [];
        }, 400);
    };

    const get = (x, y) => main.children[y * globalState.arr[0].length + x].children

    const getTriangle = (x, y, i, rot) => `    
    <svg width="100" height="100" viewBox="0 0 100 100" onclick="tris.clickHandler(${x}, ${y}, ${i}, event)">
        <polygon points="0,0 0,100 100,100" style="fill: var(--colorMain); transform: rotate(${rot * 90}deg); pointer-events: none;"/>
    </svg>`;

    const generate = () => {
        applyColor();
        let htmlString = "";
        globalState.arr.forEach((subarr, y) => {
            subarr.forEach((el, x) => {
                htmlString += `
                <div class="group" data-x="${x}" data-y="${y}" style="${x === 0 ? "clear:left" : ""}">
                    ${el.map((rot, i) => getTriangle(y, x, i, rot)).join("")}
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
        globalState.arr = (new Array(h)).fill("").map(_ => (new Array(w).fill(shape)));
        globalState.selection = (new Array(h)).fill("").map(_ => (new Array(w).fill(false)));
        generate()
    };

    // Colors
    const setColorMain = (color) => {
        globalState.colorMain = color
    };

    const setColorSec = (color) => {
        globalState.colorSec = color
    };

    const applyColor = () => {
        document.documentElement.style.setProperty("--colorMain", globalState.colorMain);
        document.documentElement.style.setProperty("--colorSec", globalState.colorSec);
        document.documentElement.style.setProperty("--colorMix", globalState.colorMix);
    };

    const swapColors = () => ([globalState.colorMain, globalState.colorSec] = [globalState.colorSec, globalState.colorMain]) && applyColor();

    let selectedElements = [];

    const clickHandler = (x, y, i, e) => {
        console.log("click", e);
        if (e.ctrlKey) {
            const _index = selectedElements.indexOf(e.target.parentElement);
            return ~_index ? functs.removeFromSelection(x, y, _index) : functs.addToSelection(x, y, e.target.parentElement);
        }
        change(x, y, i, e)
    };

    const functs = (() => {
        //css to give mu,tiple elements one border

        //swap x,y
        const addToSelection = (x, y, el) => {
            el.classList.add("selected");
            selectedElements.push(el);

            const _t = globalState.selection;
            console.log(x, y, _t);
            
            _t[x][y] = true;
            [
                [x + 1, y],
                [x - 1, y],
                [x, y + 1],
                [x, y - 1],
            ].forEach(([x, y], side) => {;
                
                console.log([x, y], _t);
                
                _t[y] && _t[y][x] && (get(x, y).style["border" + ["Top", "Bottom", "Right", "Left"][side], + "Width"] = "0")
            })

        };

        const removeFromSelection = (x, y, index) => {
            selectedElements[index].classList.remove("selected");
            selectedElements.splice(index, 1);

            console.log(selectedElements);
            
        };

        const selectOne = (callback) => {
            tris.globalState.disableChanges = true;
            main.addEventListener("click", (e) => {
                const curEl = e.target.parentElement;
                addToSelection(curEl);  
                tris.globalState.disableChanges = false;
                callback(curEl)
            }, {
                once: true
            })
        };

        const unselect = () => (selectedElements.forEach(el => el.classList.remove("selected"))) || (selectedElements = [])

        const copy = e => selectOne(copyFrom => selectOne(copyTo => [...copyFrom.children].forEach((copyFromSVGs, i) => [...copyTo.children][i].firstElementChild.style.transform = copyFromSVGs.firstElementChild.style.transform) || unselect()));
        const swap = e => selectOne(select1 => selectOne(select2 => [...select1.children].forEach((copyFromSVGs, i) => [...select2.children][i].firstElementChild.style.transform = copyFromSVGs.firstElementChild.style.transform) || unselect()));

        const change = () => {};

        const symTopDown = () => { // ???
            arr = arr.map((el, index) => index < arr.length ? el : arr[arr.length - el])
            tris.generate(arr);
        };

        return {
            addToSelection,
            removeFromSelection,
            copy,
        };
    })();

    return {
        globalState,
        change,
        generate,
        create,
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