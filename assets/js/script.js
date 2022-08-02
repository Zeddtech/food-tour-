const categories = "https://www.themealdb.com/api/json/v1/1/list.php?c=list";
const byname = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
const getmealbycat = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
const mealinfo = document.querySelector(".mealinfo");
async function getDataDb(link, term) {
  const resp = await fetch(`${link}${term}`);
  if (resp.status !== 200) {
    throw new Error("SOMETHING WENT WRONG");
  }
  const data = await resp.json();
  return data;
}

getDataDb(categories)
  .then((category) => {
    const btntext = category.meals
      .map(function (bt) {
        return `<button class="button-73" role="button" data-id=${bt.strCategory}><span class="button__text">   ${bt.strCategory}</span</button>`;
      })
      .join("");
    btnContainer.innerHTML = btntext;
    btnmethod();
  })
  .catch((err) => console.log("reject" + err.message));

const articleContainer = document.querySelector(".articles");
const btnContainer = document.querySelector(".btns");
const loader = document.querySelector(".load");
const body = document.querySelector("body");

function loadmeals() {
  getDataDb(getmealbycat, "Breakfast")
    .then(async (meal) => {
      await rendermeals(meal);
      loader.classList.add("hideload");
    })
    .catch((err) => console.log("reject" + err.message));
}

loadmeals();

function btnmethod() {
  const buttons = document.querySelectorAll(".button-73");

  buttons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      buttons.forEach((btn) => {
        btn.classList.remove("button--loading");
        btn.classList.remove("active-btn");
      });

      this.classList.add("button--loading");
      this.classList.add("active-btn");
      //geting the dataid of the clicked btn
      const data_id = e.currentTarget.dataset.id;
      getDataDb(getmealbycat, data_id).then((meal) => {
        this.classList.remove("button--loading");
        rendermeals(meal);
      });
    });
  });
}

 async function rendermeals(meal) {
  let area;
  const allmeals =  meal.meals
  .map(async function (mealel) {
    const area= await getDataDb(byname, mealel.strMeal).then( (data) => {
     return data.meals[0].strArea;
    });
    
    
      let content = ` <article  class="article"><div class="imgcon">
    <img src="${mealel.strMealThumb}" alt="${mealel.strMeal}" class="img " loading="lazy" />
    <span data-id="${mealel.strMeal}"class="get-recipe-btn">click here to get recipe</span>
    </div>
    <div class="info">
    <div class="artheader">
    <h4 class="food-name">${mealel.strMeal}</h4>
    <h4 class="food-amount">${area}</h4>
    </div>
    </div>
  </article>`;
      return content;
    })
    ;
    const resolvedcContent=await Promise.all(allmeals);
    articleContainer.innerHTML = resolvedcContent.join("");
    
    getrecipe();
}

function getrecipe() {
  const recipeBtns = document.querySelectorAll(".get-recipe-btn");
  let arry = [];
  recipeBtns.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const data_id = e.currentTarget.dataset.id;
      arry = [];

      mealinfo.innerHTML = "";
      mealinfo.classList.add("displayinfo");
      mealinfo.classList.add("loader2");
      mealinfo.innerHTML = ` 
      <button class="close">x</button>
      <span class="loader"></span>`;
      body.classList.add("staticbody");
      createMealInfoCloseBtn();

      getDataDb(byname, data_id)
        .then((data) => {
          renderrecipe(data, arry);
          createMealInfoCloseBtn();
        })
        .catch((err) => {
          rmclass();
          mealinfo.innerHTML = "";
          renderFetchrecipeError(data_id);

          createMealInfoCloseBtn();
        });
    });
  });
}

function renderrecipe(data, arry) {
  for (let i = 1; i < 20; i++) {
    const ingredients = data.meals[0][`strIngredient${i}`];
    const measure = data.meals[0][`strMeasure${i}`];

    if (ingredients) {
      arry.push(`${ingredients} - ${measure}`);
    } else {
      break;
    }
  }
  rmclass();

  mealinfo.innerHTML = `
<button class="close">x</button>
<article class="article">
<img
  src="${data.meals[0].strMealThumb}"
  alt="${data.meals[0].strMeal}"
  class="img"
/>

<div class="info">
  <div class="artheader">
    <h4 class="food-name">${data.meals[0].strMeal}</h4>
    <h4 class="food-amount">${data.meals[0].strArea}</h4>
  </div>
  <div class="artinfo">
  <h2>instructions</h2>
    <p class="meal-info">${data.meals[0].strInstructions}</p>
    <h3>ingredients</h3>
    <ul class="ingredient">${arry.map((ing) => `<li>${ing}</li>`).join("")}</ul>
  </div>
</div>
</article>`;
}
function createMealInfoCloseBtn() {
  document.querySelector(".close").addEventListener("click", () => {
    rmclass();
    mealinfo.classList.remove("displayinfo");
    body.classList.remove("staticbody");
  });
}

function rmclass() {
  if (mealinfo.classList.contains("failed")) {
    mealinfo.classList.remove("failed");
  }
  if (mealinfo.classList.contains("loader2")) {
    mealinfo.classList.remove("loader2");
  }
}
function renderFetchrecipeError(id) {
  mealinfo.innerHTML = "";
  mealinfo.innerHTML = `                           
  <button class="close">x</button>
  <div class="error-recipe">
  <p>sorry something went wrong please check your internet connection and try again </p>
  <button data-id="${id}"class="get-recipe-btn">Retry </button>
</div>`;
  mealinfo.classList.add("failed");
  getrecipe();
}
document.querySelector(".date").textContent = new Date().getFullYear();
