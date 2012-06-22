# Development & Production

## Prerequisites

* Node.js
* npm
* Java (for the closure compiler)

Then install `tpo`:

    > npm install

## Development

To use the development version you'll have to build a dependency file first, which can be done with:

    > make build/deps.js

Then, for example, load examples/flatland/index.html

## Production

Make a production build with:

    > make

Make a production debug build with:

    > make build/tpo-debug.js

# Glossary

## TextRun

A string of text that may contain markup. A TextRun consists of a series of Glue, Boxes, Penalties and Elements. A TextRun usually represents a paragraph of text (with possibly inline markup.)

## TextBox

A TextBox is a rectangular shape that contains a partial or complete TextRun. A TextBox has both a width and a height, but no position. When all text boxes have a different y position, they can be considered lines, but this is not always so.

The following are legal groups of textblocks:
     _______________________
    [___________1___________]
    [___________2___________]
    [___________3___________]
    [___________4___________]
     _______________________
    [___________1___________]
    [_________2_________]
    [_______3_______]
    [_____4_____]
     _______________________
    [___________1___________]
    [___2___]       [___3___]
    [___3___]       [___4___]
    [___5___]_______[___6___]
    [___________7___________]
              ___
           __[_1_]__
         _[____2____]_
        [______3______]
        [______4______]
          [____5____]
             [_6_]

A TextRun will flow from one block into another sequentially. TextBoxes are only concerned with width and height. Their positioning is determined by a layout algorithm.

## TextFlow

The line breaking algorithm that makes a TextRun flow from one TextBox to another, while trying to find the global mimimum of word-spacing for the entire TextRun. If the TextRun width is larger than the combined width of the TextBoxes, a new TextBox is generated with the same width as the TextBox right before the overflow.

If the TextRun is shorter than the combined width of the TextBox only those that are filled will be returned. It is up to the layout algorithm to detect if there are any other TextRuns that can flow into the remaining TextBox.
