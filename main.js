let inputText = document.getElementById("InputText");
let addButton = document.getElementById("AddButton");

let orderedList = document.getElementById("orderedList");

let panel = document.getElementById("panel");

addButton.addEventListener("click", addTask);
inputText.addEventListener("keydown", addTask);

// ======================= Add Task Logic =======================

function addTask(event)
{
    if(inputText.value === "" && event.type === "click" || inputText.value === "" && event.key === "Enter")
    {
        inputText.setAttribute("placeholder", "Please Enter Something");

        setTimeout(() =>
            {
                inputText.setAttribute("placeholder", "Enter Task");
            }, 3000);

        return; // otherwise it will spam tasks when typing or allow empty task
    }

    if(event.key === "Enter" || event.type === "click")
    {
        let li = document.createElement("li");
        li.setAttribute('draggable', 'true');
        li.classList.add('sortable-item')
        li.innerHTML = '<span class="check"></span>' + inputText.value + '<span class="remove">X</span>';

        orderedList.appendChild(li);
        inputText.value = "";
        inputText.setAttribute("placeholder", "Enter Task");
        saveTasks();
    }
};

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

// ======================= Local Storage for Tasks =======================

function saveTasks()
{
    localStorage.setItem("tasks", orderedList.innerHTML);
};

function displayStoredTasks()
{
    orderedList.innerHTML = localStorage.getItem("tasks");
}

displayStoredTasks();
// localStorage.clear();

// ======================= Drag And Drop Logic =======================

document.querySelectorAll('.sortable-item').forEach(item => item.classList.remove('over'));
document.querySelectorAll('.sortable-item').forEach(item => item.classList.remove('dragging'));

const list = document.querySelector('.sortable-list');

let draggingItem = null;

list.addEventListener("dragstart", (e) =>
{
    if(!e.target.classList.contains("sortable-item"))
    {
        e.preventDefault();
        return;
    }

    draggingItem = e.target;
    e.target.classList.add('dragging');
});

list.addEventListener('dragend', (e) =>
{
    e.target.classList.remove('dragging');
    draggingItem = null;

    document.querySelectorAll(".sortable-item").forEach(item => item.classList.remove('over'));
});

list.addEventListener('dragover', (e) => 
{
    e.preventDefault();

    const draggingOverItem = getDragAfterElement(list, e.clientY);

    document.querySelectorAll('.sortable-item').forEach(item => item.classList.remove('over'));

    if(draggingOverItem)
    {
        draggingOverItem.classList.add('over');
        list.insertBefore(draggingItem, draggingOverItem);
        saveTasks();
    }
    else
    {
        list.appendChild(draggingItem);
        saveTasks();
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

// ======================= Panel buttons functionallity =======================

panel.addEventListener("click", function(event)
{
    if(event.target.closest('#clean-all, .clean-all'))
    {
        localStorage.removeItem("tasks");
        displayStoredTasks();
        return;
    }
    
    if(event.target.closest('#light-dark, .light-dark'))
    { 
        darkmode = localStorage.getItem("darkmode");
        darkmode !== "active" ? enableDarkmode() : disableDarkmode();
        return;
    }

    if(event.target.closest("#customization, .customization"))
    {
        document.getElementById("customization-menu").classList.toggle("hidden");
    }
});

//              Darkmode additional logic + theme preset

let darkmode = localStorage.getItem("darkmode");
let activePreset = localStorage.getItem("preset");

if(darkmode === "active"){enableDarkmode()};

// ok so this block of code below only changes when page is loading
if(activePreset)
{
    if(darkmode === "active")
    {
        document.body.classList.add(`${activePreset}-dark`)

        document.getElementById(`${activePreset}`).classList.add("selectedPreset");
    }
    else
    {
        document.body.classList.add(`${activePreset}`)

        document.getElementById(`${activePreset}`).classList.add("selectedPreset");
    }
};

// localStorage.removeItem("preset");

// now all i have to do is to make preset change on button click

// FUCK IT WORKS, NO HELP, NO INTERNET, NO CHATGPT, FUCK YES
// IDK HOW, I MADE CHAOS, GOT LOST IN IT, AND MADE A FUCKING COMEBACK BY MYSELF
// I AM SO FUCKING PROUD OF MYSELF

// after a while you look at the code and think how da faq it all works together, you cant remember the logic

function enableDarkmode()
{
    activePreset = localStorage.getItem("preset");

    if(activePreset)
    {
        document.body.style.setProperty("--gradient-opacity", "0");

        setTimeout(() => {
            document.body.classList.add("darkmode");
            localStorage.setItem("darkmode", "active");

            document.body.classList.remove(`${activePreset}`);
            document.body.classList.add(`${activePreset}-dark`);

            document.body.style.setProperty("--gradient-opacity", "1");
        }, 100);
    }
    else
    {
        document.body.classList.add("darkmode");
        localStorage.setItem("darkmode", "active");
    }
}

function disableDarkmode()
{
    activePreset = localStorage.getItem("preset");

    if(activePreset)
    {
        document.body.style.setProperty("--gradient-opacity", "0");

        setTimeout(() => {
            document.body.classList.remove("darkmode");
            localStorage.setItem("darkmode", null);

            document.body.classList.remove(`${activePreset}-dark`);
            document.body.classList.add(`${activePreset}`);

            document.body.style.setProperty("--gradient-opacity", "1");
        }, 100);
    }
    else
    {
        document.body.classList.remove("darkmode");
        localStorage.setItem("darkmode", null);
    }
}

//              Theme menu additional logic

// hide theme menu if we click outside of it unless button and darkmode

const customizationMenu = document.getElementById("customization-menu");
const customizationBtn = document.getElementById("customization");

document.addEventListener("click", function(event)
{
    if(!customizationMenu.classList.contains("hidden") &&
       !customizationMenu.contains(event.target) &&
       !customizationBtn.contains(event.target) &&
       !event.target.closest("#light-dark, .light-dark"))
    {
        customizationMenu.classList.add("hidden");
    }
});

// scroll speed + animation

let scrollVelocity = 0; // how fast we scroll
let isAnimating = false;

const scrollWrapper = document.querySelector(`.scroll-wrapper`);

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

// theme applying logic

scrollWrapper.addEventListener("click", function(event)
{
    if(event.target.closest(".customization-presets"))
    {
        let chosenPreset = event.target.parentElement.id;

        if(document.body.classList.contains("darkmode") && chosenPreset !== "scroll-wrapper" && localStorage.getItem("preset") !== `${chosenPreset}`)   // if you click at the edge of the preset you might get target parent if, to be scroll wrapper, so thats why
        {
            document.body.style.setProperty("--gradient-opacity", "0");

            document.querySelectorAll(".customization-presets").forEach((element) => element.classList.remove("selectedPreset"));
            document.getElementById(`${chosenPreset}`).classList.add("selectedPreset");

            setTimeout(() => {
                cleanPreviousPresets();

                document.body.classList.add(`${chosenPreset}-dark`);
                localStorage.setItem("preset", `${chosenPreset}`);

                document.body.style.setProperty("--gradient-opacity", "1");
            }, 200);
        }
        else if(chosenPreset !== "scroll-wrapper" && localStorage.getItem("preset") !== `${chosenPreset}`)
        {   
            document.body.style.setProperty("--gradient-opacity", "0");

            document.querySelectorAll(".customization-presets").forEach((element) => element.classList.remove("selectedPreset"));
            document.getElementById(`${chosenPreset}`).classList.add("selectedPreset");

            setTimeout(() => {
                cleanPreviousPresets();

                document.body.classList.add(chosenPreset);
                localStorage.setItem("preset", `${chosenPreset}`)

                document.body.style.setProperty("--gradient-opacity", "1");
            }, 200);
        }

        function cleanPreviousPresets()
        {
            let availablePresets = [...document.querySelectorAll(".customization-presets")];
            let availablePresetIds = availablePresets.map((element) => element.id);
            let availablePresetIdsDarkMode = availablePresetIds.map((element) => `${element}-dark`);

            document.body.classList.remove(...availablePresetIds);
            document.body.classList.remove(...availablePresetIdsDarkMode);
        }
    }
});