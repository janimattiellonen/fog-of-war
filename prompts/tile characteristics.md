# Tile characteristics

To make the game more interesting, tiles need some additional characteristics:
- some tiles make you walk slower
- some tiles cause damage (some more, some less)

Enter plan mode. Suggest a solution that allows us to easilly configure different characteristics to tiles without making it hard to maintain.


## Health bar

For the damage properties in certain tiles to have an effect on th character, we need to implement a health bar.

### Specs
- position: top rigth corner
- background color: red
- health is measured in units. Initially, the character has 20 units of health. The health bar can have a solid background color. Just calculate, how much health is removed after each "hit".




