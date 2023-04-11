let bookWrapper = document.querySelector("#bookListWrapper");
let bookTitle = document.querySelector("#bookTitle");
let bookAuthor = document.querySelector("#bookAuthor");
let register = async () => {
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#newPassword").value;
    let username = document.querySelector("#username").value;
    let response = await fetch('http://localhost:1337/api/auth/local/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            username:`${username}`,
            password:`${password}`,
            email:`${email}`,
        }),
    });

    // kolla vad det här gör, roboten vill ha det
    console.log(response);
    
}
const login = async () => {
    let password = document.querySelector('#password').value;
    let userName = document.querySelector('#identifier').value;
    //fetches the data from the backend
    //
    let response = await fetch('http://127.0.0.1:1337/api/auth/local', {
        method: 'POST',
        body: JSON.stringify({
            identifier: `${userName}`,
            password: `${password}`,
        }),
        headers: {
            'Content-Type': 'application/json',
        },
});
    if (!response.ok) {
        document.querySelector('h2').innerHTML = `Fel användarnamn eller lösenord`;
  } else{
    let data = await response.json();
    sessionStorage.setItem('token', data.jwt);
    console.log("token");
    console.log(data);
    logInWrapper.classList.add("hidden");
    bookListWrapper.classList.remove("hidden");
    document.querySelector('h2').innerHTML = `Välkommen ${data.user.username}`;
  };
};
let createBook = async () => {
    //With Fetch
    let newBook = document.querySelector("#bookInput").value;
    let bookDesc = document.querySelector("#bookAuthor").value;
    let response = await fetch("http://localhost:1337/api/books", {
        //config
        method: "POST",
        body: JSON.stringify({
            data: {
                title: `${newBook}`,
                author: `${bookDesc}`,
            },
        }),
        headers: {
            "Content-Type": "application/json",
        },

    });
    document.querySelector("#bookInput").value = "";
    document.querySelector("#bookDesc").value = "";
    getBooks();
};
// 
let getBooks = async () => {
    let response = await fetch("http://localhost:1337/api/books");
    let data = await response.json();
    let books = data.data;
    console.log(books);
    let bookList = document.querySelector("#bookList");
    bookList.innerHTML = "";
    books.forEach((book) => {
        bookList.innerHTML += `<div class="card" style="width: 18rem;">
        <img src="..." class="card-img-top" alt="...">
        <div class="card-body">
          <h5 class="card-title" id="bookTitle">${book.attributes.title}</h5>
          <p class="card-text" id="bookAuthor">${book.attributes.author}</p>
          <button onclick="deleteBook(${book.id})">Delete</button>
        </div>
      </div>`
        
    });
};

  
  let deleteBook = async (id) => {
    let response = await fetch(`http://localhost:1337/api/books/${id}`, {
      method: "DELETE",
    });
    getBooks();
  };
  
  let updateBook = async (id) => {
  await fetch(`http://localhost:1337/api/books/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            data: {
                title: `${newBook}`,
                author: `${bookDesc}`,
            },
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });
};

getBooks()
let regDiv = document.querySelector("#regDiv");
let logInWrapper = document.querySelector("#logInWrapper");

document.querySelector("#regNewBtn").addEventListener("click", ()=>{
    regDiv.classList.remove("hidden");
    logInWrapper.classList.add("hidden");
});
//document.querySelector("#add").addEventListener("click", createBook);
document.querySelector("#regBtn").addEventListener("click", register);
document.querySelector("#logInBtn").addEventListener("click", login);

