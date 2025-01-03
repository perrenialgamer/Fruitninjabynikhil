
    const trailContainer = document.getElementById('trail');
    
    if (!trailContainer) {
        console.error("Trail container not found!");
        return; 
    }

    let isMousePressed = false;
    let lastX = 0, lastY = 0;
    let trailTimeout;

    
    function createTrail(event) {
        if (isMousePressed) {
            
            const x = event.clientX;
            const y = event.clientY;

            
            const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
            
            
            if (distance > 5) {
                const trail = document.createElement('div');
                trail.classList.add('trail'); 

                
                trail.style.left = `${x}px`;
                trail.style.top = `${y}px`;

                
                trailContainer.appendChild(trail);

                
                setTimeout(() => {
                    trail.remove();
                }, 400);

                
                lastX = x;
                lastY = y;
            }
        }
    }

    
    document.addEventListener('mousedown', () => {
        isMousePressed = true;
    });

    document.addEventListener('mouseup', () => {
        isMousePressed = false;
    });

    
    document.addEventListener('mousemove', createTrail);

