//Global selections and variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
let initialColors;

//EVENT LISTENERS
sliders.forEach(slider => {
  slider.addEventListener("input", hslControls);
})
colorDivs.forEach((slider,index) => {
  slider.addEventListener('change', () => {
    updateTextUI(index);
  })
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
    initialColors.push(chroma(randomColor).hex());

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

randomColors();