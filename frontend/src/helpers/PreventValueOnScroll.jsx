function preventValueChangeOnScroll(e) {

    e.target.blur()

    e.stopPropagation()

    setTimeout(() => {
      e.target.focus()
    }, 0)
  }

  export default preventValueChangeOnScroll
