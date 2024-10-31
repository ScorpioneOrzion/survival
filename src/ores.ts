import { stepSize } from "./helper/constants";
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

export const RED = ({ x, y }: { x: number, y: number }) => createOre('red', { x, y })
export const BLUE = ({ x, y }: { x: number, y: number }) => createOre('blue', { x, y })
export const GREEN = ({ x, y }: { x: number, y: number }) => createOre('green', { x, y })
