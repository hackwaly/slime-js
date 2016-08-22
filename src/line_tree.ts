import {List, nil, cons} from './list';

export class LineNode {
	left: this;
	right: this;
	priority: number;

	length: number;
	delimiter: string;

	subtreeCount: number;
	subtreeLength: number;

	constructor() {
		this.left = null;
		this.right = null;
		this.priority = Math.random();
	}

	maintain() {
		let count = 1;
		let length = this.length;
		if (this.left !== null) {
			count += this.left.subtreeCount;
			length += this.left.subtreeLength;
		}
		if (this.right !== null) {
			count += this.right.subtreeCount;
			length += this.right.subtreeLength;
		}
		this.subtreeCount = count;
		this.subtreeLength = length;
	}
}

export class LineWalker {
	root: LineNode;

	private stack: List<LineNode>;

	private baseIndex: number;
	private baseOffset: number;

	get node() {
		return this.stack.head;
	}

	get parent() {
		return this.stack.tail.head;
	}

	private get relativeIndex() {
		let left = this.node.left;
		return left === null ? 0 : left.subtreeCount;
	}

	private get relativeOffset() {
		let left = this.node.left;
		return left === null ? 0 : left.subtreeLength;
	}

	get index() {
		return this.baseIndex + this.relativeIndex;
	}

	get offset() {
		return this.baseOffset + this.relativeOffset;
	}

	get endOffset() {
		return this.offset + this.node.length;
	}

	constructor(root: LineNode) {
		this.root = root;
		this.reset();
	}

	reset() {
		this.stack = cons(this.root, nil);
		this.baseIndex = 0;
		this.baseOffset = 0;
		return this;
	}

	descendLeft() {
		if (this.node.left === null) {
			debugger;
		}
		this.push(this.node.left);
		return this;
	}

	descendRight() {
		if (this.node.right === null) {
			debugger;
		}
		this.baseIndex = this.index + 1;
		this.baseOffset = this.offset + this.node.length;
		this.push(this.node.right);
		return this;
	}

	ascend() {
		let parent = this.parent;
		if (parent !== null) {
			if (this.node === parent.right) {
				let left = parent.left;
				if (left !== null) {
					this.baseIndex -= left.subtreeCount;
					this.baseOffset -= left.subtreeLength;
				}
				this.baseIndex -= 1;
				this.baseOffset -= parent.length;
			}
		}
		this.pop();
		return this;
	}

	moveToFirst() {
		this.reset();
		this.moveToLeftMost();
		return this;
	}

	moveToLast() {
		this.reset();
		this.moveToRightMost();
		return this;
	}

	moveToPredecessor() {
		if (this.node.left !== null) {
			this.descendLeft();
			this.moveToRightMost();
		} else {
			while (this.parent !== null && this.node === this.parent.left) {
				this.ascend();
			}
			this.ascend();
		}
		return this;
	}

	moveToSuccessor() {
		if (this.node.right !== null) {
			this.descendRight();
			this.moveToLeftMost();
		} else {
			while (this.parent !== null && this.node === this.parent.right) {
				this.ascend();
			}
			this.ascend();
		}
		return this;
	}

	seekToIndex(index: number): this {
		let self = this;

		function seek() {
			if (index === self.index) {
				return;
			}
			if (index < self.index) {
				self.descendLeft();
			} else {
				self.descendRight();
			}
			seek();
		}

		this.reset();
		seek();
		return this;
	}

	seekToOffset(offset: number): this {
		let self = this;

		function seek() {
			if (offset >= self.offset && offset < self.endOffset) {
				return;
			}
			if (offset < self.offset) {
				self.descendLeft();
			} else if (offset >= self.endOffset) {
				self.descendRight();
			}
			seek();
		}

		this.reset();
		seek();
		return this;
	}

	private moveToLeftMost() {
		while (this.node.left !== null) {
			this.descendLeft();
		}
		return this;
	}

	private moveToRightMost() {
		while (this.node.right !== null) {
			this.descendRight();
		}
		return this;
	}

	private push(node: LineNode) {
		this.stack = cons(node, this.stack);
	}

	private pop() {
		this.stack = this.stack.tail;
	}
}

const fakeRoot = new LineNode();
fakeRoot.priority = -Infinity;

export function build(list: Iterable<{ length: number, delimiter: string }>) {
	let stack = cons(fakeRoot, nil);

	for (let item of list) {
		let last: LineNode = null;
		let node = new LineNode();

		node.length = item.length;
		node.delimiter = item.delimiter;

		while (stack.head.priority > node.priority) {
			last = stack.head;
			last.maintain();

			stack = stack.tail;
		}

		stack.head.right = node;
		node.left = last;
		stack = cons(node, stack);
	}

	function maintain(list: List<LineNode>) {
		if (list.tail !== nil) {
			maintain(list.tail);
		}
		list.head.maintain();
	}	

	maintain(stack);

	let root = fakeRoot.right;
	fakeRoot.right = null;
	
	return root;
}

function merge(left: LineNode, right: LineNode) {
	if (left === null) return right;
	if (right === null) return left;

	if (left.priority < right.priority) {
		let node = Object.create(left);
		node.right = merge(left.right, right);
		node.maintain();
		return node;
	} else {
		let node = Object.create(right);
		node.left = merge(left, right.left);
		node.maintain();
		return node;
	}
}

function splitLeft(walker: LineWalker, dir: (walker: LineWalker) => boolean): LineNode {
	if (walker.node === null) return null;

	if (dir(walker)) {
		return splitLeft(walker.descendLeft(), dir);
	} else {
		let node = Object.create(walker.node);
		node.right = splitLeft(walker.descendRight(), dir);
		node.maintain();
		return node;
	}
}

function splitRight(walker: LineWalker, dir: (walker: LineWalker) => boolean): LineNode {
	if (walker.node === null) return null;

	if (dir(walker)) {
		let node = Object.create(walker.node);
		node.left = splitRight(walker.descendLeft(), dir);
		node.maintain();
		return node;
	} else {
		return splitRight(walker.descendRight(), dir);
	}
}

function split(root: LineNode, dir: (walker: LineWalker) => boolean, leftOrRight: boolean) {
	let walker = new LineWalker(root);
	if (leftOrRight) {
		return splitLeft(walker, dir);
	} else {
		return splitRight(walker, dir);
	}
}
