const inputText = document.getElementById("InputText");
const addButton = document.getElementById("AddButton");
const orderedList = document.getElementById("orderedList");
const panel = document.getElementById("panel");
const header = document.getElementById("header");

let undoStack = [];
let redoStack = [];

// ======================= On Load =======================

displayStoredTasks();
applyThemeHelper(localStorage.getItem("preset") || "preset1", localStorage.getItem("mode") || "light");

document.addEventListener("touchstart", () => {}, true);
// fixes touch on ios

// setVH();
// fix gradient white space on mobile scroll
// doesnt work, so idk. Gradient is fucked up on mobile

// ======================= Add Task Logic + Undo/Redo logic =======================

addButton.addEventListener("click", addTask);
inputText.addEventListener("keydown", addTask);

function addTask(event)
{
    if(inputText.value.trim() === "" && event.type === "click" || inputText.value.trim() === "" && event.key === "Enter")
    {
        inputText.value = "";
        inputText.setAttribute("placeholder", "Please Enter Something");

        setTimeout(() =>
            {
                inputText.setAttribute("placeholder", "Enter Task");
            }, 3000);

        return;
    }

    if(event.key === "Enter" || event.type === "click")
    {
        let li = document.createElement("li");
        li.setAttribute('draggable', 'true');
        li.classList.add('sortable-item')

        let check = document.createElement("span");
        check.className = "check";

        let remove = document.createElement("span");
        remove.className = "remove";
        remove.textContent = "X";

        let text = document.createTextNode(inputText.value.trim());

        li.appendChild(check);
        li.appendChild(text);
        li.appendChild(remove);

        orderedList.appendChild(li);
        inputText.value = "";
        inputText.setAttribute("placeholder", "Enter Task");
        saveTasks();
    }
};

document.addEventListener("keydown", function(e)
{
    if(e.ctrlKey && e.key === "z")
    {
        e.preventDefault();
        if(undoStack.length > 1)
        {
            undo();
        }
    }

    if(e.ctrlKey && e.key === "y")
    {
        e.preventDefault();
        if(redoStack.length > 0)
        {
            redo();
        }
    }
});

header.addEventListener("touchstart", function(e)
{
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX
    let leftSide = x < (rect.left + 100);
    let rightSide = x > (rect.right - 100);

    if(leftSide)
    {
        e.preventDefault();
        if(undoStack.length > 1)
        {
            undo();
        }
    }

    if(rightSide)
    {
        e.preventDefault();
        if(redoStack.length > 0)
        {
            redo();
        }
    }
})

function undo()
{
    const currentState = undoStack.pop();
    redoStack.push(currentState);
    const previousState = undoStack[undoStack.length - 1];
    orderedList.innerHTML = previousState;
    localStorage.setItem("tasks", previousState);
}

function redo()
{
    const nextState = redoStack.pop();
    undoStack.push(nextState);
    orderedList.innerHTML = nextState;
    localStorage.setItem("tasks", nextState);
}

// ======================= Check And Remove Logic =======================

orderedList.addEventListener("click", function(event)
{
    if(event.target.className === "remove")
    {
        event.target.parentElement.remove();
        saveTasks();
    }
    else if(event.target.className ==="check")
    {
        event.target.parentElement.classList.toggle("checked");
        saveTasks();
    }
});

// ======================= Local Storage for Tasks + Undo/Redo additional logic =======================

function saveTasks()
{
    if(undoStack[undoStack.length - 1] !== orderedList.innerHTML)
    {
        localStorage.setItem("tasks", orderedList.innerHTML);

        undoStack.push(orderedList.innerHTML);
        if(undoStack.length > 50) undoStack.shift();
        redoStack = [];
    }
};

function displayStoredTasks()
{
    const stored = localStorage.getItem("tasks");
    if(stored)
    {
        orderedList.innerHTML = localStorage.getItem("tasks");
        undoStack.push(stored)
        redoStack = [];
    }
}

// ======================= Drag And Drop Logic + Drag Scroll Logic =======================

document.querySelectorAll('.sortable-item').forEach(item => item.classList.remove('over'));
document.querySelectorAll('.sortable-item').forEach(item => item.classList.remove('dragging'));

const list = document.querySelector('.sortable-list');

let draggingItem = null;

list.addEventListener("dragstart", (e) =>
{
    if(!e.target.classList.contains("sortable-item") || e.target.classList.contains("edit"))
    {
        e.preventDefault();
        return;
    }

    dragScroll(e);

    draggingItem = e.target;
    e.target.classList.add('dragging');
});

list.addEventListener('dragover', (e) => 
{
    e.preventDefault();

    dragScroll(e);

    const draggingOverItem = getDragAfterElement(list, e.clientY);

    document.querySelectorAll('.sortable-item').forEach(item => item.classList.remove('over'));

    if(draggingOverItem)
    {
        draggingOverItem.classList.add('over');
        list.insertBefore(draggingItem, draggingOverItem);
    }
    else
    {
        list.appendChild(draggingItem);
    }

});

function getDragAfterElement(container, y)
{
    const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) =>
    {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2;

        if(offset < 0 && offset > closest.offset)
        {
            return {offset: offset, element: child};
        }
        else
        {
            return closest;
        }

    }, {offset: Number.NEGATIVE_INFINITY, element: undefined}).element;
};

list.addEventListener('dragend', (e) =>
{
    e.target.classList.remove('dragging');
    draggingItem = null;

    document.querySelectorAll(".sortable-item").forEach(item => item.classList.remove('over'));

    cancelAnimationFrame(frameAnimationId);
    saveTasks();
});

let frameAnimationId = null;

function dragScroll(e)
{
    cancelAnimationFrame(frameAnimationId);

    const rect = orderedList.getBoundingClientRect();
    const y = e.clientY;
    const nearTop = y < 50 && rect.top <= 200;
    const nearBottom = y > window.innerHeight - 50;

    if(nearTop) window.scrollBy(0, -10);
    if(nearBottom) window.scrollBy(0, 10);

    frameAnimationId = requestAnimationFrame(() => dragScroll(e));
}

// ======================= Panel buttons functionallity =======================

panel.addEventListener("click", function(event)
{
    if(event.target.closest('#clean-all, .clean-all'))
    {
        orderedList.innerHTML = "";
        saveTasks();
        return;
    }
    
    if(event.target.closest('#light-dark, .light-dark'))
    { 
        if(localStorage.getItem("mode") === "dark")
        {
            applyTheme(localStorage.getItem("preset") || "preset1", "light");
        }
        else
        {   
            applyTheme(localStorage.getItem("preset") || "preset1", "dark");
        }
        return;
    }

    if(event.target.closest("#customization, .customization"))
    {
        if(customizationMenu.classList.contains("active"))
        {
            customizationMenu.classList.remove("active");
            customizationMenu.classList.add("hidden")
        }
        else
        {
            customizationMenu.classList.remove("hidden");
            customizationMenu.classList.add("active");
        }
        return;
    }
});

// ======================= Theme applying logic + Darkmode + Transitions =======================

function applyTheme(preset, mode)
{
    const body = document.body;
    const currentClass = [...body.classList].find((c) => c.includes("-light") || c.includes("-dark"));
    const targetClass = `${preset}-${mode}`;

    const currentHasGradient = hasGradient(currentClass);
    const targetHasGradient = hasGradient(targetClass);

    // -- transition cases --
    if(currentHasGradient && targetHasGradient)
    {
        body.style.setProperty("--gradient-opacity", "0");
        setTimeout(() => {
            applyThemeHelper(preset, mode);
            setTimeout(() => {
                body.style.setProperty("--gradient-opacity", "1");
            }, 100);
        }, 200);
    }
    else if(currentHasGradient && !targetHasGradient)
    {
        body.style.setProperty("--gradient-opacity", "0");
        setTimeout(() => {
            applyThemeHelper(preset, mode);
        }, 200);
    }
    else if(!currentHasGradient && targetHasGradient)
    {
        applyThemeHelper(preset, mode);
        body.style.setProperty("--gradient-opacity", "0");
        setTimeout(() => {
            body.style.setProperty("--gradient-opacity", "1")
        }, 200);
    }
    else
    {
        applyThemeHelper(preset, mode);
    }

    localStorage.setItem("preset", preset);
    localStorage.setItem("mode", mode);
}

function hasGradient(className)
{
    const testElement = document.createElement("div");
    testElement.style.position = "absolute";
    testElement.style.visibility = "hidden";
    testElement.style.pointerEvents = "none";
    testElement.className = className;

    const savedPresetClasses = [...document.body.classList].filter((c) => c.startsWith("preset"));
    document.body.classList.remove(...savedPresetClasses);

    document.body.appendChild(testElement);

    const styles = getComputedStyle(testElement);

    const gradients = 
    [
        styles.getPropertyValue("--background-gradient"),
        styles.getPropertyValue("--primary-gradient"),
        styles.getPropertyValue("--header-gradient")
    ]

    document.body.classList.add(...savedPresetClasses);
    document.body.removeChild(testElement);

    return gradients.some((g) => g && g.trim() !== "none" & g.trim() !== "");
}

function applyThemeHelper(preset, mode)
{
    const body = document.body;

    body.classList.remove(...Array.from(body.classList).filter((c) => c.startsWith("preset") || c === "darkmode"));

    if(mode === "light")
    {
        body.classList.add(`${preset}-${mode}`);
    }
    else if(mode === "dark")
    {
        body.classList.add(`${preset}-${mode}`);
        body.classList.add("darkmode");
    }

    document.querySelectorAll(".customization-presets").forEach((e) => e.classList.remove("selectedPreset"));
    document.getElementById(`${preset}`).classList.add("selectedPreset");
}

// ======================= Theme menu logic =======================

const customizationMenu = document.getElementById("customization-menu");
const customizationBtn = document.getElementById("customization");
const scrollWrapper = document.getElementById("scroll-wrapper");

document.addEventListener("click", function(event)
{
    if(!customizationMenu.classList.contains("hidden") &&
       !customizationMenu.contains(event.target) &&
       !customizationBtn.contains(event.target) &&
       !event.target.closest("#light-dark, .light-dark"))
    {
        if(customizationMenu.classList.contains("active"))
        {
            customizationMenu.classList.remove("active");
            customizationMenu.classList.add("hidden");
        }
    }
});

scrollWrapper.addEventListener("click", function(event)
{
    if(event.target.closest(".customization-presets"))
    {
        let chosenPreset = event.target.parentElement.id;

        if(chosenPreset !== "scroll-wrapper" && localStorage.getItem("preset") !== chosenPreset)
        {
            applyTheme(chosenPreset, localStorage.getItem("mode") || "light")
        }
    }
});

// ======================= Custom scroll animation =======================

let scrollVelocity = 0;
let isAnimating = false;

customizationMenu.addEventListener("wheel", (event) => {
    event.preventDefault();

    // Add velocity based on wheel input
    scrollVelocity += event.deltaY * 0.05; // adjust multiplier for sensitivity

    if (!isAnimating) {
        isAnimating = true;
        animateScroll();
    }
});

function animateScroll() {
    if (Math.abs(scrollVelocity) > 0.5) {
        scrollWrapper.scrollTop += scrollVelocity; // move content
        scrollVelocity *= 0.93; // friction: reduce velocity each frame
        requestAnimationFrame(animateScroll);
    } else {
        scrollVelocity = 0;
        isAnimating = false;
    }
};

// ======================= Edit Task =======================

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

if(isTouchDevice)
{
    orderedList.addEventListener("touchstart", handleTouch);
}
else
{
    orderedList.addEventListener("dblclick", handleEdit);
}

let lastTap = 0;
let lastRect = null;

function handleTouch(e)
{
    const li = e.target.closest("li.sortable-item");
    if (!li) return;
    if( e.target.classList.contains("check") || 
        e.target.classList.contains("remove") || 
        e.target.classList.contains("edit") || 
        e.target.classList.contains("input-edit")) return;

    const now = Date.now();
    const timeSince = now - lastTap;
    const rect = li.getBoundingClientRect();
    const touch = e.touches[0] || e.changedTouches[0];  // fallback
    const x = touch.clientX;
    const y = touch.clientY;

    const insideLast = !!(
        lastRect &&
        x >= lastRect.left &&
        x <= lastRect.right &&
        y >= lastRect.top &&
        y <= lastRect.bottom);

    if(insideLast && timeSince < 300 && timeSince > 0)
    {
        e.preventDefault();
        handleEdit(e);

        lastTap = 0;
        lastRect = null;
    }

    lastTap = now;
    lastRect = rect;
}

function handleEdit(e)
{
    e.preventDefault();
    const li = e.target.closest("li.sortable-item");

    if (!li) return;
    if( e.target.classList.contains("check") || 
        e.target.classList.contains("remove") || 
        e.target.classList.contains("edit") || 
        e.target.classList.contains("input-edit")) return;

    const textNode = li.childNodes[1];
    const oldText = textNode.textContent.trim();

    const input = document.createElement("textarea");
    input.type = "text";
    input.value = oldText;
    input.className = "input-edit";
    input.style.justifyContent = "center";

    const rect = li.getBoundingClientRect();
    const baseHeight = rect.height - 20;
    input.style.height = (baseHeight) + "px";

    input.addEventListener("input", function(e)
    {
        input.style.height = "auto";
        // const newHeight = Math.max(input.scrollHeight, baseHeight);
        input.style.height = `${input.scrollHeight}px`
    });

    li.replaceChild(input, textNode);
    li.classList.add("edit");
    input.focus();

    input.addEventListener("keydown", function(e)
    {
        if(e.key === "Enter")
        {
            e.preventDefault();
            commitChange();
        }
    });

    input.addEventListener("blur", commitChange)

    let commited = false;

    function commitChange()
    {
        if(commited) return;
        commited = true;

        const newText = input.value.trim() || oldText;
        const newTask = document.createTextNode(newText);
        li.replaceChild(newTask, input);
        li.classList.remove("edit");

        saveTasks();
    }
}

// ======================= FIX gradient white gap when scrolling on mobile, when browser UI hides =======================

// function setVH()
// {
//     document.body.style.setProperty(`--vh`, `${window.innerHeight * 0.01}px`);
// }

// window.addEventListener("resize", setVH);

// doesn't work, maybe because innerHeight doesn't change while i still hold the finger and scroll, idk weird, ill use 120vh and call it fixed

// const isMobile = (
//     ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
//     window.matchMedia('(max-width: 768px)').matches
// );