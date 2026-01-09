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

const selectDropdownItem = (searchInput, resultList, itemName) => {
  searchInput.value = itemName;
  searchInput.dispatchEvent(new Event("input", { bubbles: true }));
  resultList.classList.add("hidden");
  // Remove highlight from all items
  resultList.querySelectorAll("li").forEach((li) => li.classList.remove("highlighted"));
};

const highlightDropdownItem = (items, index) => {
  items.forEach((item) => item.classList.remove("highlighted"));
  items[index].classList.add("highlighted");
  items[index].scrollIntoView({ block: "nearest" });
};

const attachDropdownEventHandlers = (dropdownInput, data) => {
  dropdownInput.addEventListener("focus", (event) => {
    event.currentTarget.select();
    renderDropdownItems(event.currentTarget, data, event.currentTarget.value.toLowerCase());
  });
  dropdownInput.addEventListener("input", (event) =>
    renderDropdownItems(event.currentTarget, data, event.currentTarget.value.toLowerCase())
  );
  dropdownInput.addEventListener("blur", (event) => {
    const dropdown = event.currentTarget.closest("div").querySelector("ul.dropdown-list");
    setTimeout(() => {
      if (dropdown) dropdown.classList.add("hidden");
    }, 150);
  });
  dropdownInput.addEventListener("keydown", (event) => {
    const dropdown = event.currentTarget.closest("div").querySelector("ul.dropdown-list");
    if (!dropdown || dropdown.classList.contains("hidden")) return;

    const items = dropdown.querySelectorAll("li:not(.no-items)");
    if (items.length === 0) return;

    const highlighted = dropdown.querySelector("li.highlighted");
    let currentIndex = highlighted ? Array.from(items).indexOf(highlighted) : -1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
        highlightDropdownItem(items, currentIndex);
        break;

      case "ArrowUp":
        event.preventDefault();
        currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        highlightDropdownItem(items, currentIndex);
        break;

      case "Enter":
        event.preventDefault();
        if (highlighted) {
          const itemName = highlighted.dataset.itemName;
          if (itemName) {
            event.currentTarget.value = itemName;
            event.currentTarget.dispatchEvent(new Event("input", { bubbles: true }));
            dropdown.classList.add("hidden");
          }
        }
        break;

      case "Escape":
        event.preventDefault();
        dropdown.classList.add("hidden");
        break;
    }
  });
};

const renderDropdownItems = (searchInput, data, query = "") => {
  const resultList = searchInput.closest("div").querySelector("ul.dropdown-list");
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
    li.dataset.itemName = item.name;

    li.addEventListener("click", () => {
      selectDropdownItem(searchInput, resultList, item.name);
    });

    // Sync .highlighted class with mouse hover for mixed keyboard/mouse navigation
    // This ensures Enter key selects the item under the mouse cursor
    li.addEventListener("mouseenter", () => {
      resultList.querySelectorAll("li").forEach((l) => l.classList.remove("highlighted"));
      li.classList.add("highlighted");
    });

    resultList.appendChild(li);
  });

  // Highlight first item by default
  if (items.length > 0) {
    resultList.querySelector("li").classList.add("highlighted");
  }
};
