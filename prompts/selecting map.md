# Selecting map

Currently the game starts when the page is loaded.

Create a simple but nice looking start menu.

The menu could be semi transparent and show through the current visible area and character.

The name of the game, "Fog of war" is displayed above the menu.

Menu items:
- Start new game
    - will select a random map
- Select map
    - show a list of available maps in public/maps
        - currently we have no real map name so use the file name and format it like this:
            - demo.map -> "Demo"
            - demo2.map -> "Demo 2"
            - etc...
        - show a small preview of the map along with the map name
    - clicking a map starts the game with the selected map