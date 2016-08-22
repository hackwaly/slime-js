export class List<T> {
	head: T;
	tail: List<T>;

	constructor(head: T, tail: List<T>) {
		this.head = head;
		this.tail = tail;
	}
};

export const nil = new List<any>(null, null);
nil.tail = nil;

export function cons<T>(head: T, tail: List<T>) {
	return new List(head, tail);
}
