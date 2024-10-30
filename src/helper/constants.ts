export const stepSize = 40;
export const borderSize = 2, offsetPosition = borderSize / 2
export const M = new DOMMatrixReadOnly([stepSize, 0, 0, stepSize, 0, 0]), Mi = M.inverse(), Mo = new DOMMatrixReadOnly().translate(offsetPosition, offsetPosition).multiply(M);
export const scales = [5, 4, 3, 2.5, 2, 1.5, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
export const Layers = {
	grid: 0, structure: 2,
	*[Symbol.iterator]() {
		yield this.grid;
		yield this.structure;
		return -1;
	}
} as const;

