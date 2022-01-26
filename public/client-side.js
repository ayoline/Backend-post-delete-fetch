const generalInput = document.querySelector('#general-input');
const inputSelected = document.querySelector('#selected-option');
const btnSearch = document.querySelector('#btn-search');
const inputAddName = document.querySelector('#add-name-input');
const inputAddEmail = document.querySelector('#add-email-input');
const btnAddUser = document.querySelector('#btn-add-user');
const btnAddConfirm = document.querySelector('#btn-add-confirm');
const btnDelUser = document.querySelector('#btn-del-user');
const btnCloseAddForms = document.querySelector('#btn-in-close-add-forms');
const addUserForms = document.querySelector('#add-user-forms');
let pid = 0;
let minNumberOfCharToStartTrigger;

btnAddUser.onclick = () => showForms();

btnAddConfirm.onclick = function () {
    if (inputAddName.value && inputAddEmail.value) {
        saveNewUser();
    } else {
        alert('Please fill in all fields!');
    }
}

btnDelUser.onclick = () => {
    if (inputSelected.value == 'id') {
        if (generalInput.value) {
            deleteUser(generalInput.value);
        } else {
            alert('Please enter a value to be deleted!')
        }
    } else {
        alert('It is only possible to delete by the ID parameter!');
    }
};

btnCloseAddForms.innerHTML = "X";
btnCloseAddForms.onclick = function () { closeForms() }

inputSelected.onchange = function () {
    generalInput.value = "";
    if (inputSelected.value != "id") {
        generalInput.type = 'text';
    } else {
        generalInput.type = 'number';
    }
}

generalInput.addEventListener('input', function () {
    const inputName = inputSelected.value;

    if (inputName == "id") {
        minNumberOfCharToStartTrigger = 1;
    } else {
        minNumberOfCharToStartTrigger = 3;
    }
    triggersTheSearch(generalInput, filterByInputName);
});

btnSearch.onclick = function () {
    const inputName = inputSelected.value;
    const inputValue = generalInput.value;

    if (inputValue) {
        filterByInputName(inputValue, inputName);
    } else {
        alert("Digite algum valor!");
    }
}

function triggersTheSearch(_inputValue, _filterByInput) {
    const reqPart = _inputValue.value;
    const whatIsTheInputName = inputSelected.value;

    if (reqPart.length < minNumberOfCharToStartTrigger) {
        loadFirstLineTable();
        clearTimeout(pid);
        return;
    }

    clearTimeout(pid);

    pid = setTimeout(() => {
        _filterByInput(reqPart, whatIsTheInputName);
    }, 2000);
}

function filterByInputName(_inputValue, _inputName) {
    fetch(`/search?${_inputName}=${_inputValue}`).then(resp => resp.text()).then(element => {
        element = JSON.parse(element);
        loadFilteredTable(element);
    });
}

function saveNewUser() {
    const element = {};

    element.name = inputAddName.value;
    element.email = inputAddEmail.value;

    saveUserOnServer(element);
}

function saveUserOnServer(_element) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_element)
    };

    fetch('/save', requestOptions).then(resp => resp.text()).then(el => {
        el = JSON.parse(el);
        console.log(el);
        if (!el.error) {
            const addedUser = [];

            closeForms();
            addedUser.push(el)
            loadFilteredTable(addedUser);
            alert(`The user ${addedUser[0].id} has been added!`)
        } else {
            console.log('damn!');
        }
    });
}

function deleteUser(_userToBeDeleted) {
    const id = _userToBeDeleted;

    const requestOptions = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: _userToBeDeleted })
    };

    fetch('/delete', requestOptions).then(resp => resp.text()).then(el => {
        el = JSON.parse(el);
        if (!el.error) {
            alert(`User ${el.id} has been deleted!`);
            loadFirstLineTable();
        } else {
            console.log('damn!');
        }
    });
}

function loadFilteredTable(_element) {
    loadFirstLineTable();

    if (!_element.error) {
        for (let i = 0; i < _element.length; i++) {
            const el = _element[i];
            document.querySelector("#table").innerHTML += `
            <tr>
            <td>${el.id}</td>
            <td>${el.name}</td>
            <td>${el.email}</td>
            </tr>
            `;
        }
    } else {
        errorMsg(_element.msg);
    }
}

function loadFirstLineTable() {
    document.querySelector("#table").innerHTML = `
    <tr>
        <th>ID</th>
        <th>NAME</th>
        <th>E-MAIL</th>
    </tr>
    `;
}

function errorMsg(_str) {
    document.querySelector("#table").innerHTML += `
    <tr>
        <td></td>
        <td></td>
        <td>${_str}</td>
    </tr>
    `;
}

function showForms() {
    addUserForms.style.display = "block";
    addUserForms.style.visibility = "visible";
    addUserForms.style.opacity = "1";
}

function closeForms() {
    addUserForms.style.visibility = "hidden";
    addUserForms.style.opacity = "0";
}