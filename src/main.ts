import * as LineTree from './line_tree';

let array: { length: number, delimiter: string }[] = [];
for (let i = 0; i < 100000; i++) {
	array.push({
		length: i,
		delimiter: ''
	});
}
// console.profile('build');
let tree = LineTree.build(array);
// console.profileEnd();

function walk() {
	let walker = new LineTree.LineWalker(tree);
	walker.moveToFirst();
	while (walker.node !== null) {
		walker.moveToSuccessor();
	}
}
console.profile('walk');
walk();
console.profileEnd();
