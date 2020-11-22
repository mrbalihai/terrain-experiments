# ThreeJS Terrain Experiment
- data.bin taken from here https://github.com/turban/webgl-terrain/tree/master/assets
- Based on examples in [this blog](https://blog.mastermaps.com/2013/10/terrain-building-with-threejs.html) and the [ThreeJS documentation](https://threejs.org/docs/)

## About
I've always wanted to build a functioning navigation system like on the [Alien movie landing scene](https://youtu.be/Hzcje9gDtgw?t=65) (basically the Joy Division Unknown Pleasures album cover). This my experiment to get a feel for how it might work.
The code is mostly made up from modified samples from the resources mentioned at the top.
I doubled down on the vapourwave aesthetic and added some post processing just because I got carried away.

If I re-visit this I want to see if I can I can stream height data and have accurate real-life terrain flying around with buildings and stuff but I couldn't find a standard/reliable source right now. There are patches of reasonable density height map data for localised areas in the UK so I could use this.

## Getting Started
An index.html file is included that uses browser-native module loading.

'''
npm install && npm start
'''
