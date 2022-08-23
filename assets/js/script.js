let bookShelfPartUncomplate = [];
let bookShelfPartFilter = [];
const RENDER_EVENT = 'render_book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'bookshelf_apps';

document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('formSave');
    const submitFilter = document.getElementById('searchBook');

    submitForm.addEventListener('submit', (event)=> {
        event.preventDefault();
        addBook();
        window.location.reload(true);
    });
    submitFilter.addEventListener('submit', (event) => {
        event.preventDefault();
        filterData(document.getElementById('searchBookTitle').value);
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
    
});

document.addEventListener(RENDER_EVENT, ()=> {
    const partUncomplate = document.getElementById('bookShelfPartUncomplate');
    partUncomplate.innerHTML = '';

    const partComplate = document.getElementById('bookShelfPartComplate');
    partComplate.innerHTML = '';

    for(let bookItem of bookShelfPartUncomplate) {
        let bookElement = makeElementBook(bookItem);
        if(!bookItem.isComplete){
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
    const isCompleteBook = document.getElementById('isComplete').checked;

    const generatedID = generateId();
    const bookObject = generatedBookObject(generatedID, titleBook, authorBook, yearBook, isCompleteBook);

    bookShelfPartUncomplate.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

const updateBook = (bookId) => {
    const bookTarget = findBook(bookId);
    
    const updateTitle = document.getElementById('edit-title').value;
    const updateAuthor = document.getElementById('edit-author').value;
    const updateYear = document.getElementById('edit-year').value;
    const updateisComplete = document.getElementById('editisComplete').checked;

    
    bookTarget.title = updateTitle;
    bookTarget.author = updateAuthor;
    bookTarget.year = updateYear;
    bookTarget.isComplete = updateisComplete;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

const generateId = () => {
    return +new Date();
}

const generatedBookObject = (id, title, author, year, isComplete) => {
    return {
        id,
        title,
        author,
        year,
        isComplete,
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

    const actionEdit = () => {
        const editBtn = document.createElement('button');
        editBtn.classList.add('btn-edit');

            editBtn.addEventListener('click', () => {
                editBookShelf(bookObject);
            });
        return editBtn;
    }

    const actionCheck = () => {
        const checkBtn = document.createElement('button');
        checkBtn.classList.add('btn-check');

        checkBtn.addEventListener('click', ()=> {
            addBookToComplated(bookObject.id);
        });

        return checkBtn;
    }

    const actionUndo = () => {
        const undoBtn = document.createElement('button');
        undoBtn.classList.add('btn-undo');

        undoBtn.addEventListener('click', () => {
            undoBookToComplate(bookObject.id);
        });

        return undoBtn;
    }

    if(bookObject.isComplete) {

        actionUndo();

        actionTrash();

        elementContainer.append(actionUndo(), actionTrash());

    } else {

        // editBtn.classList.add('btn-edit');

        // const saveBook = document.getElementById('save');
        // const editBook = document.getElementById('edit');

        // editBtn.addEventListener('click', () => {
        //     saveBook.setAttribute('hidden', true);
        //     editBook.removeAttribute('hidden');

        //     const bookId = bookObject.id;
        //     const bookItem = findBook(bookId);
        
        //     const editTitle = document.getElementById('edit-title');
        //     editTitle.value = bookItem.title;
        
        //     const editAuthor = document.getElementById('edit-author');
        //     editAuthor.value = bookItem.author;
        
        //     const editYear = document.getElementById('edit-year');
        //     editYear.value = bookItem.year;
        
        //     const editisComplete = document.getElementById('editisComplete');
        //     editisComplete.checked = bookItem.isComplete;
        //     const submitFormEdit = document.getElementById('formEdit');
        //     submitFormEdit.addEventListener('submit', (event) => {
        //         event.preventDefault();
        //         updateBook(bookId);
        //         window.location.reload(true);
        //     });

        // });
        actionCheck();

        actionEdit();

        actionTrash();
        
        elementContainer.append(actionCheck(), actionEdit(), actionTrash());
    }

    return elementContainer;

}

const editBookShelf = (bookObject) => {
    const saveBook = document.getElementById('save');
    const editBook = document.getElementById('edit');
    saveBook.setAttribute('hidden', true);
    editBook.removeAttribute('hidden');

    const bookId = bookObject.id;
    const bookItem = findBook(bookId);

    const editTitle = document.getElementById('edit-title');
    editTitle.value = bookItem.title;

    const editAuthor = document.getElementById('edit-author');
    editAuthor.value = bookItem.author;

    const editYear = document.getElementById('edit-year');
    editYear.value = bookItem.year;

    const editisComplete = document.getElementById('editisComplete');
    editisComplete.checked = bookItem.isComplete;
    const submitFormEdit = document.getElementById('formEdit');
    submitFormEdit.addEventListener('submit', (event) => {
        event.preventDefault();
        updateBook(bookId);
        window.location.reload(true);
    });
}

const addBookToComplated = (bookId) => {
    const bookTarget = findBook(bookId);
    if(bookTarget === null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

const undoBookToComplate = (bookId) => {
    const bookTarget = findBook(bookId);
    if(bookTarget === null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveDataToLocalStorage();
}

const removeBookToShelf = (bookId) => {

    Swal.fire({
        title: 'Are you sure?',
        text: "Delete item book in the shelf",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#FDCB9E',
        cancelButtonColor: '#FF5F7E',
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
    if(dataBook !== null) {
        for (const book of dataBook){
            bookShelfPartUncomplate.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

const filterData = (titleBook) => {
    document.getElementById('bookShelfPartUncomplate').innerHTML = '';
    document.getElementById('bookShelfPartComplate').innerHTML = '';
    bookShelfPartFilter = [...bookShelfPartUncomplate];

    if(titleBook === "" || titleBook === 'undefined') {
        document.dispatchEvent(new Event(RENDER_EVENT));
    } else {
        for(let bookShelf of bookShelfPartFilter.filter((bookShelf) => {
            return bookShelf.title === titleBook.toLowerCase();
        })) {
            if(bookShelf.isComplete === false) {
                document.getElementById('bookShelfPartUncomplate').insertAdjacentHTML(
                    'beforeend',
                    `<div class="inner">
                        <h4 class="data-title">${`Book Title`} : ${bookShelf.title}</h4>
                        <h4 class="data-author">${`Author`} : ${bookShelf.author}</h4>
                        <h4 class="data-year">${`Year`} : ${bookShelf.year}</h4>
                        <button onClick="addBookToComplated(${bookShelf.id})" class="btn-check"></button>
                        <button onClick="editBookShelf(${bookShelf})" class="btn-edit"></button>
                        <button onClick="removeBookToShelf(${bookShelf.id})"  class="btn-trash"></button>
                    </div>`
                );
            } else {
                document.getElementById('bookShelfPartComplate').insertAdjacentHTML(
                    'beforeend',
                    `<div class="inner">
                        <h4 class="data-title">${`Book Title`} : ${bookShelf.title}</h4>
                        <h4 class="data-author">${`Author`} : ${bookShelf.author}</h4>
                        <h4 class="data-year">${`Year`} : ${bookShelf.year}</h4>
                        <button onClick="undoBookToComplate(${bookShelf.id})" class="btn-check"></button>
                        <button onClick="removeBookToShelf(${bookShelf.id})"  class="btn-trash"></button>
                    </div>`
                );
            }
        }

    }

}





