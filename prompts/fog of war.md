# Fog of war


I want to create a big area where the character may walk around. Only a certain part of the area, around the player, is visible at any time. The rest is covered in darkness.


## Character

A red circle pulsating in different red hues. The circle is 25px in diameter.

## Visible area

The visible area surrounds the character and is 150px in diameter. The edegs of the visible area is a bit blurry, making the exact border between the visible area and the darkness a bit fuzzy.

The visible area has no color itself.

## Playing field

The playing field is a defined area, where the character can freely move around. Not all of the playing field is within the browser window's viewport.  



## Viewport

The viewport is a defined area in the browser, that shows a specific part of the playing field. The visible area is always in the center of the viewport. 


## Movement

The character can be "moved" using the arrow keys, wasd or, if a numeric keypad exists, keys 8, 6, 2 and 4. As said earlier, the character stays alwaysd in the center of the viewport, so movement is really the viewport content been scrolled in different directions. 

To consider: as anything is only visible in the visible area, it is debatable, whether only items in the visible area needs to be rendered. However, items outside th visible area, yet within th viewport, may need to be tracked so that they can be rendered when required.

## Tech stack

This project is to be playable in a web browser. 

Here is a list of minimum tech requirements:
- Vite
- React 19
- Typescript
- typecheck
- lint
- use port 5122

If I have a too old node installed, set up an .nvmrc with proper Node version. Install specific Node with nvm is needed. DO NOT use an older version of Vite if Node version does not match

## Implementation details

- always use {} with if's
- don't put game logic in the canvas component. Separate game code into own files.


## Improvements

- increase the visible area to 300px 