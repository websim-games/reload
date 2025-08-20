import { GG_ALL_GAME_CONFIG } from "./config.js";
import { saveGame, loadGame } from "./saveLoad.js";

const FAKE_RELOAD_TIME = 800;

function initializeTopMenu() {
	const topMenu = document.getElementById("top-menu");
	const topMenuButtons = document.querySelectorAll(".top-menu-button");
	topMenuButtons.forEach((topMenuButton) => {
		const sectionId = topMenuButton.dataset.sectionId;
		switch (sectionId) {
			case "luck-upgrades":
				if (gameState.mechanics.rebirth.count >= 2) {
					topMenuButton.classList.remove("hidden");
				} else {
					topMenuButton.classList.add("hidden");
				}
				break;
			case "rebirth":
				if (gameState.mechanics.rebirth.unlocked || gameState.currency.coins >= 800) {
					gameState.mechanics.rebirth.unlocked = true;
					topMenuButton.classList.remove("hidden");
				} else {
					topMenuButton.classList.add("hidden");
				}
				break;
			default:
				topMenuButton.classList.remove("hidden");
				break;
		}
	});
	topMenu.classList.remove("hidden");
}

function initializeShop() {
	const upgradesContainer = document.getElementById("upgradesContainer");
	upgradesContainer.innerHTML = "";
	GG_ALL_GAME_CONFIG.upgrades.forEach((upgrade, index) => {
		if (gameState.mechanics.rebirth.count < upgrade.rebirthsToUnlock) {
			return;
		}
		const baseIncrement = (upgrade.increment * gameState.currency.coinsPerReloadMultiplier).toLocaleString("en-US");
		const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.normal[index]).toLocaleString("en-US");
		// Create the main container
		const upgradeDiv = document.createElement("div");
		upgradeDiv.className = "section-row upgrade";
		// Create the text container
		const textDiv = document.createElement("div");
		const tierText = document.createElement("div");
		tierText.textContent = `Tier ${index + 1} Upgrade`;
		const incrementText = document.createElement("div");
		incrementText.textContent = `+${baseIncrement}$ per reload`;
		// Create the button
		const upgradeButton = document.createElement("button");
		upgradeButton.id = `upgrade-button-${index}`;
		upgradeButton.className = "upgrade-button";
		upgradeButton.textContent = `Cost: ${upgradeCost}$`;
		// Add event listener
		upgradeButton.addEventListener("click", () => buyUpgrade(index));
		// Append everything
		textDiv.appendChild(tierText);
		textDiv.appendChild(incrementText);
		upgradeDiv.appendChild(textDiv);
		upgradeDiv.appendChild(upgradeButton);
		upgradesContainer.appendChild(upgradeDiv);
	});
}

function initializeLuckUpgrades() {
	const luckUpgradesContainer = document.getElementById("luckUpgradesContainer");
	luckUpgradesContainer.innerHTML = "";
	GG_ALL_GAME_CONFIG.luckUpgrades.forEach((upgrade, index) => {
		if (gameState.mechanics.rebirth.count < upgrade.rebirthsToUnlock) {
			return;
		}
		if (!gameState.mechanics.criticalReload.unlocked && (upgrade.id === "chance" || upgrade.id === "multiplier")) {
			return;
		}
		const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.luck[index]).toLocaleString("en-US");
		// Create the main container
		const upgradeDiv = document.createElement("div");
		upgradeDiv.className = "section-row upgrade";
		// Create the text container
		const textDiv = document.createElement("div");
		const nameText = document.createElement("div");
		nameText.textContent = upgrade.name;
		const descriptionText = document.createElement("div");
		descriptionText.id = `luckUpgradeDescription${index + 1}`;
		descriptionText.textContent = upgrade.description;
		// Create the button
		const upgradeButton = document.createElement("button");
		upgradeButton.id = `luckUpgrade${index + 1}`;
		upgradeButton.className = "luck-upgrade-button";
		upgradeButton.textContent = `Cost: ${upgradeCost}$`;
		// Add event listener
		upgradeButton.addEventListener("click", () => buyLuckUpgrade(index));
		// Append everything
		textDiv.appendChild(nameText);
		textDiv.appendChild(descriptionText);
		upgradeDiv.appendChild(textDiv);
		upgradeDiv.appendChild(upgradeButton);
		luckUpgradesContainer.appendChild(upgradeDiv);
	});
}

function initializeRebirthUpgrades() {
	const rebirthContainer = document.getElementById("rebirthContainer");
	rebirthContainer.innerHTML = "";
	GG_ALL_GAME_CONFIG.rebirthUpgrades.forEach((upgrade, index) => {
		if (gameState.mechanics.rebirth.count < upgrade.rebirthsToUnlock) {
			return;
		}
		const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.rebirth[index]);
		// Create the main container
		const upgradeDiv = document.createElement("div");
		upgradeDiv.className = "section-row upgrade";
		// Create the text container
		const textDiv = document.createElement("div");
		const nameText = document.createElement("div");
		nameText.textContent = upgrade.name;
		const descriptionText = document.createElement("div");
		descriptionText.id = `rebirthUpgradeDescription${index + 1}`;
		descriptionText.textContent = upgrade.description(gameState);
		// Create the button
		const upgradeButton = document.createElement("button");
		upgradeButton.id = `rebirthUpgrade${index + 1}`;
		upgradeButton.className = "rebirth-upgrade-button";
		upgradeButton.textContent = `Cost: ${upgradeCost.toLocaleString("en-US")}${upgrade.costCurrency}`;
		// Add event listener
		upgradeButton.addEventListener("click", () => buyRebirthUpgrade(index));
		// Append everything
		textDiv.appendChild(nameText);
		textDiv.appendChild(descriptionText);
		upgradeDiv.appendChild(textDiv);
		upgradeDiv.appendChild(upgradeButton);
		rebirthContainer.appendChild(upgradeDiv);
	});
}

function initializeAchievements() {
	const achievementsContainer = document.getElementById("achievementsContainer");
	achievementsContainer.innerHTML = "";
	GG_ALL_GAME_CONFIG.achievements.forEach((achievement, index) => {
		// Create the main container
		const achievementDiv = document.createElement("div");
		achievementDiv.id = `achievementDiv${index + 1}`;
		achievementDiv.className = "section-row achievement";
		// Create the text container
		const textDiv = document.createElement("div");
		const nameText = document.createElement("div");
		const completed = gameState.achievements[index] ? "✅" : "❌";
		nameText.textContent = `${achievement.name} ${completed}`;
		const descriptionText = document.createElement("div");
		descriptionText.id = `achievementDescription${index + 1}`;
		descriptionText.textContent = achievement.description;
		// Append everything
		textDiv.appendChild(nameText);
		textDiv.appendChild(descriptionText);
		achievementDiv.appendChild(textDiv);
		achievementsContainer.appendChild(achievementDiv);
	});
}

function updateScore() {
	const baseIncrement = gameState.currency.coinsPerReload * gameState.currency.coinsPerReloadMultiplier;
	document.getElementById("coins").textContent = `${gameState.currency.coins.toLocaleString("en-US")}$`;
	document.getElementById("increment").textContent = `${baseIncrement.toLocaleString("en-US")}$ per reload`;
	updateUpgradeButtons();
	updateAchievements();
	initializeAchievements();
}

function updateAchievements() {
	GG_ALL_GAME_CONFIG.achievements.forEach((achievement, index) => {
		gameState.achievements[index] = achievement.requirement(gameState);
	});
}

function updateUpgradeButtons() {
	// upgrades
	const upgradeButtons = document.querySelectorAll(".upgrade-button");
	upgradeButtons.forEach((button, index) => {
		const upgrade = GG_ALL_GAME_CONFIG.upgrades[index];
		const maxLevel = upgrade.max_level;
		const maxLevelReached = gameState.upgrades.normal[index] >= maxLevel;
		const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.normal[index]);
		button.disabled = gameState.currency.coins < upgradeCost;
		if (maxLevelReached) {
			button.disabled = true;
			switch (maxLevel) {
				case 0:
					button.textContent = "Not implemented";
					break;
				case 1:
					button.textContent = "Unlocked";
					break;
				default:
					button.textContent = "Max level";
					break;
			}
		} else {
			button.textContent = `Cost: ${upgradeCost.toLocaleString("en-US")}$`;
		}
	});
	// luckUpgrades
	const luckUpgradeButtons = document.querySelectorAll(".luck-upgrade-button");
	luckUpgradeButtons.forEach((button, index) => {
		const upgrade = GG_ALL_GAME_CONFIG.luckUpgrades[index];
		const maxLevel = GG_ALL_GAME_CONFIG.luckUpgrades[index].max_level;
		const maxLevelReached = gameState.upgrades.luck[index] >= maxLevel;
		const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.luck[index]);
		button.disabled = gameState.currency.coins < upgradeCost;
		if (maxLevelReached) {
			button.disabled = true;
			switch (maxLevel) {
				case 0:
					button.textContent = "Not implemented";
					break;
				case 1:
					button.textContent = "Unlocked";
					break;
				default:
					button.textContent = "Max level";
					break;
			}
		} else {
			button.textContent = `Cost: ${upgradeCost.toLocaleString("en-US")}$`;
		}
		const upgradeDiv = document.getElementById(`luckUpgradeDiv${index + 1}`);
		if (gameState.mechanics.criticalReload.unlocked) {
			upgradeDiv.style.display = "flex";
		}
		const upgradeDescription = document.getElementById(`luckUpgradeDescription${index + 1}`);
		upgradeDescription.textContent = upgrade.description(gameState);
	});
	// rebirthUpgrades
	const rebirthUpgradeButtons = document.querySelectorAll(".rebirth-upgrade-button");
	rebirthUpgradeButtons.forEach((button, index) => {
		const upgrade = GG_ALL_GAME_CONFIG.rebirthUpgrades[index];
		const maxLevel = upgrade.max_level;
		const maxLevelReached = gameState.upgrades.rebirth[index] >= maxLevel;
		const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.rebirth[index]);
		if (maxLevelReached) {
			button.disabled = true;
			switch (maxLevel) {
				case 0:
					button.textContent = "Not implemented";
					break;
				case 1:
					button.textContent = "Unlocked";
					break;
				default:
					button.textContent = "Max level";
					break;
			}
		} else {
			button.textContent = `Cost: ${upgradeCost.toLocaleString("en-US")}${upgrade.costCurrency}`;
			button.disabled = upgrade.id === "rebirth" ? gameState.currency.coins < upgradeCost : gameState.currency.bitcoins < upgradeCost;
		}
		const upgradeDescription = document.getElementById(`rebirthUpgradeDescription${index + 1}`);
		upgradeDescription.textContent = upgrade.description(gameState);
	});
}

function buyUpgrade(upgradeIndex) {
	const upgrade = GG_ALL_GAME_CONFIG.upgrades[upgradeIndex];
	const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.normal[upgradeIndex]);
	if (gameState.currency.coins < upgradeCost) return;
	gameState.currency.coins -= upgradeCost;
	gameState.currency.coinsPerReload += upgrade.increment;
	gameState.upgrades.normal[upgradeIndex]++;
	document.getElementById(`upgrade-button-${upgradeIndex}`).textContent = `Cost: ${upgradeCost.toLocaleString("en-US")}$`;
	updateScore();
	saveGame(gameState);
}

function buyLuckUpgrade(upgradeIndex) {
	const upgrade = GG_ALL_GAME_CONFIG.luckUpgrades[upgradeIndex];
	const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.luck[upgradeIndex]);
	if (gameState.currency.coins < upgradeCost) return;
	gameState.currency.coins -= upgradeCost;
	switch (upgrade.id) {
		case "unlock":
			gameState.mechanics.criticalReload.unlocked = true;
			gameState.mechanics.criticalReload.chance = 0.05;
			gameState.mechanics.criticalReload.multiplier = 2;
			break;
		case "chance":
			gameState.mechanics.criticalReload.chance = Math.round((gameState.mechanics.criticalReload.chance + 0.01) * 100) / 100;
			break;
		case "multiplier":
			gameState.mechanics.criticalReload.multiplier = Math.round((gameState.mechanics.criticalReload.multiplier + 0.5) * 10) / 10;
			break;
	}
	gameState.upgrades.luck[upgradeIndex]++;
	document.getElementById(`luckUpgrade${upgradeIndex + 1}`).textContent = `Cost: ${upgradeCost.toLocaleString("en-US")}$`;
	saveGame(gameState);
	updateScore();
}

function buyRebirthUpgrade(upgradeIndex) {
	const upgrade = GG_ALL_GAME_CONFIG.rebirthUpgrades[upgradeIndex];
	if (upgrade.id === "rebirth") {
		const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.rebirth[upgradeIndex]);
		if (gameState.currency.coins < upgradeCost) return;
		doRebirth();
		return;
	}
	const upgradeCost = Math.round(upgrade.baseCost * upgrade.costIncrease ** gameState.upgrades.rebirth[upgradeIndex]);
	if (gameState.currency.bitcoins < upgradeCost) return;
	gameState.currency.bitcoins -= upgradeCost;
	gameState.upgrades.rebirth[upgradeIndex]++;
	switch (upgrade.id) {
		case "bitcoins-per-rebirth":
			gameState.currency.bitcoinsPerRebirth += 1;
			break;
		case "profit-multiplier":
			gameState.currency.coinsPerReloadMultiplier += 1;
			break;
	}
	saveGame(gameState);
	updateScore();
}

function doRebirth() {
	gameState.upgrades.rebirth[0]++;
	gameState = {
		...gameState,
		currency: {
			...gameState.currency,
			coins: 0,
			coinsPerReload: 1,
		},
		mechanics: {
			criticalReload: {
				unlocked: false,
				chance: 0,
				multiplier: 1,
			},
			rebirth: {
				...gameState.mechanics.rebirth,
				count: gameState.mechanics.rebirth.count + 1,
			},
		},
		upgrades: {
			...gameState.upgrades,
			normal: Array(GG_ALL_GAME_CONFIG.upgrades.length).fill(0),
			luck: Array(GG_ALL_GAME_CONFIG.luckUpgrades.length).fill(0),
		},
		currency: {
			...gameState.currency,
			coins: 0,
			coinsPerReload: 1,
			bitcoins: gameState.currency.bitcoins + gameState.currency.bitcoinsPerRebirth,
		},
	};
	saveGame(gameState);
	updateScore();
	if (gameState.mechanics.rebirth.count === 4) {
		AskUpvote();
	}
	// Refresh the page after rebirth
	window.location.reload();
}

function initializeSettings() {
	// Set initial state of switches
	document.getElementById("darkmode-switch").checked = gameState.settings.darkMode;
	document.getElementById("alerts-switch").checked = gameState.settings.alerts;
}

function toggleDarkMode() {
	gameState.settings.darkMode = !gameState.settings.darkMode;
	if (gameState.settings.darkMode) {
		document.body.classList.add("dark-mode");
	} else {
		document.body.classList.remove("dark-mode");
	}
	saveGame(gameState);
}

function toggleAlerts() {
	gameState.settings.alerts = !gameState.settings.alerts;
	saveGame(gameState);
}

function showAlert(arg) {
	if (gameState.settings.alerts) {
		alert(arg);
	}
}

function synchronizeUpgrades() {
	let coinsPerReload = 1;
	GG_ALL_GAME_CONFIG.upgrades.forEach((upgrade, index) => {
		coinsPerReload += upgrade.increment * gameState.upgrades.normal[index];
	});
	gameState.currency.coinsPerReload = coinsPerReload;
}

function openSection(elementId) {
	gameState.ui.sectionOpened = elementId;
	const topMenuButtons = document.querySelectorAll(".top-menu-button");
	topMenuButtons.forEach((topMenuButton) => {
		const sectionId = topMenuButton.dataset.sectionId;
		const section = document.getElementById(sectionId);
		if (sectionId === elementId) {
			section.classList.remove("hidden");
			if (section.classList.contains("hidden")) {
				topMenuButton.classList.toggle("open");
			} else {
				topMenuButton.classList.add("open");
			}
		} else {
			section.classList.add("hidden");
			topMenuButton.classList.remove("open");
		}
	});
	saveGame(gameState);
}

function confirmResetGame() {
	const choice = confirm("Do you want to reset the game?\nThis cannot be undone!\nEverything will be reset!");
	if (!choice) return;
	const confirmation = prompt("Enter solution to 13*19 to reset the game!\n\nThis cannot be undone!");
	if (confirmation !== "247") return;
	resetGame();
}

function resetGame() {
	gameState = {
		...getNewGameState(),
		settings: {
			darkMode: gameState.settings.darkMode,
			alerts: gameState.settings.alerts,
		},
	};
	saveGame(gameState);
	updateScore();
	// Clear all storage
	localStorage.removeItem("the-reload-game-data");
	localStorage.removeItem("savegame");
	// Refresh the page
	window.location.reload();
}

function initializeEverything() {
	initializeShop();
	initializeLuckUpgrades();
	initializeRebirthUpgrades();
	initializeAchievements();
	initializeSettings();
	initializeTopMenu();
}

function updateLeaderboard(scores) {
	const leaderboardTableBody = document.getElementById("leaderboard-table-body");
	leaderboardTableBody.innerHTML = "";
	scores.forEach((score, index) => {
		const row = leaderboardTableBody.insertRow();
		row.insertCell(0).textContent = index + 1;
		row.insertCell(1).textContent = score.handle;
		row.insertCell(2).textContent = formatScore(score.score_numeric);
	});
}

function formatScore(score) {
	if (score >= 1e18) {
		return score.toExponential(3);
	} else if (score >= 1e15) {
		return (score / 1e15).toFixed(2) + "q";
	} else if (score >= 1e12) {
		return (score / 1e12).toFixed(2) + "t";
	} else if (score >= 1e9) {
		return (score / 1e9).toFixed(2) + "b";
	} else if (score >= 1e6) {
		return (score / 1e6).toFixed(2) + "m";
	} else if (score >= 1e3) {
		return (score / 1e3).toFixed(2) + "k";
	} else {
		return score.toLocaleString("en-US");
	}
}

function simulateReload() {
	document.getElementById("game-container").classList.add("hidden");
	const overlay = document.getElementById("reload-overlay");
	overlay.classList.add("active");
	setTimeout(() => {
		// Increment total reloads and recalc coins per reload based on upgrades
		gameState.stats.totalReloads++;
		synchronizeUpgrades();
		const randomForCriticalReload = Math.random();
		const isCriticalReload = randomForCriticalReload < gameState.mechanics.criticalReload.chance;
		const baseIncrement = gameState.currency.coinsPerReload * gameState.currency.coinsPerReloadMultiplier;
		if (isCriticalReload) {
			showAlert(`Critical Reload (x${gameState.mechanics.criticalReload.multiplier} coins)`);
			console.log("Critical Reload");
			gameState.stats.totalScore += baseIncrement * gameState.mechanics.criticalReload.multiplier;
			gameState.currency.coins += baseIncrement * gameState.mechanics.criticalReload.multiplier;
		} else {
			gameState.stats.totalScore += baseIncrement;
			gameState.currency.coins += baseIncrement;
		}
		console.log("Simulated Reload", gameState);
		saveGame(gameState);
		initializeEverything();
		updateScore();
		overlay.classList.remove("active");
		document.getElementById("game-container").classList.remove("hidden");
	}, FAKE_RELOAD_TIME);
}

// Expose functions
window.buyRebirthUpgrade = buyRebirthUpgrade;
window.openSection = openSection;
window.confirmResetGame = confirmResetGame;
window.resetGame = resetGame;
window.toggleDarkMode = toggleDarkMode;
window.toggleAlerts = toggleAlerts;
window.simulateReload = simulateReload;

// Load the game
let gameState = await loadGame();
console.log(gameState);

console.log("gameState", gameState); // Do not remove this line
saveGame(gameState);
initializeEverything();
updateScore();
openSection(gameState.ui.sectionOpened || "home");

// Process reload
gameState.stats.totalReloads += 1;
synchronizeUpgrades();
const randomForCriticalReload = Math.random();
const isCriticalReload = randomForCriticalReload < gameState.mechanics.criticalReload.chance;
const baseIncrement = gameState.currency.coinsPerReload * gameState.currency.coinsPerReloadMultiplier;
if (isCriticalReload) {
	showAlert(`Critical Reload (x${gameState.mechanics.criticalReload.multiplier} coins)`);
	console.log("Critical Reload");
	gameState.stats.totalScore += baseIncrement * gameState.mechanics.criticalReload.multiplier;
	gameState.currency.coins += baseIncrement * gameState.mechanics.criticalReload.multiplier;
} else {
	gameState.stats.totalScore += baseIncrement;
	gameState.currency.coins += baseIncrement;
}

if (gameState.settings.darkMode) {
	document.body.classList.add("dark-mode");
}