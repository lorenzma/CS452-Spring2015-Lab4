var canvas;
var gl;

var program;

var pointsArray = [];
var normalsArray = [];
var texCoordsArray = [];

var texture;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 
    gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}


var framebuffer;


var color = new Uint8Array(4);

var s=1.25; //scale
var vertices = [
	
	//front heart
	vec4(0,.5*s,.5*s,1), //top middle 0
	vec4(0,-1*s,.5*s,1), //bottom middle 
	vec4(1*s,0,.5*s,1), 
	vec4(1*s,.5*s,.5*s,1),
	vec4(.5*s,1*s,.5*s,1),
	vec4(-.5*s,1*s,.5*s,1),
	vec4(-1*s,.5*s,.5*s,1),
	vec4(-1*s,0*s,.5*s,1), //7
	//back heart
	vec4(0,.5*s,-.5*s,1), //top middle 8
	vec4(0,-1*s,-.5*s,1), //bottom middle
	vec4(1*s,0,-.5*s,1),
	vec4(1*s,.5*s,-.5*s,1),
	vec4(.5*s,1*s,-.5*s,1),
	vec4(-.5*s,1*s,-.5*s,1),
	vec4(-1*s,.5*s,-.5*s,1),
	vec4(-1*s,0*s,-.5*s,1), //15
    ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 2.0, 1.0 );
var lightSpecular = vec4( 1.0, .0,0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 1.0, 1.0);
var materialSpecular = vec4( 1.0, 0.0, 0.0, 1.0 );
var materialShininess = 70.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = [-24,-46,0];

var thetaLoc;

var Index = 0;


function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);
     normal = normalize(normal);

     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
	 texCoordsArray.push(texCoord[0]);
	 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal); 
	 texCoordsArray.push(texCoord[1]);
	 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);   
	 texCoordsArray.push(texCoord[2]);
	 
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal); 
	 texCoordsArray.push(texCoord[0]);
	 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal); 
	 texCoordsArray.push(texCoord[2]);
	 
     pointsArray.push(vertices[d]); 
     normalsArray.push(normal);    
	 texCoordsArray.push(texCoord[3]);
}


function buildHeart()
{
	
	quad(0,4,12,8);
	quad(8,13,5,0);
	//side 
	quad(9,1,7,15);
	quad(15,7,6,14);
	quad(14,6,5,13);
	
	//side 
	quad(1,9,10,2);
	quad(2,10,11,3);
	quad(3,11,12,4);
	
	//front heart
    quad(0,5,6,7);
    quad(0,7,1,2);
    quad(0,2,3,4);
	//back heart
    quad( 8,15,14,13);
    quad(8,10,9,15);
    quad( 8,12,11,10 );	
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
  
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0,0,0, 1.0 );
    
    gl.enable(gl.CULL_FACE);


// Allocate a frame buffer object
   framebuffer = gl.createFramebuffer();
   gl.bindFramebuffer( gl.FRAMEBUFFER, framebuffer);


// Attach color buffer
   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    buildHeart();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
	 var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // Initialize a texture
    //var image = document.getElementById("texImage");

	var image = new Image();
	image.crossOrigin="anonymous";
    image.onload = function() { 
       configureTexture( image );
    }
    image.src="FACK.gif";



    thetaLoc = gl.getUniformLocation(program, "theta");
    
    viewerPos = vec3(0.0, 0.0, 0.0 );

    projection = ortho(-5,5,-5,5, -100, 100);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular); 
      
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program,"shininess"),materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),false, flatten(projection));

    canvas.addEventListener("mousedown", function(event){
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.clear( gl.COLOR_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST);  
     
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.uniform1i(gl.getUniformLocation(program, "i"), 0);
        gl.clear( gl.COLOR_BUFFER_BIT );
        gl.uniform3fv(thetaLoc, theta);
        gl.drawArrays(gl.TRIANGLES, 0, 36);

    }); 
          
		//BUTTONS
	    document.getElementById( "left" ).onclick = function () {
        //counterclockwise y
	
		theta[axis] -= 2.0;
		axis = yAxis;
    };
    document.getElementById( "right" ).onclick = function () {
        //clockwise y
		theta[axis] += 2.0;
		axis = yAxis;
    };
    document.getElementById( "up" ).onclick = function () {
		//counterclockwise x
		theta[axis] += 2.0;
		 axis = xAxis;
	};
	document.getElementById( "down" ).onclick = function () {
		//clockwise x
		theta[axis] -= 2.0;
		axis = xAxis;
    };
	//EVENT LISTENERS   ASDW
		  
	window.addEventListener("keydown", function(event) 
	{
		switch (event.keyCode) {
		case 65: axis = yAxis; theta[axis] += 2.0; break;
		case 37: axis = yAxis; theta[axis] += 2.0; break;
		case 68: axis = yAxis; theta[axis] -= 2.0; break;
		case 39: axis = yAxis; theta[axis] -= 2.0; break;
		case 87: axis = xAxis; theta[axis] += 2.0; break;
		case 38: axis = xAxis; theta[axis] += 2.0; break;
		case 83: axis = xAxis; theta[axis] -= 2.0; break;
		case 40: axis = xAxis; theta[axis] -= 2.0; break;
		
		case "w": axis = yAxis; theta[axis] += 2.0; break;
		case "ArrowUp": axis = yAxis; theta[axis] += 2.0; break;
		case "s": axis = yAxis; theta[axis] -= 2.0; break;
		case "ArrowDown": axis = yAxis; theta[axis] -= 2.0; break;
		case "a": axis = xAxis; theta[axis] += 2.0; break;
		case "ArrowLeft": axis = xAxis; theta[axis] += 2.0; break;
		case "d": axis = xAxis; theta[axis] -= 2.0; break;
		case "ArrowRight": axis = xAxis; theta[axis] -= 2.0; break;
		default: return;  } // Quit when this doesn't handle the key event. 
	}, true);
			
	
	
	//KeyboardEvent.code 
		  
    render();
}

var render = function(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //if(flag) theta[axis] += 2.0;
    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
    
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,"modelViewMatrix"), false, flatten(modelView) );

    gl.uniform1i(gl.getUniformLocation(program, "i"),0);
    gl.drawArrays( gl.TRIANGLES, 0, pointsArray.length);
    

    requestAnimFrame(render);
}
