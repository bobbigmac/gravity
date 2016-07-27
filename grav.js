function Particle(ident, m, v, x, y, z) {
	this.ident = ident;
	this.mass = m;
	this.velocity = v;
	
	this.x = x;
	this.y = y;
	this.z = z;

	this.color = new Color();
	this.absorb = absorbParticle;
	this.paint = paintParticle;
	this.radius = Math.cbrt(this.mass);
}

function getRadius() {
	return Math.sqrt(this.mass) / 2;
}

function absorbParticle(p) {
	if (this.mass < p.mass) {
		this.color = p.color;
	}

	this.velocity.x = (this.velocity.x * this.mass + p.velocity.x * p.mass) / (this.mass + p.mass);
	this.velocity.y = (this.velocity.y * this.mass + p.velocity.y * p.mass) / (this.mass + p.mass);
	this.velocity.z = (this.velocity.z * this.mass + p.velocity.z * p.mass) / (this.mass + p.mass);

	this.x = (this.x * this.mass + p.x * p.mass) / (this.mass + p.mass);
	this.y = (this.y * this.mass + p.y * p.mass) / (this.mass + p.mass);
	this.z = (this.z * this.mass + p.z * p.mass) / (this.mass + p.mass);

	this.mass += p.mass;
	this.radius = Math.cbrt(this.mass);
}

function hsl_col_perc(percent,start,end) {
	var a = percent/100,
	b = (end-start)*a;
	c = b+start;

	//Return a CSS HSL string
	return 'hsl('+c+',100%,50%)';
}

var zRange = false;

function paintParticle() {
	var ctx = $("#canvas")[0].getContext("2d");
	ctx.beginPath();
	
	// Scale (and color) on z value
	var color = false;
	var zShare = 0.5;
	if(zRange.near !== zRange.far) {
		zShare = ((this.z - zRange.far) / (zRange.near - zRange.far));
	}
	color = hsl_col_perc(Math.round(zShare * 100), 0, 360);

	ctx.arc((this.x * zoomScale) + xOffset, 
					(this.y * zoomScale) + yOffset, 
					this.radius * ((zoomScale / 4) + (((zoomScale / 4) * 3) * zShare)),
					0, 2 * Math.PI, false);

	ctx.fillStyle = color;
	ctx.fill();

	// ctx.strokeStyle = 'white';
	// ctx.strokeWidth = '1px';
	// ctx.stroke();
}

function paintParticles(p) {
	p.sort(function(a, b) {
		return a.z > b.z ? 1 : -1;
	});

	zRange = {
		far: (p[0] && p[0].z) || false,
		near: (p[p.length-1] && p[p.length-1].z) || false 
	};

	// var sum = p.reduce(function(sum, part) {
	// 	return sum + part.z;
	// }, 0);
	// var avg = sum / p.length;
	// var diffs = p.map(function(part) {
	// 	var diff = (part.z - avg);
	// 	return diff * diff;
	// });
	// var diffSum = diffs.reduce(function(sum, diff) {
	// 	return sum + diff;
	// }, 0);
	// var avgDiff = diffSum / diffs.length;
	// var stdDev = Math.sqrt(avgDiff);

	for (var i = 0; i < p.length; i++) {
		p[i].paint();
	}
}

function gravityCalc(p) {
	for (var i = 0; i < p.length; i++) {
		forceSum = new Vector(0, 0, 0);
		for (var j = 0; j < p.length; j++) {
			if (j != i) {
				var xDist = p[i].x - p[j].x;
				var yDist = p[i].y - p[j].y;
				var zDist = p[i].z - p[j].z;

				var radii = (p[i].radius + p[j].radius);
				var distance = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2) + Math.pow(zDist, 2));
				var absorbing = (distance < radii);

				if (absorbing) {
					p[i].absorb(p[j]);
					p.splice(j, 1);
				} else {
					var forceMag = gravityConstant * (p[i].mass * p[j].mass) / Math.pow(distance, 2);
					var nextStep = (forceMag / p[i].mass) + (forceMag / p[j].mass);
					absorbing = distance < nextStep;

					if (absorbing) {
					  p[i].absorb(p[j]);
					  p.splice(j, 1);
					} else {
  					forceSum.x -= Math.abs(forceMag * (xDist / distance)) * Math.sign(xDist);
  					forceSum.y -= Math.abs(forceMag * (yDist / distance)) * Math.sign(yDist);
  					forceSum.z -= Math.abs(forceMag * (zDist / distance)) * Math.sign(zDist);
					}
				}
			}
		}

		p[i].velocity.x += forceSum.x / p[i].mass;
		p[i].velocity.y += forceSum.y / p[i].mass;
		p[i].velocity.z += forceSum.z / p[i].mass;
	}
	for (var i = 0; i < p.length; i++) {
		// 60 / fps to take bigger steps when the simulation is running slower (60 is normal fps)
		p[i].x += p[i].velocity.x / 10 * (60 / fps);
		p[i].y += p[i].velocity.y / 10 * (60 / fps);
		p[i].z += p[i].velocity.z / 10 * (60 / fps);
	}
}
