import * as LineTree from './line_tree';

let tree = LineTree.build([{ length: 0, delimiter: '' }]);
tree = LineTree.edit(tree, 0, 0, '123');
tree = LineTree.edit(tree, 1, 2, '4\n5\n6');

// let array: { length: number, delimiter: string }[] = [];
// for (let i = 0; i < 100000; i++) {
// 	array.push({ length: i, delimiter: '' });
// }
// let tree = LineTree.build(array)
