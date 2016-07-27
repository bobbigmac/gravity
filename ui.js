var steps = 0;
var startTime;
var endTime;
var fps;
var particles = new Array();
var mass = 16; 
var gravityConstant = 1;
var xOffset = 0;
var yOffset = 0;
var zOffset = 0;
var initOffset = 0;
var initYOffset = 0;
var zoomScale = 1;
var mouseInitX = 0;
var mouseInitY = 0;
var currentMouseX = 0;
var currentMouseY = 0;
var dragging = false;
var panning = false;
var shiftPressed = false;
var tracking = false;
var running = true;
var trails = false;
var ctx;

var ident = 0;

function newParticle(m, v, x, y, z) {
	var p = new Particle(ident, m, v, x, y, z);
	ident++;
	particles[particles.length] = p;
}

function cloud(centerX, centerY, centerZ) {
	for (var i = 0; i < 1000; i++) {
		var angle = Math.random() * 2 * Math.PI;
		var dist = Math.pow(Math.random() * 15, 2);
		
		var x = centerX + dist * Math.cos(angle);
		var y = centerY + dist * Math.sin(angle);
		var z = centerZ + dist * Math.tan(angle);

		var vx = dist * Math.sin(angle) / 50;
		var vy = -dist * Math.cos(angle) / 50;
		var vz = dist * Math.tan(angle) / 50;

		newParticle(2, new Vector(vx, vy, vz), x, y, z);
	}
	paintParticles(particles);
}

function randDist() {
	xMax = $(window).width();
	yMax = $(window).height();
	zMax = $(window).height();

	for (var i = 0; i < 1000; i++) {
		var x = (Math.random() * xMax - xOffset) / zoomScale;
		var y = (Math.random() * yMax - yOffset) / zoomScale;
		var z = (Math.random() * zMax - zOffset) / zoomScale;

		var vx = Math.random() * 10 - 5;
		var vy = Math.random() * 10 - 5;
		var vz = Math.random() * 10 - 5;

		newParticle(2, new Vector(vx, vy, vz), x, y, z);
	}
	paintParticles(particles);
}

function center(p) {
	var x = 0;
	var y = 0;
	var z = 0;

	var maxMass = 0;
	for (var i = 0; i < p.length; i ++) {
		if (p[i].mass > maxMass) {
			x = p[i].x * zoomScale;
			y = p[i].y * zoomScale;
			z = p[i].z * zoomScale;

			maxMass = p[i].mass;
		}
	}
	xOffset = $(window).width() / 2 - x;
	yOffset = $(window).height() / 2 - y;
	// zOffset = $(window).height() / 2 - z;
}

function clean(p) {
	for (var i = 0; i < p.length; i ++) {
		var x = p[i].x * zoomScale + xOffset;
		var y = p[i].y * zoomScale + yOffset;
		var z = p[i].z * zoomScale + zOffset;

		if (x < 0 || x > $(window).width() || y < 0 || y > $(window).height()) {
			p.splice(i, 1);
		}
	}
}

$(document).ready(function (e) {
	xOffset = $(window).width() / 2;
	yOffset = $(window).height() / 2;
	zOffset = $(window).height() / 2;

	mouseInitX = e.clientX;
	mouseInitY = e.clientY;

	ctx = $("#canvas")[0].getContext("2d");
	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	
	$("#canvas").mousedown(function (e) {
		mouseInitX = e.clientX;
		mouseInitY = e.clientY;
		dragging = true;
		if (e.which == 2 || shiftPressed) {
			e.preventDefault();
			panning = true;
			initXOffset = xOffset;
			initYOffset = yOffset;
			initZOffset = zOffset;
		}
	});
	
	$("#canvas").mouseup(function (e) {
		if (!panning) {
			var vx = (e.clientX - mouseInitX) / 10;
			var vy = (e.clientY - mouseInitY) / 10;
			var vz = (e.clientY - mouseInitY) / 10;

			newParticle(mass, new Vector(vx, vy, vz),
				(mouseInitX - xOffset) / zoomScale, 
				(mouseInitY - yOffset) / zoomScale,
				((mouseInitY * Math.random()) - zOffset) / zoomScale//TODO: Hmm
			);
			paintParticles(particles);
		}
		panning = false;
		dragging = false;
	});
	
	$("#canvas").mousemove(function (e) {
		currentMouseX = e.clientX;
		currentMouseY = e.clientY;
		if (panning) {
			xOffset = initXOffset + (currentMouseX - mouseInitX);
			yOffset = initYOffset + (currentMouseY - mouseInitY);
			zOffset = initZOffset + (currentMouseY - mouseInitY);//TODO: Hmm
		}
	});
	
	$(window).bind('mousewheel', function (e) {
		if (e.originalEvent.wheelDelta / 120 > 0) {
			if (shiftPressed) {
				zoomScale *= 1.2;
			} else {
				mass *= 2;
			}
		} else {
			if (shiftPressed) {
				zoomScale /= 1.2;
			} else {
				mass /= 2;
			}
		}
		if (mass > 32768) { mass = 32768; }
		if (mass < 2) { mass = 2; }
		$("#mass-marker").html("Mass: " + mass);
	});
	
	$("body").keydown(function(e) {
		if (e.which == 16) {
			shiftPressed = true;
		}
	});

	$("body").keyup(function (e) {
		if (e.which == 72) {
			$("#instructions").toggle();
		} else if (e.which == 16) {
			shiftPressed = false;
		} else if (e.which == 32) {
			cloud(currentMouseX - xOffset, currentMouseY - yOffset, currentMouseY - zOffset);
		} else if (e.which == 67) {
			tracking = !tracking;
		} else if (e.which == 68) {
			clean(particles);
		} else if (e.which == 80) {
			running = !running;
		} else if (e.which == 84) {
			trails = !trails;
		} else if (e.which == 75) {
			randDist();
		} else if (e.which == 81) {
			gravityConstant *= 1.2;
		} else if (e.which == 65) {
			gravityConstant /= 1.2;
		} else if (e.which == 38) {
			mass *= 2;
			if (mass > 32768) { mass = 32768; }
		} else if (e.which == 40) {
			mass /= 2;
			if (mass < 2) { mass = 2; }
		}
		$("#mass-marker").html("Mass: " + mass);
	});
	
	var startTime = new Date;
	var tickFunction = function() {
		endTime = new Date;
		fps = 1000 / (endTime - startTime);
		startTime = endTime;
		$("#particle-num").html("Bodies: " + particles.length);
		//$("#step-counter").html("Steps: " + steps);
		$("#fps").html("FPS: " + fps.toFixed(2));
		$("#gravity-const").html("Gravity Constant: " + gravityConstant.toFixed(2));
		$("#tracking").html("Tracking: " + (tracking ? "ON" : "OFF"));
		if(!trails) {
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		}
		paintParticles(particles);
		if (dragging && !panning) {
			ctx.beginPath();
			ctx.moveTo(mouseInitX, mouseInitY);
			ctx.lineTo(currentMouseX, currentMouseY);
			ctx.strokeStyle = "white";
			ctx.stroke();
		}
		if (running) {
			gravityCalc(particles);
			steps ++;
		}
		if (tracking) {
			center(particles);
		}
		requestAnimationFrame(tickFunction);
	};
	requestAnimationFrame(tickFunction);
});
