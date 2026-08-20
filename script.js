const loader=document.querySelector('.loader');
if(sessionStorage.getItem('portfolioLoaded')){loader.remove()}else{setTimeout(()=>{loader.classList.add('done');sessionStorage.setItem('portfolioLoaded','1')},950)}
document.getElementById('year').textContent=new Date().getFullYear();
