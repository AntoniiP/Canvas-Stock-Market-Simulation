const {createCanvas} = require('@napi-rs/canvas')
const fs = require('fs')

const width = 800 // Graph width
const height = 400 // Graph height
const canvas = createCanvas(width, height)
const context = canvas.getContext('2d')

// Background
context.fillStyle = '#3f50a6'
context.fillRect(0, 0, width, height)

// Data for items (sauce, dough, oil)
const items = [
	{name: 'Sauce', prices: [20, 22, 19, 21, 20, 23, 25, 20, 22, 19, 21, 20, 23, 25], color: 'red'},
	{name: 'Dough', prices: [40, 42, 45, 40, 38, 35, 37, 40, 42, 45, 40, 38, 35, 37], color: 'beige'},
	{name: 'Oil', prices: [80, 78, 82, 79, 77, 75, 76, 80, 78, 82, 79, 77, 75, 76], color: 'green'}
]

// Function to draw line graph for each item
const drawLineGraph = (prices, color) => {
	const maxPrice = Math.max(...prices)
	const minPrice = Math.min(...prices)
	const priceRange = maxPrice - minPrice
	const xStep = width / (prices.length - 1)
	const yScale = (height - 40) / priceRange

	context.beginPath()
	context.strokeStyle = color
	context.lineWidth = 2

	prices.forEach((price, index) => {
		const x = xStep * index
		const y = height - (price - minPrice) * yScale - 20
		if (index === 0) context.moveTo(x, y)
		else context.lineTo(x, y)
	})

	context.stroke()
}

const drawVerticalLines = (prices) => {
	const xStep = width / (prices.length - 1)

	context.beginPath()
	context.strokeStyle = '#737373' // Light grey color for the vertical lines
	context.lineWidth = 1

	prices.forEach((_, index) => {
		const x = xStep * index
		context.moveTo(x, 0)
		context.lineTo(x, height)
	})

	context.stroke()
}

drawVerticalLines(items[0].prices) // Since all arrays have the same length

// Drawing the line graph for each item
items.forEach((item) => {
	drawLineGraph(item.prices, item.color)
})

// Save canvas to file
const buffer = canvas.toBuffer('image/png')
fs.writeFileSync('stock-market-graph.png', buffer)

console.log('Graph saved')
