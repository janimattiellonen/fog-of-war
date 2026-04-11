# Map editor

Maps are tedious to create by hand. Currently I can also create maps by providing a png image that uses certain colours.

I'd like to have an editor that I can use to draw the map with. The editor can be integrated into the current project.

Route: /editor

## Specs

The editor has two main. components, toolbox and "drawing" area, where you can draw the map.

## Toolbox

The toolbox contains tools for selecting tile types, a selecting tool and an eraser.

### Selecting tile types
Tile types are grouped by class:
- Floor:
    - ...
    - ...
- Wall:
    - ...
    - ...

Currently tiles have no names, only an image. The images are grouped in ddirectories that are named by the class. At this point we can use the directory names for class titles and just render the tile in the toolbox. At a later point we can include more metadata.


### Selecting tool

With the selecting tool I can select one or more tiles in the drawing area and delete them if I want. When one or more tiles have been selected, show a delete icon, which asks for confirmation if I press it.

I can also choose to fill the selected area with a tile I want. Implement a way to allow me to select a tile which will be used for filling the selected area.

### Auto border

The "Auto border" tool allows me to select a wall tile and then have the editor automatically draw a wall around the edges of the map with the selected wall tile. 


### Allow editing maps in public/maps

The user should be able to edit any map that is in public/map and save the changes to the same file.

When the "Select map" menu is open and the user hovers over a map, show "Edit" link on top of the map item. When clicked, the map would be opened in the editor. The editor needs a new button named "Save .map". Clicking this button will either update the existing map, or allow the user to create a new map. It would be nice if the user could choose, where the file isa saved.

