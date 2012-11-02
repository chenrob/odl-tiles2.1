(function ($) {
	var isLoading = false;
	var noMoreData = false;
	var heights = [];
	var tiles = [];
	var pagesShown = 1;
	
	var options;
	var container;
	
	var methods = {
		init: function(settings) {
			options = $.extend({
				numCols: 3,
				vertSpacing: 14,
				horizSpacing: 10,
				maxPages: 1
			}, settings);
			
			container = this;
			this.css({position: 'relative'});
			
			for (var index = 0; index < options.numCols; index++)
			{
				heights[index] = 0;
				tiles[index] = [];
			}
			
			//place tiles
			this.children().each(function(index, tileElement) {
				methods.place(tileElement);
			});
			
			if (options.infiniteScroll && !noMoreData)
				methods.infiniteScroll();
		},
		place: function(tile) {
			//make sure all images in the tile have width/height set in css or on the image tag
			//so the dimension calculations are performed correctly
			tile = $(tile);
			
			var placementIndex = methods.shortest();
			var tileWidth = tile.width();
			var left = placementIndex * (tileWidth + options.vertSpacing);
			var top = heights[placementIndex];
			heights[placementIndex] += tile.height();
			
			if (top > 0) //don't add unnecessary whitespace to first row
			{
				top += options.horizSpacing;
				heights[placementIndex] += options.horizSpacing;
			}
			
			tile.data('columnIndex', placementIndex);
			tile.data('position', tiles[placementIndex].length);
			
			tiles[placementIndex].push(tile);
			
			tile.css({position: 'absolute', left: left + 'px', top: top + 'px'});
			container.css({height: methods.tallestCol()});
		},
		tallestCol: function () {
			return Math.max.apply(Math, heights);	
		},
		shortest: function () {
			var shortest = 0;
			var minHeight = null;
			for (var i = 0; i < heights.length; i++)
				if (minHeight === null || heights[i] < minHeight)
				{
					minHeight = heights[i];
					shortest = i;
				}
			
			return shortest;
		},
		infiniteScroll: function() {
			var didScroll = false;
		
			var fbScrolledPos = 0;
			var fbScrollHeight = 0;
			
			var isFacebook = false; //@robert TODO
			
			// on facebook scroll detection is a bit different
			if (isFacebook && typeof(FB) !== 'undefined')
			{
				setInterval(function() {
					FB.Canvas.getPageInfo(
						function (info) {
							fbScrollHeight = info.clientHeight;
							
							if (info.scrollTop > fbScrolledPos)
							{
								didScroll = true;
							}
							
							fbScrolledPos = info.scrollTop;
					});
				}, 250);
			}
			else
			{
				$(window).scroll(function() {
					didScroll = true;
				});
			}

			setInterval(function() {
				if (didScroll)
				{
					didScroll = false;
					
					var scrollThreshold;
					var scrollTop;
					
					if (isFacebook)
					{
						scrollThreshold = fbScrollHeight * 0.8;
						scrollTop = fbScrolledPos;
					}
					else
					{
						// detect when the viewer gets close to the bottom of the page
						scrollThreshold = $(window).height() * 0.8;
						scrollTop = $(document).scrollTop();
					}

					if (noMoreData) return false;
					if (pagesShown >= options.maxPages) return false;
					if (isLoading) return false;
					if (scrollTop < scrollThreshold) return false;
					
					//self._showLoading(); // TODO: implement this if I have time (@Teju)

					isLoading = true;
					pagesShown++;
					
					methods.fetchNextTiles();
				}
			}, 500);
		},
		fetchNextTiles: function() { // fetches and places
			var params = {nextPg: true};
			$.extend(params, options.nextParams);
			
			$.ajax({
				url: options.nextUrl,
				type: 'POST',
				data: params,
				dataType: 'html',
				success: function(response) {
					if (!response.trim()) //response returned nothing but whitespace
					{
						self._noMoreData = true;
					}
					else
					{
						var displayTiles = $(response);
						var numTilesToPlace = 0;
						
						container.append(displayTiles);
						
						displayTiles.css({visibility:'hidden'}); //initially hide the elements
						
						// place the tiles
						displayTiles.each(function(index, tileElement) {
							methods.place(tileElement);
							numTilesToPlace ++;
							$(tileElement).css({visibility:'visible'}); // show the elements
						});
						
						if (numTilesToPlace == 0)
						{
							noMoreData = true;
						}
						
						isLoading = false;
					}
				}
			});
		},
		reTile: function(tile) {
			tile = $(tile);
			
			var tileData = tile.data();
			var column = tiles[tileData.columnIndex];
			var currentTilePosition = tileData.position;
			
			var currentTileHeightWithPadding = tile.position().top + tile.height() + options.horizSpacing;
			var nextTileTopPosition = $(column[currentTilePosition + 1]).position().top;
			var tileHeightDiff = currentTileHeightWithPadding - nextTileTopPosition;
			if (tileHeightDiff !== 0)
			{
				var newTopPos = 0;
				var $tileToResize;
				
				for (var i = currentTilePosition + 1; i < column.length; i++)
				{
					$tileToResize = $(column[i]);
					newTopPos = $tileToResize.position().top + tileHeightDiff;
					$tileToResize.css({top: newTopPos});
				}
				
				heights[tileData.columnIndex] += tileHeightDiff;
				container.css({height: methods.tallestCol()});
			}
		}
	};
	
	$.fn.tileUI = function(method) {
		if (methods[method])
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if (typeof method === 'object' || !method)
			return methods.init.apply(this, arguments);
		else
			$.error('Method ' +  method + ' does not exist on jQuery.tooltip');
	};
})(jQuery);

