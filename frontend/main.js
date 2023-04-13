let regDiv = document.querySelector("#regDiv");
let logInWrapper = document.querySelector("#logInWrapper");
let bookWrapper = document.querySelector("#bookListWrapper");
let bookTitle = document.querySelector("#bookTitle");
let bookAuthor = document.querySelector("#bookAuthor");
let bookListWrapper = document.querySelector("#bookListWrapper");
let userBookList = document.querySelector("#userBookList");
let userBookListWrapper = document.querySelector("#userBookListWrapper");
let profileBookListNav = document.querySelector("#profileBookListNav");


const register = async () => {
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
    if (response.ok) {
        document.querySelector('h2').innerHTML = `Registration successful. Please log in.`;
    } else {
        let data = await response.json();
        document.querySelector('h2').innerHTML = `Registration failed: ${data.message}`;
    }
    console.log(response);
    
}
const login = async () => {
    let password = document.querySelector('#password').value;
    let userName = document.querySelector('#identifier').value;
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
let data = await response.json();
if (!response.ok) {
    document.querySelector('h2').innerHTML = `Fel användarnamn eller lösenord`;
} else {
    sessionStorage.setItem('token', data.jwt);
    sessionStorage.setItem("loginId", data.user.id);
      document.querySelector('h2').innerHTML = `Välkommen ${data.user.username}`;
      console.log("token");
      console.log(data);
    };
    if (sessionStorage.getItem('token')) {
        console.log("token");
        logInWrapper.classList.add("hidden");
        bookListWrapper.classList.remove("hidden");
    }
getBooks();
};
let logout = async () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('loginId');
    document.querySelector('h2').innerHTML = `Du är utloggad`;
    logInWrapper.classList.remove("hidden");
    bookListWrapper.classList.add("hidden");
    userBookListWrapper.classList.add("hidden");
};
// let landingPage = () => {
//     let response = fetch('http://localhost:1337/api/books?populate=*', {
//         headers: {
//             Authorization: `Bearer ${sessionStorage.getItem('token')}`,
//         },
//     });

// };
let getBooks = async () => {
    // let token = sessionStorage.getItem('token');
    let response = await fetch("http://localhost:1337/api/books?populate=*", {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        }
      });
    let data = await response.json();
    let books = data.data;
    let bookList = document.querySelector("#bookList");
    
    bookList.innerHTML = "";
    books.forEach((book) => {
        bookList.innerHTML += `
        <div class="card g-4 p-4 mx-3" style="width: 15rem;">
        <img src="http://localhost:1337${book.attributes.cover.data.attributes.url}" class="card-img-top" alt="...">
        <div class="card-body">
          <h5 class="card-title" id="bookTitle">${book.attributes.title}</h5>
          <p class="card-text" id="bookAuthor">${book.attributes.author}</p>
          <select id="newGrade">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            </select>
            <button onclick="bookGrade(${book.id})">Grade</button>
          <button onclick="addUserBook(${book.id})">+</button>
          </div>
          </div>`
        });
    };
    // <button onclick="deleteBook(${book.id})">Delete</button>

// 
const addUserBook = async (bookId) => {
    const userId = sessionStorage.getItem("loginId");
    const firstResponse = await fetch(`http://localhost:1337/api/users/me?populate=deep,3`, {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        }
    });
    const firstData = await firstResponse.json();
    const books = firstData.books;
    const response = await fetch(`http://localhost:1337/api/users/${userId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            books: [...books, bookId],
        }),
    });
    const data = await response.json();
    console.log(response);
    if (data.error) {
        console.log(data.error);
    } else {
        console.log(data.message);
    }
};

  const bookGrade = async (id) => {
    const newGrade = document.querySelector("#newGrade");
    const userId = sessionStorage.getItem("loginId");
    const response = await fetch(`http://localhost:1337/api/books?populate=deep,3`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
            grade: newGrade.value,
        }),
    });
    const data = await response.json();
    console.log(data);
    if (data.error) {
        console.log(data.error);
    } else {
        console.log(data.message);
    }
};


profileBookListNav.addEventListener("click", () => {
    bookListWrapper.classList.add("hidden");
    userBookListWrapper.classList.remove("hidden");
    getUserBooks();
});

getUserBooks = async () => {
    const userId = sessionStorage.getItem("loginId");
    const response = await fetch(`http://localhost:1337/api/users/me?populate=deep,3`, {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        }
    });
    const data = await response.json();
    const books = data.books;
    console.log(data.books);
    userBookList.innerHTML = "";
    books.forEach((book) => {
        userBookList.innerHTML += `
        <div class="card g-4 p-4 mx-3" style="width: 15rem;">
        <img src="http://localhost:1337${book.cover.url}" class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title" id="bookTitle">${book.title}</h5>
            <p class="card-text" id="bookAuthor">${book.author}</p>
            <button onclick="deleteBook(${book.id})">Delete</button>
            </div>
            </div>`
        });
    };

document.querySelector("#logOutNav").addEventListener("click", logout);
document.querySelector("#regNewBtn").addEventListener("click", ()=>{
    regDiv.classList.remove("hidden");
    logInWrapper.classList.add("hidden");
});
//document.querySelector("#add").addEventListener("click", createBook);
document.querySelector("#regBtn").addEventListener("click", register);
document.querySelector("#logInBtn").addEventListener("click", login);



// Senare för admin
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
                user: sessionStorage.getItem("loginId"),
            },
        }),
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },

    });
    document.querySelector("#bookInput").value = "";
    document.querySelector("#bookDesc").value = "";
    getBooks();
};

let deleteBook = async (id) => {
    let response = await fetch(`http://localhost:1337/api/books/${id}`, {
      method: "DELETE",
      headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
    });
    getBooks();
  };