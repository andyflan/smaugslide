# Smaugslide

A jQuery plugin to make a slideshow. Bu default it takes an ordered list of linked-to images and makes some slides for 
them. It uses a numbered main navigation device and supports prev/next navigation, amongst many other options.

## Usage

To make it work, do something like this:

```html
<link rel="stylesheet" type="text/css" media="screen, projection" href="css/smaugslide.css" />

<div class="slide-container">
	<ul>
		<li><a href="gallery/1.jpg" title="Slide One"></a></li>
		<li><a href="gallery/2.jpg" title="Slide Two" rel="http://www.google.com"></a></li>
		<li><a href="gallery/3.jpg" title="Slide Three" rel="http://www.google.com"></a></li>
		<li><a href="gallery/4.jpg" title="Slide Four" rel="http://www.google.com"></a></li>
		<li><a href="gallery/5.jpg" title="Slide Five" rel="http://www.google.com"></a></li>
		<li><a href="gallery/6.jpg" title="Slide Six" rel="http://www.google.com"></a></li>
		<li><a href="gallery/7.jpg" title="Slide Seven" rel="http://www.google.com"></a></li>
		<li><a href="gallery/8.jpg" title="Slide Eight" rel="http://www.google.com"></a></li>
		<li><a href="gallery/9.jpg" title="Slide Nine" rel="http://www.google.com"></a></li>
	</ul>
</div>

<script src="js/jquery.min.js"></script>
<script src="js/jquery.smaugslide.js"></script>

<script>
	$('.slide-container').smaugslide();
</script>
```