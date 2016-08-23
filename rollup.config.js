import typescriptPlugin from 'rollup-plugin-typescript';
import typescript from 'typescript';

export default {
	plugins: [
		typescriptPlugin({
			target: 'es6',
			typescript
		})
	]
}
