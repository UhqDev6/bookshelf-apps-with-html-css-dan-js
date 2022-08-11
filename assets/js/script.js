const bookShelfPartUncomplate = [];
const RENDER_EVENT = 'render_book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'bookshelf_apps';

document.addEventListener('DOMContentLoaded', (bookId) => {
    const submitForm = document.getElementById('form');
    const submitFilter = document.getElementById('searchBook');

    submitForm.addEventListener('submit', (event)=> {
        event.preventDefault();
        addBook();
        window.location.reload(true);
    });
    submitFilter.addEventListener('submit', (event) => {
        event.preventDefault();
        filterData();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
    
});

document.addEventListener(RENDER_EVENT, ()=> {
    console.log(bookShelfPartUncomplate);

    const partUncomplate = document.getElementById('bookShelfPartUncomplate');
    partUncomplate.innerHTML = '';

    const partComplate = document.getElementById('bookShelfPartComplate');
    partComplate.innerHTML = '';

    for(let bookItem of bookShelfPartUncomplate) {
        let bookElement = makeElementBook(bookItem);
        if(!bookItem.isRead){
            partUncomplate.append(bookElement);
        }else{
            partComplate.append(bookElement);
        }
    }
});


const addBook = () => {
    const titleBook = document.getElementById('title').value;
    const authorBook  = document.getElementById('author').value;
    const yearBook = document.getElementById('year').value;
    const isReadBook = document.getElementById('isRead').checked;

    const generatedID = generateId();
    const bookObject = generatedBookObject(generatedID, titleBook, authorBook, yearBook, isReadBook);

    bookShelfPartUncomplate.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

const updateBook = (bookId) => {
    const bookTarget = findBook(Number(bookId));
    
    if(bookTarget === null) return;

    const updateTitle = document.getElementById('edit-title').value;
    const updateAuthor = document.getElementById('edit-author').value;
    const updateYear = document.getElementById('edit-year').value;
    const updateIsRead = document.getElementById('editIsRead').checked;
    
    bookTarget.title = updateTitle;
    bookTarget.author = updateAuthor;
    bookTarget.year = updateYear;
    bookTarget.isRead = updateIsRead;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

const generateId = () => {
    return +new Date();
}

const generatedBookObject = (id, title, author, year, isRead) => {
    return {
        id,
        title,
        author,
        year,
        isRead
    }
}

const makeElementBook = (bookObject) => {
    const elementTitle = document.createElement('h4');
    elementTitle.classList.add('data-title');
    elementTitle.innerText = `Book Title : ${bookObject.title}`;

    const elementAuthor = document.createElement('h4');
    elementAuthor.classList.add('data-author');
    elementAuthor.innerText = `Author : ${bookObject.author}`;

    const elementYear = document.createElement('h4');
    elementYear.classList.add('data-year');
    elementYear.innerText = `Year : ${bookObject.year}`;

    const elementContainer = document.createElement('div');
    elementContainer.classList.add('inner');
    elementContainer.append(elementTitle, elementAuthor, elementYear);

    elementContainer.setAttribute('id', `${bookObject.id}`);

    const actionTrash = () => {
        const trashBtn = document.createElement('button');
        trashBtn.classList.add('btn-trash');

        trashBtn.addEventListener('click', ()=> {
            removeBookToShelf(bookObject.id);
        });

        return trashBtn;
    }

    if(bookObject.isRead) {
        const undoBtn = document.createElement('button');
        undoBtn.classList.add('btn-undo');

        undoBtn.addEventListener('click', () => {
            undoBookToComplate(bookObject.id);
        });

        actionTrash();

        elementContainer.append(undoBtn, actionTrash());
    }else {
        const checkBtn = document.createElement('button');
        checkBtn.classList.add('btn-check');

        checkBtn.addEventListener('click', ()=> {
            addBookToComplated(bookObject.id);
        });

        const editBtn = document.createElement('button');
        editBtn.classList.add('btn-edit');

        const formInputBook = document.getElementById('inputBook');
        const formEditBook = document.getElementById('editBook');
        editBtn.addEventListener('click', () => {
            formInputBook.setAttribute('hidden', true);
            formEditBook.removeAttribute('hidden');
    
            const bookId = bookObject.id;
            const bookItem = findBook(Number(bookId));

            const editTitle = document.getElementById('edit-title');
            editTitle.value = bookItem.title;

            const editAuthor = document.getElementById('edit-author');
            editAuthor.value = bookItem.author;

            const editYear = document.getElementById('edit-year');
            editYear.value = bookItem.year;

            const editIsRead = document.getElementById('editIsRead');
            editIsRead.checked = bookItem.isRead;
            const submitFormEdit = document.getElementById('formEdit');
            submitFormEdit.addEventListener('submit', (event) => {
                event.preventDefault();
                updateBook(bookId);
                window.location.reload(true);
            });

        });

        actionTrash();
        
        elementContainer.append(checkBtn, editBtn, actionTrash());
    }

    return elementContainer;

}

const addBookToComplated = (bookId) => {
    const bookTarget = findBook(bookId);
    if(bookTarget === null) return;

    bookTarget.isRead = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

const undoBookToComplate = (bookId) => {
    const bookTarget = findBook(bookId);
    if(bookTarget === null) return;

    bookTarget.isRead = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

const removeBookToShelf = (bookId) => {

    Swal.fire({
        title: 'Are you sure?',
        text: "Delete item book in the shelf",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
            const bookTarget = findBookIndex(bookId);
            if(bookTarget === -1) return;
            bookShelfPartUncomplate.splice(bookTarget, 1);
            localStorage.removeItem(STORAGE_KEY);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveDataToLocalStorage();
        }
      })

}

const findBook = (bookId) => {
    for(const bookItem of bookShelfPartUncomplate){
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
}

const findBookIndex = (bookId) => {
    for(const index in bookShelfPartUncomplate){
        if(bookShelfPartUncomplate[index].id === bookId){
            return index;
        }
    }
}

const saveDataToLocalStorage = () => {
    if(isStorageExist()) {
        const parsed = JSON.stringify(bookShelfPartUncomplate);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const isStorageExist = () => {
    if(typeof (Storage) === 'undefined'){
        alert('Browser tidak mengdukung web storage');
        return false;
    }
    return true;
}

const loadDataFromStorage = () => {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let dataBook = JSON.parse(serializedData);
    console.log(dataBook);
    if(dataBook !== null) {
        for (const book of dataBook){
            bookShelfPartUncomplate.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

const filterData = () => {
    let titleBook = document.getElementById('searchBookTitle').value;
    console.log(titleBook);

    const findTitleBook = document.querySelectorAll('.inner > .data-title');
    console.log(findTitleBook);

    for(let dataItem of findTitleBook){
        if(dataItem.innerText.toLowerCase().includes(titleBook)) {
            dataItem.parentElement.style.display = 'block';
        } else {
            dataItem.parentElement.style.display = 'none';
        }
    }

}


