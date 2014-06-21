/*
 *
 *	Project: 		Smaugslide
 *
 *	Version: 		1.2.0 (21st June 2014)
 *
 *	Author: 		Andrew Flannery (Inheritweb)
 *					Inspired by Phenotype.net home page (Robin North, 2009)
 *
 *	Description: 	Turn an unordered list of linked-to images into a 
 *					fancy slideshow
 *
 *	License: 		GNU General Public License
 *
 *	Copyright:		2009-2014 Andrew Flannery
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
 *	------------------------------------------------------------------------------
 *
 *	21-06-2014 	- 	1.2.0
 *	Added 		- 	Support for responsive
 *	Added		- 	Grunt build
 *	Added		- 	SCSS
 * 	Added		- 	jQuery upgrade
 *	Refactored	- 	The whole thing into a more object based approach
 *
 *	------------------------------------------------------------------------------
 *
 *	05-11-2009	- 	1.15.0
 *	Fixed		- 	Changed the way more info div works to allow links to be part 
 *					of more info
 *
 *	------------------------------------------------------------------------------
 *
 *	03-09-2009	-	1.1.0
 *	Fixed 		- 	Nest a tags in additional content bug
 *	Added		- 	IE6 Class
 *
 *	------------------------------------------------------------------------------
 */

Smaugslide = function(element, options) {
	this.element = element;
		
	this.options = options;

	this.init();
}

Smaugslide.prototype.init = function() { };

(function($) {
	/*
	 *	Index of currently active slide
	 */

	Smaugslide.prototype.active_index = null;

	/*
	 *	A place to store with current width of the component, used by responsive support
	 */

	Smaugslide.prototype.component_width = null;

	/*
	 *	A place to store with current width of the slider container, used by responsive support
	 */

	Smaugslide.prototype.strip_width = null;

	/*
	 *	Timer used for autoscroll
	 */

	Smaugslide.prototype.slide_timer = null;

	/*
	 *	A container for slider elements
	 */

	Smaugslide.prototype.elements = {
		slides_container:  null,
		main_navigation_container: null,
		secondary_controls:  null,
		previous:  null,
		next:  null
	}

	Smaugslide.prototype.init = function() {
		var that = this;
		
		this.elements.main_navigation_container = $(this.element);

		//create the new slide container element
		this.elements.slides_container = $('<ul class="' + this.options.baseClassName + '-slides"></ul>');
		
		//wrap the slide controls and add the slide container
		$(this.element)
			.wrap('<div class="' + this.options.baseClassName + '"></div>')
			.addClass(this.options.baseClassName + '-slide-controls')
			.before(this.elements.slides_container);

		//iterate through all the slide controls, creating the slides
		$(this.element).children('li').each(function(index, item) {
			that.create_slide(item, index);
		});

		//if we're using next/prev create the links
		if (this.options.useNextPrevNav) {
			this.elements.previous = $('<a href="#" class="nav previous" rel="previous"></a>');
			this.elements.next = $('<a href="#" class="nav next" rel="next"></a>');
			
			$(this.elements.slides_container).parent().append(this.elements.previous).append(this.elements.next);
		}

		//if we're using seconary nav, set it up
		if (this.options.secondaryNavigation) {
			this.elements.secondary_controls = $(this.options.secondaryNavigation).addClass(this.options.baseClassName + '-secondary-controls');
		}

		//if we're auto scrolling start the interval
		if (this.options.autoScroll) {
			this.slide_timer = setInterval(function() {
				that.moveTo('next');
			}, this.options.pause);
		}

		this.attach_events();

		this.check_metrics();
		
		//click the first slide
		$(this.element).find('li:first a').trigger('click');
	}	

	Smaugslide.prototype.attach_events = function() {
		var that = this;

		//main nav item click event
		this.elements.main_navigation_container.find('a').on('click', function(event) {
			//work out which one we've clicked on
			var i = $(that.element).find('li').index($(this).parent());

			event.preventDefault();

			//slide to it
			that.moveTo(i);
		});

		//next/prev links click events
		$(this.element).find('a.nav').on('click', function(event) {
			event.preventDefault();
			
			that.moveTo($(this).attr('rel'));
		});

		//secondary nav click event
		$(this.elements.secondary_controls).find('a').on('click', function(event) {
			//which one was clicked?
			var i = $(that.elements.secondary_controls).children('li').index($(this).parent());	
			
			event.preventDefault();

			//trigger click on corresponding nav element
			$(that.element).children('li').eq(i).find('a').trigger('click');
		});

		//autoscroll hover
		if (this.options.autoScroll) {			
			$(this.elements.slides_container).hover(function() {
				clearInterval(that.slide_timer);
			}, function() {
				that.slide_timer = setInterval(function() {
					that.moveTo('next');
				}, that.options.pause);
			});
		}

		//window resize
		$(window).on('resize', function(event) {
			that.check_metrics();
		});
	}

	Smaugslide.prototype.create_slide = function(input, index) {
		var that = this,
			a = $(input).find('a'),
			more = $(input).find(that.options.moreInfoContaienerSelector),
			this_slide = $('<li class="' + that.options.baseClassName + '-slide"></li>');

		if ($(more).length > 0) {
			$(this_slide).append('<div class="more-info-container">' + $(more).html() + '</div>');
		}
		
		$(more).remove();
		
		//insert the slide number
		$(a).empty().html(index+1);
		
		//work out positioning for the span in the middle of the link
		var spanLeft = (this.component_width / 2) - ((that.options.actionButtonWidth + (that.options.actionButtonPadding * 2)) / 2);
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
			$(this_slide).append(elJumpLink);
		}			
		//make the title
		var elTitle = $('<h3>' + $(a).attr('title') + '</h3>');
		
		//slap it all together and add all the markup
		$(this_slide)
			.addClass('loading')
			.height(that.options.slideHeight + 'px')
			.width(this.component_width + 'px')
			.append(elTitle)
			
		//load the image
		var img = new Image();
		
		$(img).hide(); 
		
		$(img).load(function() {
			$(this).appendTo(this_slide).css('display', 'inline');
			
			if (img.width > this.component_width) {
				var neg = (img.width - this.component_width) / 2;
				$(this).css('margin-left', -neg + 'px');
			}
			
			$(this_slide).removeClass('loading');
		}).attr({
			src: $(a).attr('href'),
			alt: $(a).attr('title'),
			title: $(a).attr('title'),
			height: that.options.slideHeight
		}); 
		
		//append the slide to the slide container
		$(that.elements.slides_container).append(this_slide);
	}

	Smaugslide.prototype.check_metrics = function() {
		var offset = -(this.active_index * this.component_width);

		this.component_width = $(this.element).parent().width();
		this.strip_width = this.component_width * $(this.element).children('li').length;
		
		//apply height and width to slide container
		$(this.elements.slides_container).css({
			"height": this.options.slideHeight,
			"width": this.strip_width
		}).find('.' + this.options.baseClassName + '-slide').css({
			"width": this.component_width
		});

		//position the slider
		$(this.elements.slides_container).css({
			"margin-left": offset 
		});
	}

	Smaugslide.prototype.moveTo = function(i) {
		var that = this;

		//get the current slide and remove the active class
		var currentSlide = $(this.element).find('li.' + this.options.activeClassName).removeClass(this.options.activeClassName);

		//do the same for secondary navigation if we're using it
		if (this.options.secondaryNavigation) {
			$(this.elements.secondary_controls).find('li.' + this.options.activeClassName).removeClass(this.options.activeClassName);	
		}
		
		//if its a keyword rather than an int work out what it should be as an int
		if (i == 'first') {
			i = 0;
		} else if (i == 'previous') {
			if (this.active_index == 0) {	
				i = $(this.elements.main_navigation_container).find('li').length - 1;
			} else {
				i == this.active_index--;
			}
		} else if (i == 'next') {
			i = this.active_index;
			if (i == ($(this.element).find('li').length - 1)) {
				i = 0;
			} else {
				i++;
			}
		} else if (i == 'last') {
			i = $(this.element).find('li').length - 1;
		}
		
		//get the next slide and add the active class to it
		var nextSlide = $(this.element).find('li').eq(i).addClass(this.options.activeClassName);

		//do the same for secondary navigation if we're using it
		if (this.options.secondaryNavigation) {
			$(this.elements.secondary_controls).children('li').eq(i).addClass(this.options.activeClassName);	
		}

		//work out what the offset should be
		var offset = -(i * this.component_width);

		//if we're using it fade out the more info div and post the new content in there
		if (this.options.moreInfoDiv != '') {
			$(this.options.moreInfoDiv).empty();
			$(this.options.moreInfoDiv).html($(this.elements.slides_container).find('li').eq(i).find('div.more-info-container').html()) 
		}
		
		//perform the animation and fade in the more info div content if we're using it
		$(this.elements.slides_container).animate({ marginLeft: offset }, { 
			duration: this.options.duration, 
			easing: this.options.effect,
			complete: function() {
				if (that.options.moreInfoDiv != '') {
					$(that.options.moreInfoDiv).children().fadeIn().queue(function() {
						$(this).dequeue();
					});
				}

				that.active_index = i;
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