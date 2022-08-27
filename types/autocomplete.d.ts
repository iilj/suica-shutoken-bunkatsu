interface AutocompleteItem {
    label: string;
    value: string | number;
}
interface AutocompleteOption {
    /** The data from where autocomplete will lookup items to show.
     *  This data can be a simple object or an array of JSON objects.
     *  By default the format for every object in the array is {"label": "This is a text", "value": 42},
     *  but you can also change the name of the label and value keys. */
    data: AutocompleteItem[];
    /** How many items you want to show when the autocomplete is displayed.
     *  Default is 5. Set to 0 to display all available items. */
    maximumItems?: number;
    /** Whether to highlight (style) typed text on items. Default is true. */
    highlightTyped?: boolean;
    /** If set to true, will display the value of the entry after the label in the dropdown list. */
    showValue?: boolean;
    /** The number of characters that need to be typed on the input
     *  in order to trigger the autocomplete. Default is 4. */
    threshold?: number;
    /** A callback that is fired every time an item is selected.
     *  It receives an object in following format: {"label": "This is a text", "value": 42} */
    onSelectItem?: (item: AutocompleteItem) => void;
}

declare class Autocomplete {
    constructor(field: HTMLElement, options: AutocompleteOption);
}
