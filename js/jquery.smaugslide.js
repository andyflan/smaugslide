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

Smaugslide = function(element, options) {
	this.element = element;
		
	this.options = options;

	this.init();
}

Smaugslide.prototype.init = function() { };

(function($) {
	Smaugslide.prototype.init = function() {
		var that = this;

		//work out the available widths
		var w = $(this.element).parent().width();
		var uw = w * $(this.element).children('li').length;
		
		//create the new wrapper elements
		var elSlideContainer = $('<ul class="' + this.options.baseClassName + '-slides"></ul>');
		
		//initialise some possibly used vars	
		var slideTimer, elSecondaryControls, elPrevious, elNext;
		
		//if we're using seconary nav, set it up
		if (this.options.secondaryNavigation) {
			elSecondaryControls = $(this.options.secondaryNavigation);

			//stimulate the click of the primary nav from click of secondary nav
			$(elSecondaryControls).addClass(this.options.baseClassName + '-secondary-controls').find('a').click(function() {
				var i = $(elSecondaryControls).children('li').index($(this).parent());	
				$(this.element).children('li').eq(i).find('a').click();
				return false;
			});
		}

		//create some options for use when calling moveto
		var mOpts = {
			controls: this.element,
			slides: elSlideContainer,
			w: w,
			effect: this.options.easing,
			duration: this.options.duration,
			secondaryNavigation: elSecondaryControls,
			activeClassName: this.options.activeClassName,
			moreInfoDiv: this.options.moreInfoDiv 
		};
		
		//apply height and width to slide container
		$(elSlideContainer).height(this.options.slideHeight + 'px').width(uw + 'px');
		
		//if we're auto scrolling stop animation interval on hover
		if (this.options.autoScroll) {			
			$(elSlideContainer).hover(function() {
				clearInterval(slideTimer);
			}, function() {
				slideTimer = setInterval(function() {
					that.moveTo('next', mOpts);
				}, that.options.pause);
			});
		}

		//wrap the slide controls and add the slide container
		$(this.element)
			.wrap('<div class="' + this.options.baseClassName + '"></div>')
			.addClass(this.options.baseClassName + '-slide-controls')
			.before(elSlideContainer);
		
		//if we're using next/prev create the links
		if (this.options.useNextPrevNav) {
			elPrevious = $('<a href="#" class="nav previous" rel="previous"></a>');
			elNext = $('<a href="#" class="nav next" rel="next"></a>');
			$(elSlideContainer).parent().append(elPrevious).append(elNext).find('a.nav').click(function() {
				that.moveTo($(this).attr('rel'), mOpts);
				return false;
			});
		}
		
		//iterate through all the slide controls creating the slides
		$(this.element).children('li').each(function(i) {
			var a = $(this).children('a');
			var more = $(this).children(that.options.moreInfoContaienerSelector);
			
			var elThisSlide = $('<li class="' + that.options.baseClassName + '-slide"></li>');

			if ($(more).length > 0) {
				$(elThisSlide).append('<div class="more-info-container">' + $(more).html() + '</div>');
			}
			
			$(more).remove();
			
			//insert the slide number
			$(a).empty().html(i+1).click(function() {
				//work out which one we've clicked on
				var i = $(that.element).children('li').index($(this).parent());

				//slide to it
				that.moveTo(i, mOpts);

				return false;	
			});
			
			//work out positioning for the span in the middle of the link
			var spanLeft = (w / 2) - ((that.options.actionButtonWidth + (that.options.actionButtonPadding * 2)) / 2);
			var spanTop = (that.options.slideHeight / 2) - ((that.options.actionButtonHeight + (that.options.actionButtonPadding * 2)) / 2);
			
			//make the main link and setup the fade in/out of the span
			if ($(a).attr('rel') !== '') {
				var elJumpLink = $('<a></a>').attr({
					href: $(a).attr('rel'),
					title: $(a).attr('title')
				}).css({
					height: that.options.slideHeight + 'px'
				}).hover(function() {
					$(this).find('span').fadeIn();	
				}, function() {
					$(this).find('span').fadeOut();
				});
			
				//make the span that holds the button graphic
				var elSpan = $('<span></span>').css({
					padding: that.options.actionButtonPadding + 'px',
					width: that.options.actionButtonWidth + 'px',
					height: that.options.actionButtonHeight + 'px',
					left: spanLeft + 'px',
					top: spanTop + 'px'
				}).html(that.options.actionButtonContent).hover(function() {
					$(a).addClass(that.options.baseClassName + '-hover');
				}, function() {
					$(a).removeClass(that.options.baseClassName + '-hover');
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
				.height(that.options.slideHeight + 'px')
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
				height: that.options.slideHeight
			}); 
			
			//append the slide to the slide container
			$(elSlideContainer).append(elThisSlide);
		});
		
		//stimulate appearance of slide 1
		$(this.element).find('li:first a').click();
		
		//set the height and width of the wrapping div (ie6 overflow fix)
		$(this.element).parent().width(w + 'px').height((this.options.slideHeight + $(this.element).outerHeight(true)) + 'px');
		
		//if we're auto scrolling start the interval
		if (this.options.autoScroll) {
			slideTimer = setInterval(function() {
				that.moveTo('next', mOpts);
			}, this.options.pause);
		}
	}	

	Smaugslide.prototype.moveTo = function(i, opts) {
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

	$.fn.smaugslide = function(options) {
		var opts = $.extend({}, $.fn.smaugslide.defaults, options);
		
		this.each(function(i, element) {
			new Smaugslide(element, opts);
		});
	};
	 
	$.fn.smaugslide.defaults = {
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