let regDiv = document.querySelector("#regDiv");
let logInWrapper = document.querySelector("#logInWrapper");
let bookWrapper = document.querySelector("#bookListWrapper");
let bookTitle = document.querySelector("#bookTitle");
let bookAuthor = document.querySelector("#bookAuthor");
let bookListWrapper = document.querySelector("#bookListWrapper");
let userBookList = document.querySelector("#userBookList");
let userBookListWrapper = document.querySelector("#userBookListWrapper");
let profileBookListNav = document.querySelector("#profileBookListNav");
let homeBtn = document.querySelector("#homeBtn");
let regLogInBtn = document.querySelector("#regLogInBtn");


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
    console.log(data);
    renderPage();
};
};
const renderPage = async () => {
    if (sessionStorage.getItem('token')) {
      
    
    let loginId = sessionStorage.getItem('loginId');
    let response = await fetch(`http://localhost:1337/api/users/${loginId}`, {
        headers: { 
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
    });
    let data = await response.json();
    document.querySelector('h2').innerHTML = `Välkommen ${data.username}`;
    logInWrapper.classList.add("hidden")
    getBooks();
}
};
renderPage();
const logout = async () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('loginId');
    document.querySelector('h2').innerHTML = `Du är utloggad`;
    logInWrapper.classList.remove("hidden");
};

const getBooks = async () => {
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
          <p class="card-text" id="releseDate">${book.attributes.ReleseDate}</p>
          <select id="newGrade">
            <option value="None">None</option>         
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            </select>
            <button id="">Grade</button>
          <button onclick="addUserBook(${book.id})">+</button>
          </div>
          </div>`
        });
    };

const loggedOutBooks = async () => {
        let response = await fetch("http://localhost:1337/api/books?populate=*", {
           
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
              </div>
              </div>`
            });
        };

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

//   const bookGrade = async (id) => {
//     const newGrade = document.querySelector("#newGrade").value;
//     const userId = sessionStorage.getItem("loginId");
//     const response = await fetch(`http://localhost:1337/api/books/${id}?populate=deep,3`, {
//         method: "PUT",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${sessionStorage.getItem("token")}`,
//         },
//         body: JSON.stringify({ 
//             data: 
//             { grade: newGrade }}),
    
//         })
//     ;
//     const data = await response.json();
//     console.log(data);
//     if (data.error) {
//         console.log(data.error);
//     } else {
//         console.log(data.message);
//     }
// };


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
homeBtn.addEventListener('click', (event) => {
        event.preventDefault(); 
        location.reload(); 
      });
regLogInBtn.addEventListener('click', () => {
        regDiv.classList.add("hidden");
        logInWrapper.classList.remove("hidden");
        });
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
  
loggedOutBooks();


// let ratingSelect = document.querySelector("#newGrade");

// ratingSelect.addEventListener("change", async () => {
//     const userId = sessionStorage.getItem("loginId");
//     // If the user selects a number and not the default "none".
//     if (ratingSelect.value !== "None"){
//         // Getting all the ratings from the user.
//         let response = await fetch(`http://localhost:1337/api/users/${userId}/?populate=deep,3`, {
//             method: "POST",
//         headers:{
//                 Authorization: `Bearer ${sessionStorage.getItem("token")}`
//             },
//         });
//         // For every rating that exist (loop dosen't start if there is no ratings).
//         for(let i = 0; i < response.data.grades.length; i++) {
//             // If the book already has a rating we use "put" to update that rating.
//             if (response.data.grades[i].book.id === bookId){
//                 let responsePut = await fetch (`http://localhost:1337/api/grades/${grades[i].id}`, {
                   
//                 body: JSON.stringify({
//                         grade: ratingSelect.value,
//                         user: sessionStorage.getItem('loginId'),
//                         book: bookId
//                       })
//                     }, 
//                     {
//                     headers: {
//                         Authorization: `Bearer ${sessionStorage.getItem("token")}`
//                     }
//                 })
//                 // Everything renders again (so we don't continue and create a new rating (code below) if we wanted to update)
//                 return getBooks(); 
//             }
//         }
// // If there was no rating for the book the user wants to rate we will post a new rating.
//             let responsePost = await fetch(`http://localhost:1337/api/grades`, {
//             method: "POST",    
            
//             body: JSON.stringify({
//                 grade: ratingSelect.value,
//                 user: sessionStorage.getItem('loginId'),
//                 book: bookId
//               })
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${sessionStorage.getItem("token")}`
//                 },
//             })

//         getBooks();
//     }
// });