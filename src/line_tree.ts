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
		return this.baseOffset + this.node.length;
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
		this.push(this.node.left);
		return this;
	}

	descendRight() {
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
