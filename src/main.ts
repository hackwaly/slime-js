import * as LineTree from './line_tree';

// let tree = LineTree.build([{ length: 0, delimiter: '' }]);
// tree = LineTree.edit(tree, 0, 0, '123');
// tree = LineTree.edit(tree, 1, 2, '4\n5\n6');

let array: { length: number, delimiter: string }[] = [];
for (let i = 0; i < 100000; i++) {
	array.push({ length: i, delimiter: '' });
}
let tree = LineTree.build(array);
let indexes: number[] = [];
let walker = new LineTree.LineWalker(tree);
walker.moveToFirst();
while (walker.node !== null) {
	indexes.push(walker.index);
	walker.moveToSuccessor();
}

function edit(tree: LineTree.LineNode, middlePart: LineTree.LineNode) {
	let leftPart = LineTree.split(tree, walker => 20000 <= walker.index, true);
	let rightPart = LineTree.split(tree, walker => 50000 <= walker.index, false);
	return LineTree.merge(leftPart, middlePart);
}

console.profile('edit');
// for (let i = 0; i < 100; i++) {
	tree = edit(tree, tree);
// }
console.profileEnd();
