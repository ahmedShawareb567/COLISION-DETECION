$.noConflict();
jQuery(function($){
});

let ch,
    cw,
    canvas,
    ctx,
    bubbles,
    mouse;

    mouse = {
        x: undefined,
        y: undefined
    };

    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');

    cw = canvas.width  = window.innerWidth;
    ch = canvas.height = window.innerHeight;

    canvas.addEventListener('resize', () => {
        cw = canvas.width  = window.innerWidth;
        ch = canvas.height = window.innerHeight;
    });


    bubbles = [];
    const BubblesNumber = 100;

    //COLLISION DETECTION FUNCTIONS
    function rotate(velocity, angle) {
        const rotatedVelocities = {
            x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
            y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
        };
    
        return rotatedVelocities;
    }

    function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.vx - otherParticle.vx;
    const yVelocityDiff = particle.vy - otherParticle.vy;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate({
            x: particle.vx,
            y: particle.vy
        }, angle);
        const u2 = rotate({
            x: otherParticle.vx,
            y: otherParticle.vy
        }, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.vx = vFinal1.x;
        particle.vy = vFinal1.y;

        otherParticle.vx = vFinal2.x;
        otherParticle.vy = vFinal2.y;
    }
}

    bubble = function(x, y, r, vx, vy, color){

        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.currentRadius = r;
        this.color = color;
        this.alpha = 1;
        this.mass = 1;

        //DRAW FUNCTION
        this.draw = function(){
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
            ctx.fillStyle   = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.fill();
            ctx.closePath();
            
        };

        //UPDATE FUNCTION
        this.update = function(){

            //INVOKE DRAW FUNCTION
            this.draw();

            //COLLISION DETECTION
            for(let h = 0; h < bubbles.length; h++){
                if (this === bubbles[h]) continue;
                if(getDistance(this.x, this.y, bubbles[h].x, bubbles[h].y) < this.r + bubbles[h].r){
                    resolveCollision(this, bubbles[h]);
                }
            }
            //MOUSE EFFECT
            if( mouse.x - this.x < 100 && mouse.x - this.x > -100
                 &&
                mouse.y - this.y < 100 && mouse.y - this.y > -100
                ) {
                    if (this.r > 6){
                        this.r -= 0.5;
                        if (getDistance(mouse.x, mouse.y, this.x, this.y) < 100 && getDistance(mouse.x, mouse.y, this.x, this.y) > -100){
                            this.vx = -1
                            this.vy = -1;
                        }
                    }
                } else {
                    if(this.r < this.currentRadius){
                        this.r += 0.5;
                    }
                }
            //VIOLICITY CONDITIONS
            if(this.x + this.vx > cw - this.r || this.x + this.vx < this.r){
                this.vx = -this.vx;
            }
            if(this.y + this.vy > ch - this.r || this.y + this.vy < this.r){
                this.vy = -this.vy;
            }

            this.x += this.vx;
            this.y += this.vy;

        };
    };

    //GENERATE BUBBLES
    (function generateBubbles(){
        for(let i = 0; i < BubblesNumber; i++){

            let x      = Math.random() * cw,
                y      = Math.random() * ch,
                r      = Math.random() * 30,
                vx     = Math.random() * 5,
                vy     = Math.random() * -5,
                colors = [
                    '#ff9f1c',
                    '#41ead4',
                    '#f71735',
                    '#011627'
                ],
                color = colors[Math.floor(Math.random() * colors.length)];

            bubbles.push(new bubble(x, y, r, vx, vy, color));
        }
    }());

    //ANIMATE FUNCTION
    (function animateBubbles(){

        ctx.clearRect(0, 0, cw, ch);
        for (let v = 0; v < bubbles.length; v++){
            bubbles[v].update();
        }
        requestAnimationFrame(animateBubbles);
    }());

    //TAKE DIMENSIONS FROM CANVAS WITH MOUSEMOVE
    canvas.addEventListener('mousemove', (e) => {

        mouse.x = e.x;
        mouse.y = e.y;

    });

    //GET DISTANCE
    function getDistance(x1, y1, x2, y2) {

        let xDistance = x2 - x1,
            yDistance = y2 - y1;

        return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
    }