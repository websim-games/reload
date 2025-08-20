export const GG_ALL_GAME_CONFIG = {
	upgrades: (() => {
		// Custom overrides defined by level (only properties you want to override)
		const customUpgrades = [
			{
				baseCost: 7,
				costIncrease: 1.125,
				max_level: 199,
				rebirthsToUnlock: 0,
			},
			{
				baseCost: 120,
				costIncrease: 1.0635,
				rebirthsToUnlock: 0,
			},
			{
				baseCost: 2e3, // 2000
			},
			{
				baseCost: 3e4,
			},
			{
				baseCost: 4e5,
			},
			{
				baseCost: 5e6,
			},
			{
				baseCost: 7e7,
			},
			{
				baseCost: 1e9,
			},
			{
				baseCost: 2e10,
			},
			{
				baseCost: 4e11,
			},
			{
				baseCost: 6e12,
			},
			{
				baseCost: 8e13,
			},
			{
				baseCost: 1e15,
			},
			{
				baseCost: 2e16,
			},
			{
				baseCost: 5e17,
			},
			{
				baseCost: 8e18,
			},
			{
				baseCost: 1e20,
			},
			{
				baseCost: 2e21,
			},
			{
				baseCost: 4e22,
			},
			{
				baseCost: 7e23,
			},
			{
				baseCost: 1e25,
			},
			{
				baseCost: 3e26,
			},
			{
				baseCost: 5e27,
			},
			{
				baseCost: 8e28,
			},
			{
				baseCost: 1e30,
			},
			{
				baseCost: 3e31,
			},
			{
				baseCost: 5e32,
			},
			{
				baseCost: 8e33,
			},
		];
		// Default upgrade generator (internal to the IIFE)
		const defaultUpgradeGenerator = (i) => {
			return {
				baseCost: Infinity,
				costIncrease: 1.05,
				increment: 10 ** i,
				max_level: 180,
				rebirthsToUnlock: 2 * i - 1,
			};
		};
		// Create and merge the upgrades
		const upgrades = [];
		for (let i = 0; i < 35; i++) {
			const defaultConfig = defaultUpgradeGenerator(i);
			const customConfig = customUpgrades[i] || {};
			upgrades.push({
				...defaultConfig,
				...customConfig,
			});
		}
		return upgrades;
	})(),
	luckUpgrades: [
		{
			id: "unlock",
			name: "Critical Reload",
			description: (gameState) => "Get a chance to get more coins from a reload",
			baseCost: 5_000,
			costIncrease: 1,
			max_level: 1,
			rebirthsToUnlock: 2,
		},
		{
			id: "chance",
			name: "Chance of Critical Reload",
			description: (gameState) => `+1% to get Critical Reload (Currently ${gameState.mechanics.criticalReload.chance * 100}%)`,
			baseCost: 20_000,
			costIncrease: 1.25,
			max_level: 75,
			rebirthsToUnlock: 2,
		},
		{
			id: "multiplier",
			name: "Crtitical Reload multiplier",
			description: (gameState) => `Increase the multiplier of Critical Reload (Currently x${gameState.mechanics.criticalReload.multiplier})`,
			baseCost: 20_000,
			costIncrease: 1.05,
			max_level: 196,
			rebirthsToUnlock: 2,
		},
	],
	rebirthUpgrades: [
		{
			id: "rebirth",
			name: "Rebirth",
			description: (gameState) => `+${gameState.currency.bitcoinsPerRebirth}₿ (You have ${gameState.currency.bitcoins}₿)`,
			baseCost: 1000,
			costCurrency: "$",
			costIncrease: 4,
			max_level: 50,
			rebirthsToUnlock: 0,
		},
		{
			id: "bitcoins-per-rebirth",
			name: "Bitcoins per rebirth",
			description: (gameState) => `+1₿ per rebirth (Currently ${gameState.currency.bitcoinsPerRebirth}₿ per rebirth)`,
			baseCost: 1,
			costCurrency: "₿",
			costIncrease: 1.58,
			max_level: 19,
			rebirthsToUnlock: 1,
		},
		{
			id: "profit-multiplier",
			name: "Profit multiplier",
			description: (gameState) => `Additional multiplier for Coins Per Reload (Currently x${gameState.currency.coinsPerReloadMultiplier})`,
			baseCost: 1,
			costCurrency: "₿",
			costIncrease: 1.09,
			max_level: 19,
			rebirthsToUnlock: 1,
		},
	],
	achievements: [
		{
			name: "First Steps",
			description: "Do 1 reload",
			requirement: (gameState) => gameState.stats.totalReloads >= 1,
		},
		{
			name: "Upgrader",
			description: "Buy 1 upgrade",
			requirement: (gameState) => gameState.currency.coinsPerReload > 1,
		},
		{
			name: "Reborn",
			description: "Do 1 rebirth",
			requirement: (gameState) => gameState.mechanics.rebirth.count >= 1,
		},
		{
			name: "Lucky Beginner",
			description: "Unlock Critical Reloads",
			requirement: (gameState) => gameState.mechanics.criticalReload.unlocked,
		},
		{
			name: "Billionaire",
			description: "Have 1,000,000,000$ at once",
			requirement: (gameState) => gameState.currency.coins >= 1_000_000_000,
		},
		{
			name: "Crypto Enthusiast",
			description: "Have 10₿ at once",
			requirement: (gameState) => gameState.currency.bitcoins >= 10,
		},
		{
			name: "Lucky Master",
			description: "Get 50% Critical Reload chance",
			requirement: (gameState) => gameState.mechanics.criticalReload.chance >= 0.5,
		},
		{
			name: "Reborn Master",
			description: "Do 25 rebirths",
			requirement: (gameState) => gameState.mechanics.rebirth.count >= 25,
		},
	],
};
