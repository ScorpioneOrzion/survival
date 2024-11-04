import { colors } from "../helper/constants";
import { generateIndicatorId } from "./helper"
declare const self: WorkerGlobalScope;
const ID = generateIndicatorId()

const channel = new BroadcastChannel('test')
const resourcePathes = Object.fromEntries(colors.map(color => [color, [] as { x: number, y: number }[]]))

channel.onmessage = (ev: MessageEvent<unknown>) => {
	const { data } = ev;

	if (data === 'close') {
		channel.close()
		close()
	}

	if (parseAll(data, ['addStructure', 'arg', 'x', 'y'])) {
		if (isTypeProperties(data, ['addStructure', 'arg', 'x', 'y'], 'number')) {
			if (data.addStructure === 0) {
				const { x, y } = data
				resourcePathes[colors[data.arg]].push({ x, y })
			}
		}
	}

	if (data === 'end') {
		channel.postMessage('ready')
	}
	if (ev.data === 'getAll') {
		console.log(resourcePathes)
		console.log(ID)
	}
}

function parseAll<K extends string>(obj: unknown, keys: K[]): obj is { [key in K]: unknown } {
	return typeof obj === 'object' && obj !== null && keys.every(key => key in obj)
}

function parseSome<K extends string>(obj: unknown, keys: K[]): obj is { [key in K]?: unknown } {
	return typeof obj === 'object' && obj !== null && keys.some(key => key in obj)
}

function isTypeProperties<K extends string, T extends "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function">(
	obj: { [key in K]: unknown } & { [key: string]: unknown },
	keys: K[], type: T
): obj is { [key in K]: T extends "string" ? string :
	T extends "number" ? number :
	T extends "bigint" ? bigint :
	T extends "boolean" ? boolean :
	T extends "symbol" ? symbol :
	T extends "undefined" ? undefined :
	T extends "object" ? object | null :  // `typeof null` is "object"
	T extends "function" ? Function : never
} {
	return keys.every(key => typeof obj[key] === type)
}

channel.postMessage('init')