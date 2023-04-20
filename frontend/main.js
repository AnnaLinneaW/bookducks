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
let myRatedBooks = document.querySelector("#myRatedBooks");
let myRatedBooksWrapper = document.querySelector("#ratedBooksWrapper");
let sortOptions = document.querySelector("#ratedBooksWrapper");


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
    document.querySelector('h2').innerHTML = ` ${data.username}!`;
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
    userBookListWrapper.classList.add("hidden");
    bookListWrapper.classList.remove("hidden");
    myRatedBooksWrapper.classList.add("hidden");
    loggedOutBooks();
};
const getBooks = async () => {
    let response = await fetch("http://localhost:1337/api/books?populate=deep,3", {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        }
      });
    let data = await response.json();
    let books = data.data;
    let bookList = document.querySelector("#bookList");
    
    bookList.innerHTML = "";
    books.forEach(async(book) => {
        let rating = await yourRating(book.id);
        bookList.innerHTML += `
            <div class="card g-4 p-4 mx-3 justify-content-center" style="width: 15rem;">
                <img src="http://localhost:1337${book.attributes.cover.data.attributes.url}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title" id="bookTitle">${book.attributes.title}</h5>
                    <p class="card-text" id="bookAuthor">${book.attributes.author}</p>
                    <p class="card-text" id="releseDate">${book.attributes.ReleseDate}</p>
                    <p class="card-text"></p>
                    <p class="card-text" id="rating">Betyg: ${rating}</p>
                    <select id="newGrade" class="shadow">
                        <option value="None">None</option>         
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                    <input type="button" class="shadow btn btn-primary m-3" onclick="bookGrade(this.previousElementSibling.value, '${book.id}')"value="Rate">
                    <input type="button" class="shadow btn btn-primary" onclick="addUserBook(${book.id})"value="+ Lägg i min lista">
                </div>
            </div>`;
        
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
    // Adding book to users to readlist
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
// Function for rating a book
const bookGrade = async (newGrade, bookId) => {
    const userId = sessionStorage.getItem("loginId");
    const firstResponse = await fetch(`http://localhost:1337/api/users/${userId}?populate=deep,3`, {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        }
    });
    const firstData = await firstResponse.json();
    const grades = firstData.grades || [];    
    console.log(grades);

    // Check if the book already has a grade 
    const bookGrades = grades.filter((g) => g.book && g.book.id === bookId);
    if (bookGrades.length > 0) {
        // If the book already has a grade , update it
        const gradeId = bookGrades[0].id;
        const response = await fetch(`http://localhost:1337/api/grades/${gradeId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                grade: newGrade,
                book: bookId,
                user: userId,
            }),
        });
        const data = await response.json();
        console.log(newGrade);

        if (data.error) {
            console.log(data.error);
        } else {
            console.log(data.message);
        }
    } else {
        // If the book doesn't have a grade, create a new one
        const response = await fetch(`http://localhost:1337/api/grades`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                data: {
                    grade: newGrade,
                    book: bookId,
                    user: userId,
                }
            }),
        });
        const data = await response.json();
        console.log(newGrade);

        if (data.error) {
            console.log(data.error);
        } else {
            console.log(data.message);
        }
    }
    getBooks();
};

// Fucrtion to get the rating of the book and the rated books
const yourRating = async (bookId) => {
    let response = await fetch(`http://localhost:1337/api/users/me?populate=deep,3`, {
        method: "GET",
        headers:{
            Authorization: `Bearer ${sessionStorage.getItem("token")}`
        },
    });
    data = await response.json();
    youRatingArray = data.grades;
    let yourBookRating = ""
    data.grades.forEach(grade => {
        if (grade.book.id === bookId) {
            yourBookRating = (grade.grade);
        }
    })
    if (yourBookRating === "") {
        return "Inget betyg";
    }
    return `${yourBookRating}`;
}
const getRatings = async () => {
    let response = await fetch(`http://localhost:1337/api/users/me?populate=deep,4`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    let data = await response.json();
    let myRatedBooks = document.querySelector("#myRatedBooks");
    let myRatings = data.grades;
    console.log(myRatings);
    // Function for sorting the books
    let sort = document.querySelector('input[name="sort"]:checked').value;
    const sortBooks = (books, sort) => {
        if (sort === "Titel") {
          books.sort((a, b) => a.book.title.localeCompare(b.book.title));
        } else if (sort === "Författare") {
          books.sort((a, b) => a.book.author.localeCompare(b.book.author));
        } else if (sort === "Betyg") {
          books.sort((a, b) => b.grade - a.grade);
        }
        return books;
      };
    let sortedBooks = sortBooks(myRatings, sort);
  
    // Clear the HTML of myRatedBooks
    myRatedBooks.innerHTML = "";
  
    // Update the HTML of myRatedBooks with the sorted books
    sortedBooks.forEach( (book) => {
      myRatedBooks.innerHTML += `
        <div class="card g-4 p-4 mx-3 justify-content-center" style="width: 15rem;">
        <img src="http://localhost:1337${book.book.cover.url}" class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title" id="bookTitle">${book.book.title}</h5>
            <p class="card-text" id="bookAuthor">${book.book.author}</p>
            <p class="card-text" id="releaseDate">${book.book.ReleseDate}</p>
            <p class="card-text"></p>
            <p class="card-text" id="rating">Betyg: ${book.grade}</p>
          </div>
        </div>`;
    });
  };
const getUserBooks = async () => {
    const response = await fetch(`http://localhost:1337/api/users/me?populate=deep,3`, {
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        }
    });
    const data = await response.json();
    const books = data.books;
    userBookList.innerHTML = "";
    books.forEach((book) => {
        userBookList.innerHTML += `
        <div class="card g-4 p-4 mx-3" style="width: 15rem;">
        <img src="http://localhost:1337${book.cover.url}" class="card-img-top" alt="...">
        <div class="card-body">
            <h5 class="card-title" id="bookTitle">${book.title}</h5>
            <p class="card-text" id="bookAuthor">${book.author}</p>
            </div>
            </div>`
        });
};

// darkmode lightmode function
const getMode = async () => {
        let response = await fetch(`http://localhost:1337/api/darktheme`, {
            method: "GET",
        });
        let data = await response.json();
        let theme = data.data.attributes.theme;
        console.log(theme);
        document.body.classList.add(theme);
    }
    getMode();
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
document.querySelector("#regBtn").addEventListener("click", register);
document.querySelector("#logInBtn").addEventListener("click", login);
profileBookListNav.addEventListener("click", () => {
    bookListWrapper.classList.add("hidden");
    userBookListWrapper.classList.remove("hidden");
    myRatedBooksWrapper.classList.remove("hidden");
    getUserBooks();
    getRatings();
});
sortOptions.addEventListener("change", () => {
  getRatings();
});


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


// const allRatings = async (bookId) => {
//     let response = await fetch(`http://localhost:1337/api/grades?populate=deep,3`, {
//         method: "GET",
//         headers:{
//             Authorization: `Bearer ${sessionStorage.getItem("token")}`
//         },
//     });
//     data = await response.json();
//     let allRatingsArray = data.data;
//     let allRatings = [];
//     console.log(allRatingsArray);
//     allRatingsArray.forEach(grade => {
//         if (book.id === bookId) {
//             allRatings.push(grade.grade);
//         }
//     })
//     console.log(allRatings);
//     return allRatings;
// }
// allRatings(1);
// const averageRating = async (bookId) => {
//     let allRatingsArray = await allRatings(bookId);
//     let sum = 0;
//     allRatingsArray.forEach(grade => {
//         sum += grade;
//     })
//     let average = sum / allRatingsArray.length;
//     return average;
// }

loggedOutBooks();