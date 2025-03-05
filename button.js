document.addEventListener('DOMContentLoaded', () => {
    function attachRotateEffect(element, maxAngle = 22) {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left; // X position inside the element
        const y = e.clientY - rect.top;  // Y position inside the element
  
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = x - centerX;
        const offsetY = y - centerY;
  
        const rotateY = (offsetX / centerX) * maxAngle; // rotate around Y axis (tilts left/right)
        const rotateX = -(offsetY / centerY) * maxAngle; // rotate around X axis (tilts up/down)
  
        element.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
  
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg)';
      });
    }
  
    const btn1 = document.getElementById('button');
    const btn2 = document.getElementById('button2');
  
    // Attach the rotation effect if the elements exist
    if (btn1) attachRotateEffect(btn1);
    if (btn2) attachRotateEffect(btn2);
  });
  