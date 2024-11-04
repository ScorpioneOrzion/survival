import { createSignal, For, onCleanup, onMount, type Component } from 'solid-js';
import { createStore } from 'solid-js/store'
import { styled } from 'solid-styled-components'
import Konva from "konva";
import styles from './App.module.css';
import { KonvaEventObject } from 'konva/lib/Node';
import Structure from './workers/structures?worker';
import { getOffsetPosition, getGridPoint, getLocation } from './helper/functions';
import { colors, Layers, scales, types } from './helper/constants';
import ORES from './ores';

const channel = new BroadcastChannel('test')
channel.postMessage('close')

const postMessagesHold: {}[] = []

channel.onmessage = ev => {
	const { data } = ev
	if (data === 'close') {
		channel.close()
	} else if (data === 'init') {
		postMessagesHold.forEach(data => channel.postMessage(data))
		postMessagesHold.length = 0;
	} else if (data === 'ready') {
		channel.postMessage('getAll')
	}
}

const structures = [
	...colors.map((_, i) => colors.map((_, j) => [i, j, 0, Math.random() * colors.length | 0] as const)).flat(1)
] as const

const Resource = styled('div')(props => ({ backgroundColor: props.color }));

const App: Component = () => {
	const [width, setWidth] = createSignal(window.innerWidth);
	const [height, setHeight] = createSignal(window.innerHeight);
	const [currentScale, setCurrentScale] = createSignal(6);
	const [TotalResources, setTotalResources] = createStore<bigint[]>(colors.map(() => 0n))
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

		for (const [x, y, type, arg] of structures) {
			const position = getOffsetPosition({ x, y })
			layers[Layers.structure].add(
				(() => {
					postMessagesHold.push({ addStructure: type, x, y, arg });
					return ORES[arg](position)
				})()
			)
		}

		postMessagesHold.push("end");

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
	})

	onCleanup(() => {
		removeEventListeners();
		worker.terminate();
	})

	return (
		<div class={styles.menu}>
			<div id={styles.topbar}>
				<For each={colors}>{
					(item, index) => <Resource color={`${item}dd`} class={styles.resource}><span>{TotalResources[index()].toString()}</span> </Resource>
				}</For>
			</div >
			<div id={styles.sidebar}>
				<For each={types}>{
					(item) => <button type='button' title={item} id={styles[item]}></button>
				}</For>
			</div>
		</div >
	);
};

export default App;
