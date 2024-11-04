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
export const colors = ['#ff0000', '#ff3300', '#ff6600', '#ff9900', '#ffcc00', '#ffff00', '#ccff00', '#99ff00', '#66ff00', '#33ff00', '#00ff00', '#00ff33', '#00ff66', '#00ff99', '#00ffcc', '#00ffff', '#00ccff', '#0099ff', '#0066ff', '#0033ff', '#0000ff', '#3300ff', '#6600ff', '#9900ff', '#cc00ff', '#ff00ff', '#ff00cc', '#ff0099', '#ff0066', '#ff0033'] as const
export const types = ['mining', 'production', 'energy', 'weaponry', 'logic', 'utility', 'storage'];