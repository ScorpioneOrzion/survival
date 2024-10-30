import { M, Mo, Mi } from './constants';

export function getPosition(point: { x: number; y: number; }) {
	return DOMPointReadOnly.fromPoint(point).matrixTransform(M);
}
export function getOffsetPosition(point: { x: number; y: number; }) {
	return DOMPointReadOnly.fromPoint(point).matrixTransform(Mo);
}
export function getLocation(point: { x: number; y: number; }) {
	return DOMPointReadOnly.fromPoint(point).matrixTransform(Mi);
}
export function getGridPoint(point: { x: number; y: number; }) {
	return { x: Math.floor(point.x), y: Math.floor(point.y) };
}
