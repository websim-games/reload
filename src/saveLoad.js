import { GG_ALL_GAME_CONFIG } from "./config.js";

const room = new WebsimSocket();

function getNewGameState() {
	const gameState = {
		stats: {
			totalReloads: 0,
			totalScore: 0,
		},
		currency: {
			coins: 0,
			coinsPerReload: 1,
			coinsPerReloadMultiplier: 1,
			bitcoins: 0,
			bitcoinsPerRebirth: 1,
		},
		mechanics: {
			criticalReload: {
				unlocked: false,
				chance: 0,
				multiplier: 1,
			},
			rebirth: {
				unlocked: false,
				count: 0,
			},
		},
		upgrades: {
			normal: Array(GG_ALL_GAME_CONFIG.upgrades.length).fill(0),
			luck: Array(GG_ALL_GAME_CONFIG.luckUpgrades.length).fill(0),
			rebirth: Array(GG_ALL_GAME_CONFIG.rebirthUpgrades.length).fill(0),
		},
		achievements: Array(GG_ALL_GAME_CONFIG.achievements.length).fill(false),
		settings: {
			darkMode: true,
			alerts: true,
		},
		ui: {
			sectionOpened: "home",
		},
	};
	return gameState;
}

function migrateSaveData(savedData) {
	if (savedData.stats && savedData.currency && savedData.mechanics) {
		// Already in new format
		return savedData;
	}

	console.log("Migrating old save format...");
	return {
		stats: {
			totalReloads: savedData.totalReloads || 0,
			totalScore: savedData.totalScore || 0,
		},
		currency: {
			coins: savedData.coins || 0,
			coinsPerReload: savedData.coinsPerReload || 1,
			coinsPerReloadMultiplier: savedData.coinsPerReloadMultiplier || 1,
			bitcoins: savedData.bitcoins || 0,
			bitcoinsPerRebirth: savedData.bitcoinsPerRebirth || 1,
		},
		mechanics: {
			criticalReload: {
				unlocked: savedData.criticalReloadUnlocked || false,
				chance: savedData.criticalReloadChance || 0,
				multiplier: savedData.criticalReloadMultiplier || 1,
			},
			rebirth: {
				unlocked: savedData.rebirthsUnlocked || false,
				count: savedData.rebirths || 0,
			},
		},
		upgrades: {
			normal: savedData.upgrades || Array(GG_ALL_GAME_CONFIG.upgrades.length).fill(0),
			luck: savedData.luckUpgrades || Array(GG_ALL_GAME_CONFIG.luckUpgrades.length).fill(0),
			rebirth: savedData.rebirthUpgrades || Array(GG_ALL_GAME_CONFIG.rebirthUpgrades.length).fill(0),
		},
		achievements: savedData.achievements || Array(GG_ALL_GAME_CONFIG.achievements.length).fill(false),
		settings: {
			darkMode: savedData.settingDarkMode !== undefined ? savedData.settingDarkMode : true,
			alerts: savedData.settingAlerts !== undefined ? savedData.settingAlerts : true,
		},
		ui: {
			sectionOpened: savedData.sectionOpened || "home",
		},
	};
}

function ensureArrayLengths(gameState) {
	const { upgrades } = gameState;

	const fixArrayLength = (array, length) => {
		array.length = length;
		return array.map((value) => value ?? 0);
	};

	upgrades.normal = fixArrayLength(upgrades.normal, GG_ALL_GAME_CONFIG.upgrades.length);
	upgrades.luck = fixArrayLength(upgrades.luck, GG_ALL_GAME_CONFIG.luckUpgrades.length);
	upgrades.rebirth = fixArrayLength(upgrades.rebirth, GG_ALL_GAME_CONFIG.rebirthUpgrades.length);
}

export async function saveGame(gameState) {
	try {
		const saves = await room.collection('reload_game_save').filter({ type: 'save' }).getList();
		if (saves.length > 0) {
			// Update existing save
			await room.collection('reload_game_save').update(saves[0].id, {
				type: 'save',
				data: gameState,
				timestamp: Date.now()
			});
		} else {
			// Create new save
			await room.collection('reload_game_save').create({
				type: 'save', 
				data: gameState,
				timestamp: Date.now()
			});
		}

		// Also save to localStorage as backup
		localStorage.setItem('reload_game_backup', JSON.stringify({
			data: gameState,
			timestamp: Date.now()
		}));

	} catch (error) {
		console.error('Error saving game:', error);
	}
}

export async function loadGame() {
	try {
		// Try loading from database first
		const saves = await room.collection('reload_game_save').filter({ type: 'save' }).getList();
		
		let savedData = null;
		
		if (saves.length > 0) {
			// Use latest database save
			savedData = saves[0].data;
		} else {
			// Try loading from localStorage backup
			const backup = localStorage.getItem('reload_game_backup');
			if (backup) {
				savedData = JSON.parse(backup).data;
			}
		}

		if (!savedData) {
			return getNewGameState();
		}

		// Migrate old save format if needed
		let gameState = migrateSaveData(savedData);

		// Ensure arrays have correct length
		ensureArrayLengths(gameState);

		return gameState;

	} catch (error) {
		console.error('Error loading game:', error);
		return getNewGameState();
	}
}