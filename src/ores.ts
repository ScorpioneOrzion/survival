import { stepSize, colors } from "./helper/constants";
import Konva from "konva";

function createOre(color: string, { x, y }: { x: number, y: number }) {
	const ore = new Konva.Group({ x: x - 1, y: y - 1 })
	ore.add(new Konva.Circle({
		x: stepSize / 4,
		y: stepSize / 4,
		radius: stepSize / 8,
		fill: color
	}))
	ore.add(new Konva.Circle({
		x: stepSize / 4,
		y: stepSize / 4 + stepSize / 2,
		radius: stepSize / 16,
		fill: color
	}))
	ore.add(new Konva.Circle({
		x: stepSize / 4 + stepSize / 2,
		y: stepSize / 4,
		radius: stepSize / 16,
		fill: color
	}))
	ore.add(new Konva.Circle({
		x: stepSize / 4 + stepSize / 2,
		y: stepSize / 4 + stepSize / 2,
		radius: stepSize / 8,
		fill: color
	}))
	return ore
}

export default colors.map(color => ({ x, y }: { x: number, y: number }) => createOre(color, { x, y }))