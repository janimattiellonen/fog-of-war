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
- the edge of the visible area should be 15px thick and blurry 


## Edges

Use public/assets/tiles/brick_dark2.png to render the edges. I will want to use dedicated images as tiles in the grid you created so take this into consideration when creating code for rendering the edges.


## Floor

Use public/assets/tiles/dirt1.png as floor. 


## Map generator

Enter plan mode.

Current version runs smoothly and I can freely move the character within the edges. However, the content is boring. There are no variations of any sort. I could ask you to randomly generate a map, but I want to be able to easilly generate the map. Suggest an easy format for creating fairly big maps. Each map contains different tiles. Currently only two types of tiles: edges and floors. Each type is represented by a single image. I'd like to be able to use different images for floor and edge and other types (grass, mud, roads, paths, water, doors, monsters, etc) so we need some kind of classification.

For example if we have class FLOOR, I can add more floor images when required.

The format should be editable with a text editor and the map should preferrably be easy to understand. We don't know how many items there will be in each class (door, edge, floor, etc) so the format must support more than 10 items / class.



## PNG to map

#302721 = W00
#8B6916 = F00

A tile in the map equals 10x10 in the PNG image. Thus, 500x500 image equals to 50 x 50 tiles map.

Create a script `scripts/png-to-map-ts` that takes a path to a PNG file and parses it for the colors mentioned above and converts the image into a MAP file. The generated MAP file is stored in the same directory where the PNG file is read from. Name the MAP file `MAP-[DD-MM-yyyy-hh-mm-ss].map`.

Add the script to package.json under scripts.

I have included a simple PNG file in docs/example.png.



## Changes to demo3.map

Update map `/Users/janimattiellonen/Documents/Development/fog-of-war/public/maps/demo3.map` and randomly replace existing floor tiles (F00) with either F01 or F02 

I also added new wall (edge) tiles. Open same map and randomly replace wall tiles (W00) with W00...W06  


## Tile rename

As we now have water and wall tiles, I want you to rename all walls (directories, files, map contents, items in tiles.conf):
- W -> S