# Notes

We are now going to implement a "Character" system. This feature will allow a user to select a character name from a dropdown; selecting a certain character will configure the attributes to certain values, as well as the list of abilities and items. A character can start with any ability or item from the existing list of items or abilities, and any value for any attribute. 

The end result of this system will replace the current CharacterName component with a similarly-style dropdown from which a character can be selected. 

To begin, we need to consider the structure of this data. Create a new "characters.json" file in the data folder and create a data structure for the example character below: 

Name: Agnes Baker
Description: The Waitress
Willpower: 5
Intellect: 2
Combat: 2
Health: 6
Sanity: 8
Starting Items, in order: Heirloom of Hyperborea
Starting Abilties, in order: 