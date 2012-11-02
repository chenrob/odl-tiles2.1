(function ($) {
	var isLoading = false;
	var noMoreData = false;
	var heights = [];
	var columns = [];
	var pagesShown = 1;
	
	var options;
	var container;
	
	var methods = {
		init: function(settings) {
			options = $.extend({
				columnGap: 15,
				maxPages: 1,
				minCols: 1
			}, settings);
			
			container = this;
			container.css({'position': 'relative', 'margin': '0 auto'});
			
			//on window resize, run handler to reposition the tiles
			$(window).bind('resize.tiles', methods.onResize);
			methods.onResize(); //trigger immediately to position tiles
			
			if (options.infiniteScroll)
				methods.infiniteScroll();
		},
		onResize: function() {
			var tileElements = container.find('.tile');
			
			//how many columns can the window hold?
			var windowWidth = $(window).width();
			var tileWidth = tileElements.first().width();
			var numCols = Math.floor(windowWidth / (tileWidth + options.columnGap));
			numCols = Math.max(numCols, options.minCols); //ensure at least "minColumns" number of columns
			
			//if #cols change, reposition the tiles
			if (numCols != heights.length)
			{
				columns = [];
				heights = [];
				
				//temporarily remove tiles (will reattach later)
				//but get rid of the columns since we're going to create new ones
				tileElements.detach();
				container.find('.tile-column').remove();
				
				for (var i = 0; i < numCols; i++)
				{
					var css = {
						'position': 'absolute',
						'left': ((tileWidth + options.columnGap) * i) + 'px',
						'width': tileWidth + 'px'
					};
					
					heights[i] = 0;
					columns[i] = $('<div class="tile-column pull-left"></div>')
					             .css(css).appendTo(container);
				}
				
				//keep the container centered
				var width = numCols * (tileWidth + options.columnGap) - options.columnGap;
				container.css({'width': width + 'px'});
				
				//place tiles
				tileElements.each(function(index, tileElement) {
					methods.place(tileElement);
				});
			}
		},
		place: function(tile) {
			//make sure all images in the tile have width/height set in css or on the image tag
			//so the dimension calculations are performed correctly
			tile = $(tile);
			
			var placementIndex = methods.shortest();
			columns[placementIndex].append(tile);
			heights[placementIndex] += tile.outerHeight(true);
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
						noMoreData = true;
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

