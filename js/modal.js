// Modal - Pico.css - https://picocss.com - Copyright 2019-2024 - Licensed under MIT
const isOpenClass = "modal-is-open",
  openingClass = "modal-is-opening",
  closingClass = "modal-is-closing",
  scrollbarWidthCssVar = "--pico-scrollbar-width",
  animationDuration = 400;
let visibleModal = null;
const toggleModal = (e) => {
    e.preventDefault();
    const l = document.getElementById(e.currentTarget.dataset.target);
    l && l && (l.open ? closeModal(l) : openModal(l));
  },
  openModal = (e) => {
    const { documentElement: l } = document,
      s = getScrollbarWidth();
    s && l.style.setProperty(scrollbarWidthCssVar, `${s}px`),
      l.classList.add(isOpenClass, openingClass),
      setTimeout(() => {
        (visibleModal = e), l.classList.remove(openingClass);
      }, 400),
      e.showModal();
  },
  closeModal = (e) => {
    visibleModal = null;
    const { documentElement: l } = document;
    l.classList.add(closingClass),
      setTimeout(() => {
        l.classList.remove(closingClass, isOpenClass), l.style.removeProperty(scrollbarWidthCssVar), e.close();
      }, 400);
  };
document.addEventListener("click", (e) => {
  null !== visibleModal && !visibleModal.querySelector("article").contains(e.target) && closeModal(visibleModal);
}),
  document.addEventListener("keydown", (e) => {
    "Escape" === e.key && visibleModal && closeModal(visibleModal);
  });
const getScrollbarWidth = () => window.innerWidth - document.documentElement.clientWidth,
  isScrollbarVisible = () => document.body.scrollHeight > screen.height,
  saveModalForm = (e) => {
    e.preventDefault();
    const l = e.currentTarget;
    if (l.reportValidity()) return new FormData(l);
  };
