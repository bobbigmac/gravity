function Vector(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

function Color() {
	this.red = Math.floor(Math.random() * 255);
	this.green = Math.floor(Math.random() * 255);
	this.blue = Math.floor(Math.random() * 255);
	
	this.toString = rgbtostr;
}

function rgbtostr() {
	return "rgb(" + this.red + ", " + this.green + ", " + this.blue + ")";
}
