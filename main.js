document.body.style = `
    font-family: monospace, Arial;
    font-size: 14px;
`;

let lastUpdate;

let getData = function(ref) {
    return fetch('http://localhost:3000/' + ref)
        .then(response => response.json())
};
let appElem = (tagName, container) =>
    (container ? container : document.body)
    .appendChild(document.createElement(tagName));

let chat;
let posts;
let users;

let currentUser;

let chatInput = appElem('input');
chatInput.style = `
    position: fixed;
    left: 20px;
    width: 80%;
    height: 4%;
    bottom: 10px;
    border: inset 1px;
    background-color: #af9;
    overflow: auto;
`;

let chatRegisterButton = appElem('input');
chatRegisterButton.type = 'button';
chatRegisterButton.value = 'Registration';
chatRegisterButton.style = `
    position: fixed;
    right: 20px;
    width: 10%;
    height: 4%;
    bottom: 10px;
    overflow: hidden;
`;

let form = appElem('form');
form.style.display = 'none';
form.method = 'post';

let nameInput = appElem('input', form);
nameInput.type = 'text';
nameInput.name = "name";
nameInput.placeholder = 'Name';

let lastNameInput = appElem('input', form);
lastNameInput.type = 'text';
lastNameInput.placeholder = 'Lastname';
lastNameInput.name = "lastName";

let emailInput = appElem('input', form);
emailInput.type = 'email';
emailInput.placeholder = 'email';
emailInput.name = "email";

let photoURLInput = appElem('input', form);
photoURLInput.type = 'url';
photoURLInput.placeholder = 'photo url';
photoURLInput.name = "photoURL";

let submit = appElem('input', form);
submit.type = 'submit';
submit.value = 'Submit';

/**
 * NEW CODE HW 11-2
 */
form.addEventListener('submit', function(event) {
    event.preventDefault();
    let data = new FormData(form);
    fetch('http://localhost:3000/users', {
        method: 'POST',
        body: JSON.stringify({
            name: data.get('name'),
            lastName: data.get('lastName'),
            email: data.get('email'),
            photoURL: data.get('photoURL')
            }),
        headers: {
            "Content-type": "application/json"
        }
    });
    form.reset();
    form.style.display = 'none';
}, false);

chatRegisterButton.onclick = function(e) {
    if (form.style.display === 'block') {} else {
        form.style.display = 'block';
    }
}

let buildChat = function() {
    chat = appElem('section')
    chat.style = `
        position: fixed;
        top: 30px;
        left: 20px;
        right: 20px;
        bottom: 70px;
        border: inset 1px;
        overflow: auto;
        padding: 10px;
    `
};
let updateChat = async function() {

    let updated = await getData("lastUpdate")

    if (lastUpdate &&
        updated.data === lastUpdate.data &&
        updated.time === lastUpdate.time)
        return

    await Promise.all([
        getData("users").then(x => users = x),
        getData("posts").then(x => posts = x)
    ])
    if (!currentUser) {
        currentUser = users [
            Math.floor ( Math.random () * users.length )
        ]
        currentUserId = currentUser.id
    }

    initChat()

    lastUpdate = {
        data: updated.data,
        time: updated.time
    }

    chat.scrollTop = chat.scrollHeight
};

let initChat = async function() {
    chat.innerHTML = ""
    posts.forEach(post => {
        let user = users.filter(x => x.id === post.userid)[0]
        chat.appendChild(
            (function() {
                let cont = appElem('div')
                let ava = appElem('img', cont)
                ava.src = user.photoURL
                ava.width = "40"
                ava.title = ` ${user.name} ${user.lastName}`
                appElem('span', cont).innerHTML = ` <small> ${post.date} ${post.time}</small>`
                appElem('p', cont).innerText = post.body
                return cont
            })(user)
        )
    })
}

buildChat()
updateChat()
setTimeout(function() {
    chat.scrollTop = chat.scrollHeight
}, 200)

let interval = setInterval(function() {
    updateChat()
}, 500)

chatInput.onkeydown = function(event) {
    if (event.keyCode == 13) {
        let postTime = new Date().toLocaleString().split(', ')
        fetch('http://localhost:3000/lastUpdate', {
            method: 'POST',
            body: JSON.stringify({
                data: postTime[0],
                time: postTime[1]
            }),
            headers: {
                "Content-type": "application/json"
            }
        })
        fetch('http://localhost:3000/posts', {
            method: 'POST',
            body: JSON.stringify({
                date: postTime[0],
                time: postTime[1],
                userid: currentUser.id,
                body: event.target.value
            }),
            headers: {
                "Content-type": "application/json"
            }
        })
    };
}