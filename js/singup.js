$(function(){
  var $jittery = $('.jiterry'),
      aText    = $jittery.text().split(''),
      letters = '';
  
  for(var i = 0; i < aText.length; i++){
    letters += '<span>'+aText[i]+'</span>';
  }
  
  $jittery.empty().append(letters);
  
  $.each($('span', $jittery), function(i){
    $(this).css('animation-delay', '-'+i+'70ms');
  });
});





var Network  = function(){

	this.canvas 		= document.getElementById('network');
	this.ctx 			= this.canvas.getContext('2d');
	this.canvas.height 	= window.innerHeight;
	this.canvas.width 	= window.innerWidth;

	this.aDots 			= [];
	this.aLines 		= [];
	this.iMaxDist 		= 170;
	this.iMinDist 		= 60;
	
	this.beat  			= 30;

	this.drawLine 		= true;

	this.mouse = {
		vx : 0,
		vy : 0,
		px : 0,
		py : 0,
		x : this.canvas.width / 2,
		y : this.canvas.height / 2,

		tm : undefined,
		moving : false
	}

	this.heartSpeed = 30;

	this.init();

}




Network.prototype.init = function()
{
	
	this.getGrd();
	this.canvas.addEventListener('mousemove', this.updateMouse.bind( this ), false);
	this.canvas.addEventListener('click', this.toggleLine.bind( this ), false);

}

Network.prototype.getGrd = function()
{
	this.grd = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
	
	this.breakpoint = 20;
	
	for (var i = 0; i < this.breakpoint; i++) {

		var h = ( (window.innerWidth*.7) / this.breakpoint ) * i;
		var color = 'hsla( ' + h + ', 100%, 50%, 1 )';
		this.grd.addColorStop( ( 1 / this.breakpoint ) * i  , color ); 

	}	
}

Network.prototype.toggleLine = function(){

	this.drawLine = !this.drawLine;

}

Network.prototype.buildDot = function(){

	this.aDots.push( new Dot( this.mouse ) );

}


Network.prototype.updateMouse = function( e ){

	this.mouse.moving = true;

	clearTimeout( this.mouse.tm );
	this.mouse.tm = setTimeout( this.mouseStop.bind( this ), 500 );

	this.mouse.px = this.mouse.x;
	this.mouse.py = this.mouse.y;

	this.mouse.x = e.clientX;
	this.mouse.y = e.clientY;

	this.mouse.vx = this.mouse.x - this.mouse.px;
	this.mouse.vy = this.mouse.y - this.mouse.py;

	this.buildDot();
	this.buildDot();
	//this.buildDot();

}

Network.prototype.mouseStop = function()
{

	this.mouse.moving = false;

}



Network.prototype.getDist = function( dot1, dot2 )
{

	var dx = dot1.x - dot2.x;
	var dy = dot1.y - dot2.y;

	return Math.sqrt(dx * dx + dy * dy);

}




Network.prototype.checkLines = function()
{

	this.aLines = [];

	for (var i = this.aDots.length - 1; i >= 0; i--) {
		
		for (var j = this.aDots.length - 1; j > i; j--) {

			var iDist = this.getDist( this.aDots[i], this.aDots[j] );

			if( iDist < this.iMaxDist && iDist >  this.iMinDist && ( this.aDots[i].r + this.aDots[j].r ) > 5.5 )
				this.aLines.push( new Line( this.aDots[i], this.aDots[j], iDist, this.iMaxDist ) );

		}

	}

}


Network.prototype.heartBeat = function(){
	
	var randX = rand( 0, window.innerWidth );
	var randY = rand( 0, window.innerHeight );
	
	for (var i = 0; i < rand( 50, 100 ); i++) {

		this.aDots.push( new Dot({
			x : randX,
			y : randY,
			vx : rand( -8, 8),
			vy : rand( -5, 5)
		}) );

	}
	
	this.beat = 0;
	
}

Network.prototype.drawOverlay = function(){
	
	this.ctx.globalCompositeOperation = "overlay";//or darken or soft-light
	this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.fillStyle = this.grd;
	this.ctx.fill();

}


















Network.prototype.update = function(){

	for (var i = this.aDots.length - 1; i >= 0; i--) {
		
		if( this.aDots[i].alive )
			this.aDots[i].update();
		else
			this.aDots.splice( i, 1 );
	
	}

	if( this.drawLine )	
		this.checkLines();
	
	if( this.beat >= this.heartSpeed && !this.mouse.moving )
		this.heartBeat();
	else
		this.beat++;

}

Network.prototype.draw = function(){

	this.ctx.globalCompositeOperation = "source-over";
	this.ctx.fillStyle = "rgba( 1, 0, 0, 1 )";
	this.ctx.fillRect( 0, 0, window.innerWidth, window.innerHeight );
	
	for (var i = this.aDots.length - 1; i >= 0; i--) {

		this.aDots[i].draw( this.ctx );

	}

	if( this.drawLine )	{
	
		for (var i = this.aLines.length - 1; i >= 0; i--) {

			this.aLines[i].draw( this.ctx );

		}

	}

	this.drawOverlay();

}

Network.prototype.run = function(){
	
	this.update();
	this.draw();

	if( this.bRuning )
		requestAnimationFrame( this.run.bind( this ) );

}

Network.prototype.start = function(){

	this.bRuning = true;
	this.run();

}

Network.prototype.stop = function(){

	this.bRuning = false;

}
