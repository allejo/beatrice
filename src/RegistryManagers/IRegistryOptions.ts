export enum TagOrder {
	FIRST,
	LAST,
}

export interface IRegistryOptions {
	tagOrder: TagOrder;
}

export function strToTagOrder(value: string): TagOrder {
	if (value.toLowerCase() === "first") {
		return TagOrder.FIRST;
	} else if (value.toLowerCase() === "last") {
		return TagOrder.LAST;
	}

	return TagOrder.FIRST;
}
