# Owncloud-Bookmarks-Firefox

A port of [this chrome extension](https://chrome.google.com/webstore/detail/owncloud-bookmarks/eomolhpeokmbnincelpkagpapjpeeckc) to Firefox's [Addon SDK](https://developer.mozilla.org/en-US/Add-ons/SDK/).

## Prerequisites / Installation

* install node &amp; npm
* install [jpm](https://github.com/mozilla/jpm) `npm install -g jpm`
* install Firefox Dev Edition

To run:

* `jpm -b ./path/to/devedition run`

To build:

* `jpm -b ./path/to/devedition xpi`

Done:
* re-organized the code to work with jpm &#10003;
* added SDK code to create the button and panel &#10003;

TODO:
* get the panel working ( haven't really looked at it )
* get the config page working


