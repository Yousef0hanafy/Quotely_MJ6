const API_URL = "https://quoteslate.vercel.app/api/quotes/random";

// DOM Elements
const quoteEl = document.getElementById("quote");
const authorEl = document.getElementById("author");
const newQuoteBtn = document.getElementById("new-quote");
const fbBtn = document.getElementById("fb-share");
const copyBtn = document.getElementById("copy-quote");
const favoriteBtn = document.getElementById("favorite-quote");
const toggleFavoritesBtn = document.getElementById("toggle-favorites");
const favoritesSection = document.getElementById("favorites-section");
let lastCopied = "";

async function getQuote() {
    try {
        // Start fade-out
        quoteEl.classList.remove("show");
        authorEl.classList.remove("show");

        // Optional: short delay to allow fade-out before updating text
        await new Promise(res => setTimeout(res, 50));
        // Loading state
        quoteEl.innerText = "Loading...";
        authorEl.innerText = "";

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        // Update DOM
        quoteEl.innerText = data.quote || "No quote available.";
        authorEl.innerText = data.author || "Unknown";
        
        // Trigger fade-in
        quoteEl.classList.add("show");
        authorEl.classList.add("show");
    } catch (error) {
        console.error("Error fetching quote:", error);
        quoteEl.innerText = "Failed to load quote. Please try again.";
        authorEl.innerText = "";
    }
}
// On initial load
quoteEl.classList.add("show");
authorEl.classList.add("show");

/* Share the current quote on Facebook */
function shareOnFacebook() {
    const quote = quoteEl.innerText;
    const author = authorEl.innerText;
    const message = encodeURIComponent(`"${quote}" — ${author}`);
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=https://yourwebsite.com&quote=${message}`;
    window.open(fbUrl, "_blank", "width=600,height=400");
}

// Attach event listeners
if (newQuoteBtn) newQuoteBtn.addEventListener("click", getQuote);
if (fbBtn) fbBtn.addEventListener("click", shareOnFacebook);

// Initial quote
getQuote();


// To Add a new Copy-to-Clipboard function
function copyQuote() {
    const quote = quoteEl.innerText;
    const author = authorEl.innerText;
    const textToCopy = `"${quote}" — ${author}`;

     // Check if already copied
    if (textToCopy === lastCopied) {
        Swal.fire({
            icon: 'info',
            title: 'Already Copied!',
            text: 'You already copied this quote.',
            timer: 1500,
            showConfirmButton: false
        });
        return;
    }

    // Copy to clipboard
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
           lastCopied = textToCopy; // Update last copied
            Swal.fire({
                icon: 'success',
                title: 'Copied!',
                text: 'Quote copied to clipboard.',
                timer: 1500,
                showConfirmButton: false
            });
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: 'Failed to copy the quote.',
            });
            console.error("Failed to copy:", err);
        });
}

// Attach click event
if (copyBtn) copyBtn.addEventListener("click", copyQuote);

// To Add Favotie Quotes **
// Get favorites from localStorage or create empty array
function getFavorites(){
    const favorites = localStorage.getItem("favorites");
    return favorites ? JSON.parse(favorites) : [];
}
// Save favorites array to localStorage
function saveFavorites(favorites){
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Add current quote to favorites
function addFavorite() {
    if (!quoteEl || !authorEl) return;

    const currentQuote = {
        quote: quoteEl.innerText,
        author: authorEl.innerText
    };

    const favorites = getFavorites();

    if (favorites.some(fav => fav.quote === currentQuote.quote)) {
        Swal.fire({
            icon: 'info',
            title: 'Already Added!',
            timer: 1500,
            showConfirmButton: false
        });
        return;
    }

    favorites.push(currentQuote);
    saveFavorites(favorites);

    renderFavorites(); // 🔥 THIS was missing

    Swal.fire({
        icon: 'success',
        title: 'Added!',
        timer: 1200,
        showConfirmButton: false
    });
}

// Attach click event
if (favoriteBtn) favoriteBtn.addEventListener("click", addFavorite);

//To display all favorite quotes:
function renderFavorites() {
    const favoritesList = document.getElementById("favorites-list");
    if (!favoritesList) return;

    const favorites = getFavorites();
    favoritesList.innerHTML = "";

    favorites.forEach(fav => {
        const li = document.createElement("li");
        li.classList.add("favorite-item");

        const textSpan = document.createElement("span");
        textSpan.innerText = `"${fav.quote}" — ${fav.author}`;

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("remove-fav-btn");
        removeBtn.innerHTML = '<img src="images/recycle-bin.png" alt="Remove icon">';

        removeBtn.addEventListener("click", () => {
            const updatedFavorites = favorites.filter(
                item => item.quote !== fav.quote
            );
            saveFavorites(updatedFavorites);
            renderFavorites();
        });

        li.appendChild(textSpan);
        li.appendChild(removeBtn);
        favoritesList.appendChild(li);
    });
}

if (toggleFavoritesBtn && favoritesSection) {
    toggleFavoritesBtn.addEventListener("click", () => {
        const isVisible = favoritesSection.style.display === "block";

        favoritesSection.style.display = isVisible ? "none" : "block";
        toggleFavoritesBtn.innerText = isVisible
            ? "Show Favorites"
            : "Hide Favorites";

        if (!isVisible) {
            renderFavorites();
        }
    });
}
document.addEventListener("DOMContentLoaded", renderFavorites);