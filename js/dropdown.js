const highlightMatch = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, `<mark>$1</mark>`);
};

const noMatchListItem = () => {
  const item = document.createElement("li");
  item.textContent = "Dünger nicht gefunden.";
  item.classList.add("no-items");
  return item;
};

const renderDropdownItems = (searchInput, data, query = "") => {
  const resultList = searchInput.closest("div").querySelector("ul");
  resultList.innerHTML = "";
  resultList.classList.remove("hidden");

  const items = query === "" ? data : data.filter((item) => item.name.toLowerCase().includes(query));
  if (items.length === 0) {
    resultList.appendChild(noMatchListItem());
    return;
  }

  items.forEach((item) => {
    let li = document.createElement("li");
    li.innerHTML = highlightMatch(item.name, query);
    li.addEventListener("click", () => {
      searchInput.value = item.name;
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      resultList.classList.add("hidden");
    });
    resultList.appendChild(li);
  });
};

// Hide dropdown when clicking outside
document.addEventListener("click", (event) => {
  if (!event.target.closest(".dropdown")) {
    document.querySelectorAll(".dropdown-list").forEach((list) => {
      list.classList.add("hidden");
    });
  }
});
