const ingredients = []; // Start with an empty array
const ingredientsContainer = document.getElementById("ingredients-container");
const cookingPot = document.getElementById("cooking-pot");
const recipesContainer = document.getElementById("recipes-container");
const videosContainer = document.getElementById("videos-container");

const spoonacularApiKey = "b51609a0be4745c7be41384c0a7d7705";
const youtubeApiKey = "AIzaSyCCvtRuwBxay86gtnGd1EHE7yajscI5DvE"; 

// Function to fetch ingredient suggestions from Spoonacular API
async function fetchIngredientSuggestions(query) {
    const url = `https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&number=10&apiKey=${spoonacularApiKey}`;
    try {
        console.log("Fetching ingredient suggestions from:", url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ingredients. Status: ${response.status}`);
        const data = await response.json();
        console.log("Ingredient Suggestions Response:", data);
        return data;
    } catch (error) {
        console.error("Error fetching ingredient suggestions:", error);
        return [];
    }
}

// Function to display suggestions
function displaySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById("ingredient-suggestions");
    suggestionsContainer.innerHTML = ""; // Clear existing suggestions

    if (suggestions.length > 0) {
        suggestions.forEach((suggestion, index) => {
            const suggestionDiv = document.createElement("div");
            suggestionDiv.classList.add("suggestion-item");
            suggestionDiv.setAttribute("data-index", index);

// Display image and name of the item from the API
            suggestionDiv.innerHTML = `
                <img src="https://spoonacular.com/cdn/ingredients_100x100/${suggestion.image}" alt="${suggestion.name}" style="width: 30px; height: 30px; margin-right: 10px;"/>
                ${suggestion.name}
            `;
            suggestionDiv.addEventListener("click", () => {
                addIngredient(suggestion.name); // Add ingredient
                document.getElementById("custom-ingredient").value = ""; // Clear input field
                suggestionsContainer.innerHTML = "";
            });

            suggestionsContainer.appendChild(suggestionDiv);
        });

        suggestionsContainer.style.display = "block";
    } else {
        suggestionsContainer.style.display = "none";
    }
}

// For Custom Ingredient
function addIngredient(ingredient) {
    if (!ingredients.includes(ingredient)) {
        ingredients.push(ingredient);
        displayIngredients();
    } else {
        alert("Ingredient already added! 🥄"); // Fun alert if ingredient already added
    }
}

// Display Ingredients in the container div
function displayIngredients() {
    ingredientsContainer.innerHTML = ""; // Clear container before displaying updated list of ingredients
    ingredients.forEach(ingredient => {
        const ingredientDiv = document.createElement("div");
        ingredientDiv.textContent = ingredient;
        ingredientDiv.classList.add("ingredient");

        // Set up drag-and-drop for the ingredient
        ingredientDiv.setAttribute("draggable", true);
        ingredientDiv.addEventListener("dragstart", handleDragStart);

        ingredientsContainer.appendChild(ingredientDiv);
    });
}

// D&D Handling
function handleDragStart(event) {
    event.dataTransfer.setData("text", event.target.textContent);
}

cookingPot.addEventListener("dragover", (event) => event.preventDefault());
cookingPot.addEventListener("drop", (event) => {
    const ingredient = event.dataTransfer.getData("text");
    if (ingredient && !Array.from(cookingPot.children).some(child => child.dataset.name === ingredient)) {
        addIngredientToPot(ingredient);
    }
});

// Add ingredient to the cooking pot
function addIngredientToPot(ingredient) {
    const ingredientDiv = document.createElement("div");
    ingredientDiv.classList.add("ingredient-in-pot");
    ingredientDiv.dataset.name = ingredient;

    ingredientDiv.innerHTML = `
        <span>${ingredient}</span>
        <button class="delete-button">X</button>
    `;
// Delete button 
    const deleteButton = ingredientDiv.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => {
        cookingPot.removeChild(ingredientDiv);
    });

    cookingPot.appendChild(ingredientDiv);
}

// Auto-suggest input listener
const inputField = document.getElementById("custom-ingredient");
let activeIndex = -1; // Track the active suggestion index
inputField.addEventListener("input", async () => {
    const query = inputField.value.trim();
    if (query) {
        const suggestions = await fetchIngredientSuggestions(query); // Fetch from API
        displaySuggestions(suggestions); // Show suggestions
    } else {
        document.getElementById("ingredient-suggestions").style.display = "none"; // Hide suggestions if no input
    }
});

// keyboard navigation
inputField.addEventListener("keydown", (event) => {
    const suggestionsContainer = document.getElementById("ingredient-suggestions");
    const suggestionItems = suggestionsContainer.querySelectorAll(".suggestion-item");
    if (event.key === "ArrowDown") {
        if (activeIndex < suggestionItems.length - 1) {
            activeIndex++;
        } else {
            activeIndex = 0; 
        }
        highlightSuggestion(suggestionItems);
        event.preventDefault();
    }
    if (event.key === "ArrowUp") {
        if (activeIndex > 0) {
            activeIndex--;
        } else {
            activeIndex = suggestionItems.length - 1; // Loop to the last option
        }
        highlightSuggestion(suggestionItems);
        event.preventDefault();
    }
    if (event.key === "Enter" && activeIndex >= 0 && activeIndex < suggestionItems.length) {
        const selectedIngredient = suggestionItems[activeIndex].textContent.trim();
        addIngredient(selectedIngredient);
        suggestionsContainer.innerHTML = "";
        event.preventDefault();
    }
});

//highlight the selected(active suggestion)
function highlightSuggestion(suggestions) {
    suggestions.forEach((item, index) => {
        if (index === activeIndex) {
            item.style.backgroundColor = "#56b397"; 
            item.style.color = "#fff";
        } else {
            item.style.backgroundColor = ""; 
            item.style.color = "";
        }
    });
}

// Fetch Recipes from Spoonacular API
document.getElementById("fetch-recipes-btn").addEventListener("click", async () => {
    const selectedIngredients = Array.from(cookingPot.children).map(div => div.dataset.name).join(",");
    if (!selectedIngredients) {
        recipesContainer.innerHTML = "<p>Please add ingredients to the cooking pot first! 🍲</p>";
        return;
    }

    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${selectedIngredients}&apiKey=${spoonacularApiKey}`;
    try {
        const response = await fetch(url);
        const recipes = await response.json();
        if (recipes.length === 0) {
            recipesContainer.innerHTML = "<p>No recipes found for the selected ingredients. 😔</p><img src='https://media.giphy.com/media/1Xc0K8DcnOZMG/giphy.gif' alt='no recipe found' />";
        } else {
            recipesContainer.innerHTML = recipes.map(recipe => `
                <div class="recipe-card">
                    <h3>${recipe.title} 🍴</h3>
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <a href="https://spoonacular.com/recipes/${recipe.title}-${recipe.id}" target="_blank">View Recipe</a>
                </div>
            `).join("");
        }
    } catch (error) {
        recipesContainer.innerHTML = "<p>Failed to fetch recipes. Please try again later. 😞</p>";
    }

    // Fetch YouTube videos related to the ingredients
    fetchYouTubeVideos(selectedIngredients).then(videos => {
        displayYouTubeVideos(videos);
    });
});

// Fetching Utube Videos
async function fetchYouTubeVideos(query) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}+recipe&type=video&key=${youtubeApiKey}&maxResults=5`;
    console.log("YouTube API URL:", url); // Debug
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log("YouTube API Response:", data); // Debug
        return data.items || []; // Ensure items are returned
    } catch (error) {
        console.error("Error fetching YouTube videos:", error);
        return [];
    }
}
// Display videos
function displayYouTubeVideos(videos) {
    videosContainer.innerHTML = ""; 
    console.log("Videos fetched: ", videos); 
    if (videos.length > 0) {
        videos.forEach(video => {
            const videoDiv = document.createElement("div");
            videoDiv.classList.add("video-card");

            videoDiv.innerHTML = `
                <iframe 
                    width="300" 
                    height="180" 
                    src="https://www.youtube.com/embed/${video.id.videoId}" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
                <h4>${video.snippet.title} 🎥</h4>
            `;
            videosContainer.appendChild(videoDiv);
        });
    } else {
        videosContainer.innerHTML = "<p>No videos found for the selected ingredients. 😞</p>";
    }
}
document.getElementById('menu-toggle-btn').addEventListener('click', function() {
    const menu = document.querySelector('.menu-options');
    menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'flex' : 'none';
});