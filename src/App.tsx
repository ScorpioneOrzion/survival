import { createSignal, onCleanup, onMount, type Component } from 'solid-js';
import Konva from "konva";
import styles from './App.module.css';
import { KonvaEventObject } from 'konva/lib/Node';
import Structure from './workers/structures?worker';
import { getOffsetPosition, getGridPoint, getLocation } from './helper/functions';
import { borderSize, Layers, scales, stepSize } from './helper/constants';

const channel = new BroadcastChannel('test')

channel.onmessage = ev => {
	console.log(ev.data)
}

const structures = [
	[1, 1, 0], [2, 1, 2], [3, 1, 1],
	[1, 2, 1], [2, 2, 0], [3, 2, 2],
	[1, 3, 2], [2, 3, 1], [3, 3, 0],
] as const

const App: Component = () => {
	const [width, setWidth] = createSignal(window.innerWidth);
	const [height, setHeight] = createSignal(window.innerHeight);
	const [currentScale, setCurrentScale] = createSignal(6);
	let stage: Konva.Stage, worker: Worker;
	const layers: { [key: number]: Konva.Layer } = {};

	function stopKeys(event: KeyboardEvent) {
		switch (event.key) {
			case 'Alt': case 'ContextMenu':
			case 'F1': case 'F2': case 'F3':
			case 'F6':
			case 'F7': case 'F8': case 'F9':
			case 'F10':
				event.preventDefault()
				break;
		}
	}

	function onKeyPress(event: KeyboardEvent) {
		let testing = false;
		stopKeys(event);
		if (testing) console.log(event.code)
		switch (event.code) {
		}
	}

	function resize() {
		setWidth(window.innerWidth);
		setHeight(window.innerHeight);
		stage.width(width());
		stage.height(height());
	}

	function unScale(val: number) {
		return val / stage.scaleX()
	}

	function drawBackground() {
		const stagePos = stage.position();
		const unscaledStagePosX = unScale(stagePos.x);
		const unscaledStagePosY = unScale(stagePos.y);
		const scaledWidth = unScale(width());
		const scaledHeight = unScale(height());

		const viewRect = {
			x1: -unscaledStagePosX,
			y1: -unscaledStagePosY,
			x2: scaledWidth - unscaledStagePosX,
			y2: scaledHeight - unscaledStagePosY
		};

		const gridOffsetX = Math.ceil(unscaledStagePosX / stepSize) * stepSize;
		const gridOffsetY = Math.ceil(unscaledStagePosY / stepSize) * stepSize;

		const fullRect = {
			x1: Math.min(0, -gridOffsetX),
			y1: Math.min(0, -gridOffsetY),
			x2: Math.max(stage.width(), scaledWidth - gridOffsetX + stepSize),
			y2: Math.max(stage.height(), scaledHeight - gridOffsetY + stepSize)
		};

		const clip = { x: viewRect.x1, y: viewRect.y1, width: viewRect.x2 - viewRect.x1, height: viewRect.y2 - viewRect.y1 }

		layers[Layers.grid].clear()
		layers[Layers.grid].destroyChildren()

		for (const layer of Layers) { layers[layer].clip(clip) }

		const xSize = fullRect.x2 - fullRect.x1;
		const ySize = fullRect.y2 - fullRect.y1;
		const xSteps = Math.round(xSize / stepSize);
		const ySteps = Math.round(ySize / stepSize);

		//draw Vertical lines
		for (let i = 0; i <= xSteps; i++) {
			layers[Layers.grid].add(
				new Konva.Line({
					x: fullRect.x1 + i * stepSize,
					y: fullRect.y1,
					points: [0, 0, 0, ySize],
					stroke: 'rgba(0, 0, 0, 0.2)',
					strokeWidth: 2,
				})
			);
		}
		//draw Horizontal lines
		for (let i = 0; i <= ySteps; i++) {
			layers[Layers.grid].add(
				new Konva.Line({
					x: fullRect.x1,
					y: fullRect.y1 + i * stepSize,
					points: [0, 0, xSize, 0],
					stroke: 'rgba(0, 0, 0, 0.2)',
					strokeWidth: 2,
				})
			);
		}
		layers[Layers.grid].batchDraw();
	}

	function handleWheel(e: KonvaEventObject<WheelEvent, typeof stage>) {
		e.evt.preventDefault()

		const oldScale = +stage.scaleX()
		const pointer = stage.getPointerPosition()

		if (pointer === null) return

		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		}

		const zoomDirection = e.evt.deltaY > 0 ? 1 : -1;
		const direction = e.evt.ctrlKey ? -zoomDirection : zoomDirection;

		setCurrentScale(prev => Math.min(Math.max(0, prev + direction), scales.length - 1));

		const newScale = scales[currentScale()];

		if (newScale === oldScale) return

		stage.scale({ x: newScale, y: newScale })

		stage.position({
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		})

		stage.batchDraw()
		drawBackground()
	}

	function setupStage() {
		stage = new Konva.Stage({
			container: 'game',
			width: width(),
			height: height(),
			draggable: true,
		});

		let max = 1;
		for (const index of Layers) { if (index > max) max = index }
		for (const index of Layers) {
			const newLayer = new Konva.Layer({ listening: false, x: 0, y: 0 })
			layers[index] = newLayer
			stage.add(newLayer)
			newLayer.setZIndex(index / max)
		}

		stage.on('click', evt => {
			const node = evt.target;
			if (node) {
				const mousePos = node.getStage()?.getRelativePointerPosition();
				if (mousePos) {
					const position = getOffsetPosition(getGridPoint(getLocation(mousePos)))
					console.log(layers[Layers.structure].getChildren(item => item.x() === position.x && item.y() === position.y))
				}
			}
		});

		for (const [x, y, type] of structures) {
			const position = getOffsetPosition({ x, y })
			layers[Layers.structure].add(
				(() => {
					const rect = new Konva.Rect({
						x: position.x,
						y: position.y,
						width: stepSize - borderSize,
						height: stepSize - borderSize,
						fill: 'red',
						stroke: 'black',
						strokeWidth: borderSize
					})
					worker.postMessage({ addStructure: type, x, y })
					return rect
				})()
			)
		}

		stage.on('dragmove', drawBackground);
		stage.on('wheel', handleWheel);
	}

	function addEventListeners() {
		window.addEventListener('resize', resize);
		window.addEventListener('keydown', onKeyPress);
	}

	function removeEventListeners() {
		window.removeEventListener('resize', resize)
		window.removeEventListener('keydown', onKeyPress)
	}

	onMount(() => {
		worker = new Structure();
		setupStage();
		addEventListeners();
		drawBackground();
	})

	onCleanup(() => {
		removeEventListeners();
		worker.terminate();
	})

	return (
		<div class={styles.menu}>
			<div id={styles.sidebar}>
				<div id={styles.mining}></div>
				<div id={styles.production}></div>
				<div id={styles.energy}></div>
				<div id={styles.weaponry}></div>
				<div id={styles.logic}></div>
				<div id={styles.utility}></div>
				<div id={styles.storage}></div>
			</div>
		</div>
	);
};

export default App;
