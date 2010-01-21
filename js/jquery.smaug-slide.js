/*
*
*	Project: 		SmaugSlide
*
*	Version: 		1.15 (5th November 2009)
*
*	Author: 		Rolled by Losource (losource.net)
*					Inspired by Phenotype.net home page (Robin North, 2009)
*
*	Description: 	Turn an unordered list of linked-to images into a 
*					fancy slideshow
*
*	License: 		GNU General Public License
*
*	Copyright:		2009 Andrew Flannery
*
*	This program is free software: you can redistribute it and/or modify
*	it under the terms of the GNU General Public License as published by
*	the Free Software Foundation, either version 3 of the License, or
*	(at your option) any later version.
*
*	This program is distributed in the hope that it will be useful,
*	but WITHOUT ANY WARRANTY; without even the implied warranty of
*	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
*	GNU General Public License for more details.
*
*	You should have received a copy of the GNU General Public License
*	along with this program. If not, see <http://www.gnu.org/licenses/>.
*
*	TODO: 	Make it possible to use something other than numbers to (thumbs 
*			maybe??) to label the slide controls
*
*	TODO:	Reset interval (timeout) when user intervenes and clicks on the 
*			nav in some way
*
*	TODO:	Recurse image loading maybe??
*
*	Changes:
*
*	(dd-mm-yyyy)
*
*	--------------------------------------------------------------------------
*
*	05-11-2009	-	1.15
*	Fixed	- 	Changed the way more info div works to allow links to be part 
*				of more info
*
*	--------------------------------------------------------------------------
*
*	03-09-2009	-	1.1
*	Fixed 	- 	Nest a tags in additional content bug
*	Added	- 	IE6 Class
*
*	--------------------------------------------------------------------------
*/

(function($) {
	$.fn.smaugSlide = function(options) {
		var opts = $.extend({}, $.fn.smaugSlide.defaults, options);
		
		this.each(function(i, ul) {
			//work out the available widths
			var w = $(ul).parent().width();
			var uw = w * $(ul).children('li').length;
			
			//create the new wrapper elements
			var elSlideContainer = $('<ul class="' + opts.baseClassName + '-slides"></ul>');
			
			//initialise some possibly used vars	
			var slideTimer, elSecondaryControls, elPrevious, elNext;
			var classIe6 = '';
			
			//if we're using seconary nav, set it up
			if (opts.secondaryNavigation) {
				elSecondaryControls = $(opts.secondaryNavigation);

				//stimulate the click of the primary nav from click of secondary nav
				$(elSecondaryControls).addClass(opts.baseClassName + '-secondary-controls').find('a').click(function() {
					var i = $(elSecondaryControls).children('li').index($(this).parent());	
					$(ul).children('li').eq(i).find('a').click();
					return false;
				});
			}

			//create some options for use when calling moveto
			var mOpts = {
				controls: ul,
				slides: elSlideContainer,
				w: w,
				effect: opts.easing,
				duration: opts.duration,
				secondaryNavigation: elSecondaryControls,
				activeClassName: opts.activeClassName,
				moreInfoDiv: opts.moreInfoDiv 
			};
			
			//apply height and width to slide container
			$(elSlideContainer).height(opts.slideHeight + 'px').width(uw + 'px');
			
			//if we're auto scrolling stop animation interval on hover
			if (opts.autoScroll) {			
				$(elSlideContainer).hover(function() {
					clearInterval(slideTimer);
				}, function() {
					slideTimer = setInterval(function() {
						moveTo('next', mOpts);
					}, opts.pause);
				});
			}

			//is it IE6?
			if (jQuery.browser.msie && parseInt(jQuery.browser.version, 10) < 7) classIe6 = ' ie6';

			//wrap the slide controls and add the slide container
			$(ul)
				.wrap('<div class="' + opts.baseClassName + classIe6 + '"></div>')
				.addClass(opts.baseClassName + '-slide-controls')
				.before(elSlideContainer);
			
			//if we're using next/prev create the links
			if (opts.useNextPrevNav) {
				elPrevious = $('<a href="#" class="nav previous" rel="previous"></a>');
				elNext = $('<a href="#" class="nav next" rel="next"></a>');
				$(elSlideContainer).parent().append(elPrevious).append(elNext).find('a.nav').click(function() {
					moveTo($(this).attr('rel'), mOpts);
					return false;
				});
			}
			
			//iterate through all the slide controls creating the slides
			$(ul).children('li').each(function(i) {
				var a = $(this).children('a');
				var more = $(this).children(opts.moreInfoContaienerSelector);
				
				var elThisSlide = $('<li class="' + opts.baseClassName + '-slide"></li>');

				if ($(more).length > 0) {
					$(elThisSlide).append('<div class="more-info-container">' + $(more).html() + '</div>');
				}
				
				$(more).remove();
				
				//insert the slide number
				$(a).empty().html(i+1).click(function() {
					//work out which one we've clicked on
					var i = $(ul).children('li').index($(this).parent());

					//slide to it
					moveTo(i, mOpts);
	
					return false;	
				});
				
				//work out positioning for the span in the middle of the link
				var spanLeft = (w / 2) - ((opts.actionButtonWidth + (opts.actionButtonPadding * 2)) / 2);
				var spanTop = (opts.slideHeight / 2) - ((opts.actionButtonHeight + (opts.actionButtonPadding * 2)) / 2);
				
				//make the main link and setup the fade in/out of the span
				if ($(a).attr('rel') !== '') {
					var elJumpLink = $('<a></a>').attr({
						href: $(a).attr('rel'),
						title: $(a).attr('title')
					}).css({
						height: opts.slideHeight + 'px'
					}).hover(function() {
						$(this).find('span').fadeIn();	
					}, function() {
						$(this).find('span').fadeOut();
					});
				
					//make the span that holds the button graphic
					var elSpan = $('<span></span>').css({
						padding: opts.actionButtonPadding + 'px',
						width: opts.actionButtonWidth + 'px',
						height: opts.actionButtonHeight + 'px',
						left: spanLeft + 'px',
						top: spanTop + 'px'
					}).html(opts.actionButtonContent).hover(function() {
						$(a).addClass(opts.baseClassName + '-hover');
					}, function() {
						$(a).removeClass(opts.baseClassName + '-hover');
					});
					
					//slap it all together and add all the markup
					$(elJumpLink).append(elSpan);
					$(elThisSlide).append(elJumpLink);
				}			
				//make the title
				var elTitle = $('<h3>' + $(a).attr('title') + '</h3>');
				
				//slap it all together and add all the markup
				$(elThisSlide)
					.addClass('loading')
					.height(opts.slideHeight + 'px')
					.width(w + 'px')
					.append(elTitle)
					
				//load the image
				var img = new Image;
				
				$(img).hide(); 
				
				jQuery(img).load(function() {
					$(this).appendTo(elThisSlide).css('display', 'inline');
					
					if (img.width > w) {
						var neg = (img.width - w) / 2;
						$(this).css('margin-left', -neg + 'px');
					}
					
					$(elThisSlide).removeClass('loading');
				}).attr({
					src: $(a).attr('href'),
					alt: $(a).attr('title'),
					title: $(a).attr('title'),
					height: opts.slideHeight
				}); 
				
				//append the slide to the slide container
				$(elSlideContainer).append(elThisSlide);
			});
			
			//stimulate appearance of slide 1
			$(ul).find('li:first a').click();
			
			//set the height and width of the wrapping div (ie6 overflow fix)
			$(ul).parent().width(w + 'px').height((opts.slideHeight + $(ul).outerHeight(true)) + 'px');
			
			//if we're auto scrolling start the interval
			if (opts.autoScroll) {
				slideTimer = setInterval(function() {
					moveTo('next', mOpts);
				}, opts.pause);
			}
		});
	};

	/*
		Internal functions
	*/
	
	function moveTo(i, opts) {
		//get the current slide and remove the active class
		var currentSlide = $(opts.controls).find('li.' + opts.activeClassName).removeClass(opts.activeClassName);

		//do the same for secondary navigation if we're using it
		if (opts.secondaryNavigation) {
			$(opts.secondaryNavigation).find('li.' + opts.activeClassName).removeClass(opts.activeClassName);	
		}
		
		//if its a keyword rather than an int work out what it should be as an int
		if (i == 'first') {
			i = 0;
		} else if (i == 'previous') {
			i = $(opts.controls).children('li').index(currentSlide);
			
			if (i == 0) {	
				i = $(opts.controls).children('li').length - 1;
			} else {
				i--;
			}
		} else if (i == 'next') {
			i = $(opts.controls).children('li').index(currentSlide);
			
			if (i == ($(opts.controls).children('li').length - 1)) {
				i = 0;
			} else {
				i++;
			}
		} else if (i == 'last') {
			i = $(opts.controls).children('li').length - 1;
		}
		
		//get the next slide and add the active class to it
		var nextSlide = $(opts.controls).children('li').eq(i).addClass(opts.activeClassName);

		//do the same for secondary navigation if we're using it
		if (opts.secondaryNavigation) {
			$(opts.secondaryNavigation).children('li').eq(i).addClass(opts.activeClassName);	
		}

		//work out what the offset should be
		var offset = -i * opts.w;

		//if we're using it fade out the more info div and post the new content in there
		if (opts.moreInfoDiv != '') {
			$(opts.moreInfoDiv).empty();
			
			/*
			.children().fadeOut(function() {
				$(this).remove();	
			}).queue(function() {
				$(this).dequeue();	
			});
			*/
			$(opts.moreInfoDiv).html($(opts.slides).children('li').eq(i).find('div.more-info-container').html()) 
		}
		
		//perform the animation and fade in the more info div content if we're using it
		$(opts.slides).animate({ marginLeft: offset + 'px' }, { 
			duration: opts.duration, 
			easing: opts.effect,
			complete: function() {
				if (opts.moreInfoDiv != '') {
					$(opts.moreInfoDiv).children().fadeIn().queue(function() {
						$(this).dequeue();
					});
				}
			}
		}).queue(function() {
			$(this).dequeue();
		});
	}
	 
	$.fn.smaugSlide.defaults = {
		baseClassName: 'smaug',
		activeClassName: 'active',
		slideHeight: 300,
		easing: 'linear',
		duration: 500,
		autoScroll: false,
		pause: 5000,
		secondaryNavigation: null,
		actionButtonHeight: 42,
		actionButtonWidth: 142,
		actionButtonPadding: 20,
		actionButtonContent: 'Click to view',
		moreInfoContaienerSelector: 'div',
		moreInfoDiv: '',
		useNextPrevNav: true
	};
	
})(jQuery);