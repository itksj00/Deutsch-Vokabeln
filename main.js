let currentPage = 0;
const pages = document.querySelectorAll('.page');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function showPage(index) {
  pages.forEach((p, i) => {
    p.style.zIndex = i === index ? 2 : 1;
    p.style.transform = i < index ? 'rotateY(-180deg)' : 'rotateY(0deg)';
  });
}

function nextPage() {
  if (currentPage < pages.length - 1) {
    currentPage++;
    showPage(currentPage);
  }
}
function prevPage() {
  if (currentPage > 0) {
    currentPage--;
   