import './node_modules/@first-lego-league/user-interface/current/assets/css/app.css'
import './stylesheet.css'

const ShowPassword = (function (my) {

  my.toggle = function(selector) {
    const elem = document.querySelector(selector)
    elem.type = (elem.type === 'password') ? 'text' : 'password'
  }

  return my

}) ({})

const Display = (function (my) {

  my.toggle = function (selector) {
    document.querySelectorAll(selector).forEach(elem => {
      elem.style.display = (elem.style.display === 'none') ? 'block' : 'none'
    })
  }

  return my

}) ({})
