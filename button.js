document.addEventListener('DOMContentLoaded', () => {
    function attachRotateEffect(element, maxAngle = 22) {
      element.addEventListener('mousemove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top; 
  
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = x - centerX;
        const offsetY = y - centerY;
  
        const rotateY = (offsetX / centerX) * maxAngle; 
        const rotateX = -(offsetY / centerY) * maxAngle; 
  
        element.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
  
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg)';
      });
    }
  
    const btn1 = document.getElementById('button');
    const btn2 = document.getElementById('button2');
    const btn3 = document.getElementById('button3');
  
    if (btn1) attachRotateEffect(btn1);
    if (btn2) attachRotateEffect(btn2);
    if (btn3) attachRotateEffect(btn3);
  });
  