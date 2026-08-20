const loader=document.querySelector('.loader'),num=document.querySelector('.load-num'),status=document.querySelector('.load-status');
const labels=['Calibrating sensors','Acquiring signal','Ready'];
if(sessionStorage.getItem('portfolioLoaded')){loader.remove()}else{let progress=0;const tick=()=>{progress=Math.min(100,progress+(progress<72?Math.ceil(Math.random()*12):progress<94?Math.ceil(Math.random()*4):1));num.textContent=String(progress).padStart(2,'0');status.textContent=labels[progress<42?0:progress<88?1:2];if(progress<100)setTimeout(tick,progress<75?85:130);else{sessionStorage.setItem('portfolioLoaded','1');setTimeout(()=>loader.classList.add('done'),200)}};tick()}
document.getElementById('year').textContent=new Date().getFullYear();
