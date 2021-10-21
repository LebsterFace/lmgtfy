const cursor = document.getElementById("cursor");
const searchBar = document.getElementById("search-bar");
const googleSearchButton = document.getElementById("google-search-button");
const imFeelingLuckyButton = document.getElementById("im-feeling-lucky-button");
const searchInput = document.getElementById("search-input");
const googleLogo = document.getElementById("google");

const isSearchBarHovered = () => {
	const cursorBox = cursor.getBoundingClientRect();
	const searchBarBox = searchBar.getBoundingClientRect();
	// Return true if cursor is inside search bar
	return (
		cursorBox.top >= searchBarBox.top &&
		cursorBox.bottom <= searchBarBox.bottom &&
		cursorBox.left >= searchBarBox.left &&
		cursorBox.right <= searchBarBox.right
	);
};

const isSearchButtonHovered = () => {
	const cursorBox = cursor.getBoundingClientRect();
	const googleSearchButtonBox = googleSearchButton.getBoundingClientRect();
	// Return true if cursor is inside search button
	return (
		cursorBox.top >= googleSearchButtonBox.top &&
		cursorBox.bottom <= googleSearchButtonBox.bottom &&
		cursorBox.left >= googleSearchButtonBox.left &&
		cursorBox.right <= googleSearchButtonBox.right
	);
};

const setCursorToSearchBar = () => {
	const searchBarBox = searchBar.getBoundingClientRect();
	const googleSearchButtonBox = googleSearchButton.getBoundingClientRect();

	cursor.style.top = searchBarBox.top + searchBarBox.height / 2 + "px";
	cursor.style.left = googleSearchButtonBox.left + googleSearchButtonBox.width / 2 + "px";
};

const setCursorToSearchButton = () => {
	const googleSearchButtonBox = googleSearchButton.getBoundingClientRect();

	cursor.style.top = googleSearchButtonBox.top + googleSearchButtonBox.height / 2 + "px";
	cursor.style.left = googleSearchButtonBox.left + googleSearchButtonBox.width / 2 + "px";
};

let isSearching = true;
const positionCursor = () => {
	if (isSearching) {
		setCursorToSearchBar();
	} else {
		setCursorToSearchButton();
	}
};

const delays = {
	searchBarLeft: 1800,
	searchBarTop: 1600,
	searchButtonTop: 700
};


const moveToSearchBar = () => {
	cursor.style.transition = `left ${delays.searchBarLeft}ms ease-in-out, top ${delays.searchBarTop}ms ease-in-out`;
	isSearching = true;
	setCursorToSearchBar();

	const interval = setInterval(() => {
		console.log("Checking %cSearch bar", "color: lime");
		if (isSearchBarHovered()) {
			clearInterval(interval);
			cursor.src = "./Text.png";
			searchBar.classList.add("cursor-hovered");
		}
	}, 50);

	return new Promise(resolve => setTimeout(() => {	
		cursor.style.transition = "none";
		resolve();
	}, Math.max(delays.searchBarLeft, delays.searchBarTop)));
};

const movetoSearchButton = () => {
	cursor.style.transition = `top ${delays.searchButtonTop}ms ease-in-out`;
	isSearching = false;
	setCursorToSearchButton();

	const interval = setInterval(() => {
		if (!isSearchBarHovered()) {
			console.log("Checking %cSearch button", "color: lime");
			if (isSearchButtonHovered()) {
				clearInterval(interval);
				cursor.src = "./Link.png";
				googleSearchButton.classList.add("cursor-hovered");
			} else {
				cursor.src = "./Normal.png";
				searchBar.classList.remove("cursor-hovered");
			}
		} else {
			console.log("Checking %cSearch bar", "color: red");
		}
	}, 50);

	return new Promise(resolve => setTimeout(() => {	
		cursor.style.transition = "none";
		resolve();
	}, delays.searchButtonTop));
};

const typeIntoSearchBar = (str, speed) => {
	return new Promise(resolve => {
		const chars = [...str];
		let index = 0;

		const interval = setInterval(() => {
			if (index === chars.length) {
				clearInterval(interval);
				resolve();
			}

			if (chars[index] === " ") {
				searchInput.value += " ";
				index++;
			}

			if (index < chars.length) {
				searchInput.value += chars[index];
				index++;
			}
		}, speed);
	});
};

const query = new URL(window.location.href).searchParams.get("q");
const urlBox = document.getElementById("url");

const generateURL = () => {
	// Change the search bar to a link
	const url = new URL(window.location.href);
	url.search = "";
	url.hash = "";
	url.searchParams.set("q", searchInput.value);

	urlBox.style.display = "initial";
	urlBox.value = url;
	urlBox.select();
	if (!navigator.clipboard) {
		urlBox.focus();
		document.execCommand("copy");
		alert("Copied to clipboard!");
	} else {
		navigator.clipboard.writeText(url).then(() => {
			alert("Copied to clipboard!");
		});
	} 
};

const infoElement = document.getElementById("info");
if (query === null) {
	infoElement.style.display = "none";
	cursor.style.display = "none";
	imFeelingLuckyButton.style.display = "none";
	googleSearchButton.value = "LMGTFY";
	googleSearchButton.ariaLabel = "LMGTFY";
	googleLogo.src = "./LMGTFY.png";

	searchInput.addEventListener("keydown", e => {
		if (e.key === "Enter") {
			e.preventDefault();
			generateURL();
		}
	});

	urlBox.addEventListener("click", generateURL);
	googleSearchButton.addEventListener("click", generateURL);
} else {
	window.addEventListener("resize", positionCursor);
	searchInput.setAttribute("readonly", true);
	(async () => {
		infoElement.textContent = "Step One - Type in your question";
		await moveToSearchBar();
		await typeIntoSearchBar(query, 100);
		infoElement.textContent = "Step Two - Click on the Search button";
		setTimeout(async () => {
			await movetoSearchButton();
			const url = new URL("https://www.google.com/search");
			url.searchParams.set("q", query);
			window.location.href = url.href;
		}, 300);
	})();
}