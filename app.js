//Global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const lockButton = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors;
// for local storage
let savedPalettes = [];

//EVENT LISTENERS
generateBtn.addEventListener('click', randomColors);
lockButton.forEach((button, index) => {
  button.addEventListener('click', () => {
    lockColor(index);
  });
});
sliders.forEach(slider => {
  slider.addEventListener("input", hslControls);
})
colorDivs.forEach((slider,index) => {
  slider.addEventListener('change', () => {
    updateTextUI(index);
  })
})
currentHexes.forEach(hex => {
  hex.addEventListener('click', () => {
    copyToClipboard(hex);
  })
})
popup.addEventListener('transitionend', () => {
  const popupBox = popup.children[0];
  popup.classList.remove('active');
  popupBox.classList.remove('active');
})
adjustButton.forEach((button,index) => {
  button.addEventListener('click', () => {
    openAdjustmentPanel(index);
  })
})
closeAdjustments.forEach((button, index) => {
  button.addEventListener('click', () => {
    closeAdjustmentPanel(index);
  });
})


//Functions

//COLOR GENERATOR

function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}


// // Manually generate random colors
// function generateHex() {
//   const letters = '0123456789ABCDEF';
//   let hash = '#';
//   //for loop, runs until there i=6 giving six values
//   for(let i = 0; i < 6; i++){
//     //+=(addition assignment)Math.Floor(rounds down)Math.radom(random number between 0 and 1)
//     hash += letters[Math.floor(Math.random() * 16)];
//   }
//   return hash;
//   }


function randomColors() {
  //initail colors is a blank array
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    //add it to the array
    if(div.classList.contains('locked')){
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }

    //Add the color to the bg
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    //check for contrast
    checkTextContrast(randomColor, hexText)
    //initialise colorize sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  //reset inputs
  resetInputs()
  //check for contrast on buttons
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  })
}

//CHECK TEXT CONTRAST
function checkTextContrast(color,text) {
  const luminance = chroma(color).luminance();
  //where bg color luminace is high set text color to black
  if(luminance > 0.5){
    text.style.color = "black";
    
  //where bg color luminace is low set text color to white
  } else {
    text.style.color = "white";
  }
}

//COLORIZE SLIDERS
function colorizeSliders(color, hue, brightness, saturation) {
  //scale saturation
  const noSat = color.set('hsl.s', 0);
  const fullSat = color.set('hsl.s', 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  //scale brightness
  const midBright = color.set('hsl.l', 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //update input colors
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e){
  //find index of div using the data attribute specified in the input html
  const index = 
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue") ;

  //target the parent element of selected input and use it to select all relevant inputs
  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  //first child
  const hue = sliders[0];
  //second child
  const brightness = sliders[1];
  //third child
  const saturation = sliders[2];

  //select the text from the H2 of the color div
  const bgColor = initialColors[index];

  //set the saturation, brightness and hue
  let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);

  //apply the background color
  colorDivs[index].style.backgroundColor = color;

  //colorize sliders/inputs
  colorizeSliders(color, hue, brightness, saturation)
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector('h2')
  const icons = activeDiv.querySelectorAll('.controls button');
  textHex.innerText = color.hex();
  //check contrast
  checkTextContrast(color, textHex);
  for(icon of icons){
    checkTextContrast(color, icon)
  }
}

function resetInputs() {
  const sliders = document.querySelectorAll('.sliders input');
  sliders.forEach(slider => {
    if(slider.name === 'hue') {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0]
      slider.value = Math.floor(hueValue)
    }
    if(slider.name === 'brightness') {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2]
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if(slider.name === 'saturation') {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1]
      slider.value = Math.floor(satValue * 100) / 100;
    }
  })
}

function copyToClipboard(hex) {
  const el = document.createElement('textarea');
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  //Pop up animation
  const popupBox = popup.children[0];
  popup.classList.add('active')
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle('active');
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove('active');
}
function lockColor(index) {
  colorDivs[index].classList.toggle('locked');
  lockButton[index].children[0].classList.toggle('fa-lock-open');
  lockButton[index].children[0].classList.toggle('fa-lock');
}

//
//IMPLEMENT SAVE TO LOCAL STORAGE
//
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

//event listeners
saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener('click', savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);


//functions
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add('active');
  popup.classList.add('active');

}
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove('active');
  popup.classList.remove('active');
}
function savePalette(e) {
  //close the popup
  saveContainer.classList.remove('active');
  popup.classList.remove('active');
  //save name and colors
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach(hex => {
    colors.push(hex.innerText);
  });



  //Generate Object
  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
  if(paletteObjects) {
    paletteNr = paletteObjects.length;
  } else {
    paletteNr = savedPalettes.length
  }


  //create object form name colours and number
  const paletteObj = {name, colors, nr: paletteNr };
  //push to saved pallets
  savedPalettes.push(paletteObj);
  //save to local storage
  savetoLocal(paletteObj);
  //clear input display
  saveInput.value = "";

  //Generate the palette for library
  const palette = document.createElement('div');
  palette.classList.add('custom-palette');
  const title = document.createElement('h4');
  title.innerText = paletteObj.name;
  const preview = document.createElement('div');
  preview.classList.add('small-preview');
  paletteObj.colors.forEach(smallColor => {
    const smallDiv = document.createElement('div');
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement('button');
  paletteBtn.classList.add('pick-palette-btn');
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  //attach event to the btn
  paletteBtn.addEventListener('click', e => {
    closeLibrary();
    //find the index using which was given to the button as a class
    const paletteIndex = e.target.classList[1];
    //clear the initial colors
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  })


  //append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}

function savetoLocal(paletteObj) {
  let localPalettes;
  //if no pallets exist create an empty array
  if(localStorage.getItem('palettes') === null){
    localPalettes = [];
    //else retrieve pallets and parse
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"))
  }
  //push new pallet
  localPalettes.push(paletteObj);
  //set to local storage
  localStorage.setItem('palettes', JSON.stringify(localPalettes));
}
function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add('active');
  popup.classList.add('active');
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove('active');
  popup.classList.remove('active');
}
function getLocal() {
  if(localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    savedPalettes = [...paletteObjects];
    paletteObjects.forEach(paletteObj => {
      //Generate the palette for library
      const palette = document.createElement('div');
      palette.classList.add('custom-palette');
      const title = document.createElement('h4');
      title.innerText = paletteObj.name;
      const preview = document.createElement('div');
      preview.classList.add('small-preview');
      paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement('button');
      paletteBtn.classList.add('pick-palette-btn');
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";

      //attach event to the btn
      paletteBtn.addEventListener('click', e => {
        closeLibrary();
        //find the index using which was given to the button as a class
        const paletteIndex = e.target.classList[1];
        //clear the initial colors
        initialColors = [];
        paletteObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      })


      //append to library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryContainer.children[0].appendChild(palette);
    })
  }
}


getLocal();
randomColors();

// localStorage.clear();