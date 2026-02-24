const rows = [...document.querySelectorAll("tbody tr")];
const toggle = document.getElementById("toggleArchive");
const search = document.getElementById("search");
const counter = document.getElementById("counter");
const visibleCount = document.getElementById("visibleCount");

let showArchived = false;

function applyFilters(){
  const q = search.value.toLowerCase();
  let visible = 0;

  rows.forEach(r=>{
    const archived = r.dataset.archived === "true";
    const text = r.innerText.toLowerCase();

    const ok = (showArchived || !archived) && text.includes(q);
    r.style.display = ok ? "" : "none";
    if(ok) visible++;
  });

  visibleCount.textContent = "VISIBLE: " + visible;
  counter.textContent = "TOTAL: " + rows.length;
}

toggle.onclick = ()=>{
  showArchived = !showArchived;
  toggle.textContent = showArchived ? "HIDE ARCHIVED" : "SHOW ARCHIVED";
  applyFilters();
};

search.oninput = applyFilters;

/* simple sort helpers */
function sortBy(col){
  const tbody = document.querySelector("tbody");
  const sorted = rows.sort((a,b)=
    a.children[col].innerText.localeCompare(b.children[col].innerText)
  );
  sorted.forEach(r=>tbody.appendChild(r));
}

document.getElementById("sortName").onclick = ()=>sortBy(2);
document.getElementById("sortType").onclick = ()=>sortBy(1);

applyFilters();
