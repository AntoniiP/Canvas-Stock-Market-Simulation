/////////////////////////////////////////////////////////////////////
// Based on Cookie Clicker's stock market: https://cookieclicker.fandom.com/wiki/Stock_Market
/////////////////////////////////////////////////////////////////////



const fs = require('fs')

// Constants
const restingValues = {sauce: 20, dough: 40, oil: 80} // An initial price for each stock
const marketCap = 200 // The maximum value any stock can be.
const modes = [ 
    {
        chance: 12.5, effect: (stock) => {
        stock.delta *= 0.95
		stock.delta += random(-0.025, 0.025)
    }}, // Stable
	{
		chance: 25,
		effect: (stock) => {
            stock.delta *= 0.99;
            stock.delta += random(-0.005, 0.045)
		}
	}, // Slow Rise
	{
		chance: 25,
        effect: (stock) => {
            stock.delta *= 0.99
            stock.delta += random(-0.045, 0.005)
		}
	}, // Slow Fall
	{
		chance: 12.5,
		effect: (stock) => {
			stock.value += random(0, 5)
			stock.delta += random(-0.015, 0.135)
			if (Math.random() < 0.3) {
				stock.value += random(-7, 3)
				stock.delta += random(-0.05, 0.05)
			}
			if (Math.random() < 0.03) {
				stock.mode = 4 // Fast Fall
				stock.duration = Math.floor(random(1, 8))
			}
		} 
	}, // Fast Rise
	{
		chance: 12.5,
		effect: (stock) => {
			stock.value += random(-5, 0)
			stock.delta += random(-0.135, 0.015)
			if (Math.random() < 0.3) {
				stock.value += random(-3, 7)
				stock.delta += random(-0.05, 0.05)
			}
		} // Fast Fall
	},
	{
		chance: 12.5,
		effect: (stock, globD) => {
			stock.delta += random(-0.15, 0.15)
			if (Math.random() < 0.5) stock.value += random(-5, 5)
			if (Math.random() < 0.2) stock.delta = random(-1, 1)
			
		}
	} // Chaotic
]


// Helper function to get a random number in a range
const random = (min, max) => Math.random() * (max - min) + min

// Initial stock setup
let stocks = {
	sauce: {value: restingValues.sauce, previousValues: [restingValues.sauce], delta: 0, mode: 0, duration: 0},
	dough: {value: restingValues.dough, previousValues: [restingValues.dough], delta: 0, mode: 0, duration: 0},
	oil: {value: restingValues.oil, previousValues: [restingValues.oil], delta: 0, mode: 0, duration: 0}
}

// Function to update the stock based on the mode
function updateStockMode(stock) {
	let totalChance = 0
	const rand = random(0, 100)
	for (const mode of modes) {
		totalChance += mode.chance
		if (rand <= totalChance) {
			stock.mode = modes.indexOf(mode)
			stock.duration = Math.floor(random(1, 8))
		}
	}
}

// Main tick update function
function tickUpdate() {
	for (const name in stocks) {
		let stock = stocks[name]

		// Decrease delta by 3%
		stock.delta -= stock.delta * 0.03

		// Base fluctuations
		stock.value += random(-3, 3)
		stock.delta += random(-0.05, 0.05)

		// Additional fluctuations
		if (Math.random() < 0.15) stock.value += random(-1.5, 1.5)
		if (Math.random() < 0.03) stock.value += random(-5, 5)
		if (Math.random() < 0.1) stock.delta += random(-0.15, 0.15)
		

		// Apply mode effects
		modes[stock.mode].effect(stock, null)

		// Value adjustments 
		if (stock.value < 5) {
            stock.value += (5 - stock.value) / 2
            
			if (stock.delta < 0) stock.delta -= stock.delta * 0.05
		}

		// Market cap adjustments
		if (stock.value > marketCap) {
			if (stock.delta > 0) stock.delta -= stock.delta * 0.1
		}

		// Make sure value does not fall below $1
		stock.value = Math.max(stock.value, 1)

		// Update stock mode duration and possibly change mode
		stock.duration--
		if (stock.duration <= 0) updateStockMode(stock)
		stock.previousValues.push(stock.value)
	}

	// 10% chance to trigger instant mode changes for all stocks
	if (Math.random() < 0.1) {
		const globD = random(-1, 1)
		for (const name in stocks) {
			if (Math.random() < 0.25) {
				const stock = stocks[name]
				// Apply instant mode change effects
				stock.value += globD * (2 + 7 * random(0, 1))
				stock.delta += globD * random(1, 5)
				updateStockMode(stock)
			}
		}
	}
}

// Run the tick update a set number of times (e.g., 50)
for (let i = 0; i < 20; i++) tickUpdate()


// Output the results to a file
fs.writeFileSync('stock-results.json', JSON.stringify(stocks, null, 2))
console.log('Results saved to stock-results.json.')
