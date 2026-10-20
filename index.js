//Variablen um Filter zu speichern
let filterType = "cat";
let filterValue = null

// Es nimmt ein URL als parameter und gibt die Daten, was es von der URL gekriegt hat in den JSON Format zurück. Alles wartet bis ein Antwort kommt um weiter zu laufen

async function getData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error.message);
  }
} 

//buttons and elements
//Hier werden die verschiedene Elemente die von JavaScript beeinflusst werden in Variablen gespeichert
const filValSelect = document.getElementById("filVal")
const filterTypeSelect = document.getElementById("fil")
const randomMeal = document.getElementById("rand")

const recipeImage = document.getElementById("recipeImage")
const mealName = document.getElementById("name")
const mealCategory = document.getElementById("category")
const mealArea = document.getElementById("area")
const mealTags = document.getElementById("tags")

const ingredientList = document.getElementById("ingredientList")
const instructions = document.getElementById("Instructions")
const yt = document.getElementById("yt")
const instuctionsReader = document.getElementById("instructionsToSpeech")


//Beim Laden vom Website werden die verschiedene Filter Werte vom API genommen
addEventListener("load", async () => {
  const categories = await getData("https://themealdb.com/api/json/v1/1/categories.php")
  categories["categories"].forEach(cat => {
    let newOption = document.createElement("option")
    newOption.value = cat["strCategory"]
    newOption.innerHTML = cat["strCategory"]
    filValSelect.appendChild(newOption)
  });
})

//Es benutzt den "random" API von TheMealDb benutzt und dessen Inhalt durch DOM manipulation angezeigt
async function getRandomRecipe(){
  mealCategory.innerHTML = "Category: "
  mealArea.innerHTML = "Area: "
  mealTags.innerHTML = "Tags: "
  ingredientList.innerHTML = ""
  yt.innerHTML = ""

  let meal;

  let filterLink = filterType === "cat" ? "https://www.themealdb.com/api/json/v1/1/filter.php?c=" : "https://www.themealdb.com/api/json/v1/1/filter.php?a="
  if (filterValue){
    const filteredMealList = await getData(`${filterLink}${filterValue}`)
    let mealId = filteredMealList["meals"][Math.floor(Math.random() * filteredMealList["meals"].length)]["idMeal"]
    meal = await getData(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
  }
  else {
    meal = await getData("https://themealdb.com/api/json/v1/1/random.php")
  }

  const mealData = meal["meals"][0]
  recipeImage.src = mealData["strMealThumb"]
  mealName.innerHTML = mealData["strMeal"]
  mealCategory.innerHTML += mealData["strCategory"]
  mealArea.innerHTML += mealData["strCountry"]
  if (mealData["strTags"]) mealTags.innerHTML += mealData["strTags"]
  else mealTags.innerHTML += "None"

  for (let i = 1; i < 21; i++){
    const ingredient = mealData[`strIngredient${i}`]
    const measurement  = mealData[`strMeasure${i}`]
    if (!ingredient.length) break;
    const liElement = document.createElement("li")
    liElement.innerHTML += `${measurement} ${ingredient} `
    ingredientList.appendChild(liElement)
  }

  let strInstruct = mealData["strInstructions"].replace(/\n\r/g, "\n").replace(/\n/g, "<br>")
  instructions.innerHTML = strInstruct
  console.log(strInstruct.replaceAll("<br>",""))
  puter.ai.txt2speech(strInstruct.replaceAll("<br>",""))
    .then((audio) => {
      instuctionsReader.src = audio
    })

  const ytLink = mealData["strYoutube"]
  const hyperLink = document.createElement("a")
  hyperLink.href = ytLink
  hyperLink.innerHTML = "YouTube video for recipe"
  hyperLink.target = "_blank"
  if (ytLink.length) {
     yt.appendChild(hyperLink)
  }
}

//Führt den getRandomRecipe Funktion durch, wenn der Knopf angeclickt wird
randomMeal.addEventListener("click", async () => await getRandomRecipe())

//Guckt für die Änderung der Werte bei die Selects
filValSelect.addEventListener("change", (e) => {
  filterValue = e.target.value
  if (filterValue === "None") filterValue = null
})

filterTypeSelect.addEventListener("change", async (e) => {
  filterType = e.target.value

  filValSelect.innerHTML = '<option value="None">Select Category</option>'

  if (filterType === "cat") {
    const categories = await getData("https://themealdb.com/api/json/v1/1/categories.php")
    categories["categories"].forEach(cat => {
      let newOption = document.createElement("option")
      newOption.value = cat["strCategory"]
      newOption.innerHTML = cat["strCategory"]
      filValSelect.appendChild(newOption)
  });
  } else{
    const areas = await getData("https://www.themealdb.com/api/json/v1/1/list.php?a=list")
    areas["meals"].forEach(area => {
      let newOption = document.createElement("option")
      newOption.value = area["strCountry"]
      newOption.innerHTML = area["strCountry"]
      filValSelect.appendChild(newOption)
    });
  }
})

