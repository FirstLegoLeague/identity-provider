import '@first-lego-league/user-interface/current/assets/css/app.css'
import './stylesheet.css'

const PASSWORD_FIELD_ID = 'password-field'
const PASSWORD_BUTTONS_CLASS = 'password-button'

function onReady () {
  const togglePasswordVisibility = () => {
    const elem = document.getElementById(PASSWORD_FIELD_ID)
    elem.type = (elem.type === 'password') ? 'text' : 'password'
  }

  const switchButtons = () => {
    for (const elem of document.getElementsByClassName(PASSWORD_BUTTONS_CLASS)) {
      elem.style.display = (elem.style.display === 'none') ? 'block' : 'none'
    }
  }

  for (const button of document.getElementsByClassName('password-button')) {
    button.addEventListener('click', () => {
      togglePasswordVisibility()
      switchButtons()
    })
  }
}

if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
  onReady()
} else {
  document.addEventListener('DOMContentLoaded', onReady)
}
