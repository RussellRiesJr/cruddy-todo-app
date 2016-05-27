
$(() => {
  var itemStatus = "incomplete";
  const API_URL = 'https://crudness-todo.firebaseio.com'
  let token = null
  let user = null

  const addItemToTable = (item, id) => {
    const row = `<tr data-id="${id}">
      <td class='grab'>${item.task}</td>
      <td>
        <button class="btn btn-success complete">Complete</button>
        <button class="btn btn-danger delete">Delete</button>
      </td>
      <td>${item.status}</td>
    </tr>`

    $('tbody').append(row)
  }

  // READ: GET data from firebase and display in table
  const getData = function () {
    $.get(`${API_URL}/${user}/task.json?auth=${token}`)
    .done((data) => {
      console.log(data)
      if (data) {

        Object.keys(data).forEach((id) => {
          addItemToTable(data[id], id)
        })
      }
    })
  }
  // CREATE: form submit event to POST data to firebase
  $('.add form').submit((e) => {
    e.preventDefault();
    const statusObj = { task: $('#newItem').val(), status: 'incomplete'}
    $.post(`${API_URL}/${user}/task.json?auth=${token}`,
      JSON.stringify(statusObj)
    ).done((key) => {
      addItemToTable(statusObj, key.name)
      $('#newItem').val("")
    })
  })

  $('tbody').on('click', '.delete', (e) => {
    const row =  $(e.target).closest('tr')
    const id = row.data('id')

    $.ajax({
      url: `${API_URL}/${user}/task/${id}.json?auth=${token}`,
      method: 'DELETE'
    }).done(() => {
      row.remove()
    })
  })

  $('tbody').on('click', '.complete', (e) => {
    const row =  $(e.target).closest('tr')
    const id = row.data('id')
    const targ = row.find('.grab').html()
    console.log(targ)

    $.ajax({
      url: `${API_URL}/${user}/task/${id}.json?auth=${token}`,
      method: 'PUT',
      data: JSON.stringify({ task: targ, status: 'complete'})
    })
    .done(() => {
      getData()
    })
  })

  firebase.initializeApp({
    apiKey: "AIzaSyA8r-nSVAaiNUue7gEOVB-MwdBZJcvTeXk",
    authDomain: "crudness-todo.firebaseapp.com",
    databaseURL: "https://crudness-todo.firebaseio.com",
    storageBucket: "crudness-todo.appspot.com",
  })

    // Create user in case it does not exist and login
  // const email = "bobtony@firebase.com"
  // const password = "correcthorsebatterystaple"

  // firebase.auth().createUserWithEmailAndPassword(email, password)
  //   .catch(console.error)
  //   .then(() => firebase.auth()
  //     .signInWithEmailAndPassword(email, password))
  //   .then(user => user.getToken())
  //   .then(getData)

  const login = (email, password) => (
    firebase.auth()
      .signInWithEmailAndPassword(email, password)
      .then((u) => user = u)
  )

  const register = (user, password) => (
    firebase.auth().createUserWithEmailAndPassword(user, password)
  )

  $('.login form').submit((e) => {
    const form = $(e.target)
    const email = form.find('input[type="text"]').val()
    const password = form.find('input[type="password"]').val()

    login(email, password)

    e.preventDefault()
  })

  $('input[value="Register"]').click((e) => {
    const form = $(e.target).closest('form')
    const email = form.find('input[type="text"]').val()
    const password = form.find('input[type="password"]').val()

    register(email, password)
      .then(() => login(email, password))
      .then(console.log)
      .catch(console.err)

    e.preventDefault()
  })

  $('.logout').click(() => {
    firebase.auth().signOut()
  })

  firebase.auth().onAuthStateChanged((person) => {
    if (person) {
      // logged in
      $('.login').hide()
      $('.app').show()

      $('.logged_in_user').text(person.email)

      user = person.uid

      person.getToken()
        .then(t => token = t)
        .then(getData)

    } else {
      // logged out
      $('.app').hide()
      $('.login').show()
      $('tbody').empty()
    }
  })
})

// TODO:
// DELETE: click event on delete to send DELETE to firebase.
// UPDATE: click event on complete to send PUT/PATCH to firebase