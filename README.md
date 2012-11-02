odl-tiles2.1
============
Column-centric layout engine for tiles with asymmetric heights.

Requirements
------------
This has been developed against jQuery 1.7.1 and may possibly be compatible with earlier versions of jQuery.

Usage
-----
1. Create a container block level element
```html
<section class="tiles-container"></section>
```

2. Add options (see below) as a data-tileui-options attribute to the container
```html
<section class="tiles-container" data-tileui-options="{"infiniteScroll": true, "minCols": 3}"></section>
```

3. Insert "tiles"
```html
<section class="tiles-container" data-tileui-options="{"infiniteScroll": true, "minCols": 3}">
	<div class="tile">content</div>
	<div class="tile">content</div>
</section>
```

4. Run Javascript
```html
<script type="text/javascript">
	$('.tiles-container').tileUI();
</script>
```

Options
-------
* columnGap (default: 15px)
	
	Defines the gap between columns

* maxPages (default: 1)
	
	Do not fetch more tiles after this number of "pages" of tiles has been shown.

* minCols (default: 1)
	
	Minimum number of columns to use.

History
-------
Initially implemented as a tile-centric layout engine by [Lu Wang](http://github.com/lunaru/) and fleshed out into a jQuery widget by Teju Prasad.

I later translated the implementation to a jQuery plugin and converted the engine be column-centric.  There might still be some more cleanup or tightening up to do.

Disclaimer
----------
I am aware I'm not writing this as a proper jQuery plugin (e.g. the init function doesn't return this).  This will be fixed over time.

No warranty. Not responsible for any damages or liabilities. Use at your own risk.