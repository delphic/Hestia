Hestia
======

A JS Library inspired by pico-8 and retro console asthetics, but with no desire to actually emulate the hardware.

Provides a palette based pixel perfect renderer - you can provide a palette, of any size.

Provides a input state tracker - you can provide key bindings (currently only mouse and keyboard supported).

JavaScript Style:
-----------------
Broadly https://github.com/delphic/Fury/blob/master/docs/Fury%20Overview.md#javascript-style

However we're a bit more forgiving of single character variables at the moment.

Build:
------
browserify core/client.js -o hestia.js

Features:
---------
Present: Rendering, Input
In Progress: SFX
Outstanding: SFX, Music, Map