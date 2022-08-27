// Original JavaScript Code from  Marijn Haverbeke (http://eloquentjavascript.net/1st_edition/appendix2.html)

export interface HeapElement<T> {
    element: T;
    score: number;
}

// score が小さい順に取り出す heap
export class BinaryHeap<T> {
    content: HeapElement<T>[];
    // scoreFunction: (x: T) => number;

    constructor() {
        this.content = [];
        // this.scoreFunction = scoreFunction;
    }

    push(element: T, score: number) {
        this.content.push({ element, score });
        this.bubbleUp(this.content.length - 1);
    }

    pop(): HeapElement<T> | undefined {
        const result = this.content[0];
        const end = this.content.pop();
        if (end === undefined) return undefined;
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    }

    remove(node: HeapElement<T>) {
        const length = this.content.length;
        // To remove a value, we must search through the array to find
        // it.
        for (let i = 0; i < length; i++) {
            if (this.content[i] != node) continue;
            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            const end = this.content.pop();
            // If the element we popped was the one we needed to remove,
            // we're done.
            if (i === length - 1) break;
            if (end === undefined) break; // 追加
            // Otherwise, we replace the removed element with the popped
            // one, and allow it to float up or sink down as appropriate.
            this.content[i] = end;
            this.bubbleUp(i);
            this.sinkDown(i);
            break;
        }
    }

    size() {
        return this.content.length;
    }

    private bubbleUp(n: number) {
        // Fetch the element that has to be moved.
        const { element, score } = this.content[n];
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            const parentN = Math.floor((n + 1) / 2) - 1,
                parent = this.content[parentN];
            // If the parent has a lesser score, things are in order and we
            // are done.
            if (score >= parent.score) break;

            // Otherwise, swap the parent with the current element and
            // continue.
            this.content[parentN] = { element, score };
            this.content[n] = parent;
            n = parentN;
        }
    }

    private sinkDown(n: number) {
        // Look up the target element and its score.
        const length = this.content.length,
            { element, score: elemScore } = this.content[n];

        for (;;) {
            // Compute the indices of the child elements.
            const child2N = (n + 1) * 2,
                child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            let swap = null;
            const child1Score = null;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                const { score: child1Score } = this.content[child1N];
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                const { score: child2Score } = this.content[child2N];
                if (child2Score < (swap === null || child1Score === null ? elemScore : child1Score)) swap = child2N;
            }

            // No need to swap further, we are done.
            if (swap === null) break;

            // Otherwise, swap and continue.
            this.content[n] = this.content[swap];
            this.content[swap] = { element, score: elemScore };
            n = swap;
        }
    }
}
