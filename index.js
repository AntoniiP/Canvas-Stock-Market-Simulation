const {createCanvas, loadImage} = require('@napi-rs/canvas')
const fs = require('fs')

const width = 800 // Graph width
const height = 400 // Graph height
const canvas = createCanvas(width, height)
const context = canvas.getContext('2d')

// Background
context.fillStyle = '#3f50a6'
context.fillRect(0, 0, width, height)

// Data for items (sauce, dough, oil)
const json = JSON.parse(fs.readFileSync('./stock-results.json'))

const items = [
	{name: 'Sauce', prices: json.sauce.previousValues.map((x) => Number(x.toFixed(2))), color: 'red'},
	{name: 'Dough', prices: json.dough.previousValues.map((x) => Number(x.toFixed(2))), color: 'white'},
	{name: 'Oil', prices: json.oil.previousValues.map((x) => Number(x.toFixed(2))), color: 'green'}
]

const globalMaxPrice = Math.max(...items.flatMap((item) => item.prices))
const globalMinPrice = Math.min(...items.flatMap((item) => item.prices))
const globalPriceRange = globalMaxPrice - globalMinPrice
const yScale = (height - 40) / globalPriceRange

// Function to draw line graph for each item
const drawLineGraph = async (prices, color, imagePath) => {
	const xStep = width / (prices.length - 1), image = await loadImage(imagePath), lastIndex = prices.length - 1

	context.beginPath()
	context.strokeStyle = color
	context.lineWidth = 2


	for (let index = 0; index < prices.length; index++) {
		const price = prices[index]
		const x = xStep * index
		const y = height - (price - globalMinPrice) * yScale - 20

		if (index === 0) context.moveTo(x, y)
		else context.lineTo(x, y)
		

		if (index === lastIndex) context.drawImage(image, x - 10 - image.width / 2, y - image.height, image.width * 2, image.height * 2)
		
	}

	context.stroke()
}

const drawVerticalLines = (prices) => {
	const xStep = width / (prices.length - 1)

	context.beginPath()
	context.strokeStyle = '#737373' // Light grey color for the vertical lines
	context.lineWidth = 1

	prices.forEach((price, index) => {
		const x = xStep * index
		context.moveTo(x, 0)
		context.lineTo(x, height)
	})

	context.stroke()
}

drawVerticalLines(items[0].prices) // Since all arrays have the same length
;(async () => {
	await drawLineGraph(items[0].prices, items[0].color, './sauce.png') // Replace with your image path for sauce
	await drawLineGraph(items[1].prices, items[1].color, './dough.png') // Replace with your image path for dough
	await drawLineGraph(items[2].prices, items[2].color, './oil.png') // Replace with your image path for oil

	// Save canvas to file
	const buffer = canvas.toBuffer('image/png')
	fs.writeFileSync('stock-market-graph.png', buffer)

	console.log('Graph saved')
})()
