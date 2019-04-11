let canvas, c, size, clicked = false, path = [], result, nn;

async function load(){

	let nrequest = await fetch('data/nn.json');
	n = await nrequest.json();

	init();
}

load();

function init(){

	nn = new MLP();
	
	nn.load( n );

	canvas = document.createElement('canvas');
	size = Math.min(innerWidth, innerHeight);
	canvas.width = size;
	canvas.height = size;
	c = canvas.getContext('2d');
	
	c.fillStyle = "white";
	c.fillRect(0,0,size,size);
	c.fillStyle = "black";

	const main = document.createElement('div');
	main.id = "main";

	const left = document.createElement('div');
	left.id = "left";
	const right = document.createElement('div');
	right.id = "right";

	const predictBtn = document.createElement('button');
	predictBtn.innerText = "Predict";
	predictBtn.addEventListener('click', predict );
	
	const clear = document.createElement('button');
	clear.innerText = "Clear";
	clear.addEventListener('click', function(){
		erase();
	});

	result = document.createElement('div');
	result.innerHTML = "<br>";

	right.appendChild(predictBtn);
	right.appendChild(clear);
	right.appendChild(result);

	left.appendChild( canvas );

	main.appendChild(left);
	main.appendChild(right);
	document.body.appendChild(main);

	canvas.addEventListener('mouseup', function(){
		clicked = false;
		path = [];
	});

	canvas.addEventListener('mousedown', function(e){
		clicked = true;
		drawPoint( getPos(e) );
	});

	canvas.addEventListener('touchstart', function(e){
		drawPoint( getPos(e) );
	});

	canvas.addEventListener('touchmove', function(e){ 
		drawLine( getPos(e) );
	});

	canvas.addEventListener('mousemove', function(e){
		if( clicked )
			drawLine( getPos(e) );
	});

	canvas.addEventListener('touchend', function(e){
		path = [];
	});

}



const predict = function(){

	let img = new Image();
	img.src = canvas.toDataURL();
	img.onload = function(){
		let tmpCanvas = document.createElement('canvas');
		tmpCanvas.width = 28;
		tmpCanvas.height = 28;
		let cT = tmpCanvas.getContext('2d');
		cT.drawImage(img,0,0,28,28);
		let resizedImg = cT.getImageData(0,0,28,28);
		let finalData = Array(28*28);
		for(let i = 0; i < finalData.length; i++){
			finalData[i] = 255-resizedImg.data[ i * 4 ];
		}
		let res = nn.predict( finalData ).data;
		let _min = -Infinity;
		let index = -1;
		for(let i = 0; i < res.length; i++){
			if( res[i] > _min ){
				_min = res[i];
				index = i;
			}
		}
		result.innerHTML = index;
	}
}

const getPos = function(e){
	e.preventDefault();
	
	let x, y;
	let rect = canvas.getBoundingClientRect();
	
	if( e.touches ){
		x = e.targetTouches[0].pageX - rect.left;
		y = e.targetTouches[0].pageY - rect.top;
	}else{
		x = e.offsetX * canvas.width/rect.width;
		y = e.offsetY * canvas.height/rect.height;
	}
	return {x, y};
}

const drawLine = function(p){
	
	path.push( {x: p.x, y: p.y} );

	if (path.length > 1) {
	  c.beginPath();
	  c.lineWidth = size/28 * 3;
	  c.lineCap = "round";
	  c.moveTo(path[path.length - 2].x, path[path.length - 2].y);
	  c.lineTo(path[path.length - 1].x, path[path.length - 1].y);
	  c.stroke();
	  path.shift();
	} 
  
}

const drawPoint = function(p){
	if( !path.length ){
		path.push( {x: p.x, y: p.y} );
		c.beginPath();
		c.arc(p.x, p.y, (size/28 * 3)/2, 0, Math.PI*2);
		c.fill();
	}
}

const erase = function(){
	c.fillStyle = "white";
	c.fillRect(0,0,size,size);
	c.fillStyle = "black";
	result.innerHTML = "<br>";
}
