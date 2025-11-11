import { PDFPageProxy } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { HighlightRect } from '../types';

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();

// Heuristic to check if two items are on the same line based on their vertical position.
const isSameLine = (item1: TextItem, item2: TextItem, tolerance = 2) => {
    return Math.abs(item1.transform[5] - item2.transform[5]) < tolerance;
};

const createRectForLine = (line: TextItem[], viewportHeight: number): HighlightRect => {
    const first = line[0];
    const last = line[line.length - 1];

    const left = first.transform[4];
    const width = (last.transform[4] + last.width) - left;

    let top = -Infinity;
    let bottom = Infinity;

    // Find the highest and lowest vertical points of all text items in the line
    // to create an accurate bounding box.
    line.forEach(item => {
        // item.transform[5] is the PDF's y-coordinate for the baseline (from bottom).
        const itemTop = item.transform[5];
        const itemBottom = item.transform[5] - item.height;
        if (itemTop > top) top = itemTop;
        if (itemBottom < bottom) bottom = itemBottom;
    });

    const height = top - bottom;

    // The top of the highlight box in PDF coordinates is `top`.
    // Convert this to a CSS `top` value by subtracting from the viewport height.
    const y = viewportHeight - top;

    return { x: left, y, width, height };
};


export async function findHighlightRects(page: PDFPageProxy, quote: string): Promise<HighlightRect[]> {
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    const normalizedQuote = normalize(quote);

    if (!normalizedQuote) return [];

    const items = textContent.items.filter((item): item is TextItem => 'str' in item && !!item.str.trim());

    let startIndex = -1;
    let endIndex = -1;

    // Use a sliding window over the text items to find the sequence that matches the quote.
    for (let i = 0; i < items.length; i++) {
        let composedText = '';
        for (let j = i; j < items.length; j++) {
            composedText += items[j].str;
            if (items[j].hasEOL) {
                composedText += ' ';
            }

            if (normalize(composedText).includes(normalizedQuote)) {
                startIndex = i;
                endIndex = j;
                break;
            }
        }
        if (startIndex !== -1) break;
    }

    if (startIndex === -1) {
        console.warn("Could not find quote in PDF text content:", normalizedQuote);
        return [];
    }
    
    const matchedItems = items.slice(startIndex, endIndex + 1);
    const rects: HighlightRect[] = [];
    if (matchedItems.length === 0) return rects;

    // Group the matched items by line to create a bounding box for each line of the quote.
    let currentLine: TextItem[] = [matchedItems[0]];

    for (let i = 1; i < matchedItems.length; i++) {
        if (isSameLine(matchedItems[i - 1], matchedItems[i])) {
            currentLine.push(matchedItems[i]);
        } else {
            rects.push(createRectForLine(currentLine, viewport.height));
            currentLine = [matchedItems[i]];
        }
    }
    
    // Process the last line of the quote.
    if (currentLine.length > 0) {
        rects.push(createRectForLine(currentLine, viewport.height));
    }
    
    return rects;
}