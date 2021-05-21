let socket = io();
const chooseRoomPage = document.querySelector('#chooseRoomPage')
const questionPage = document.querySelector('#questionPage')
const questionForm = document.querySelector('#questionForm')
const winnerPage = document.querySelector('#winnerPage')
const form = document.forms[0]
form.addEventListener('submit', handleRoomSubmit)
let data = {}
let rightAnswers = []

socket.on('joinComplete', (emmited) => {
    console.dir(emmited.name)
    form.children[0].setAttribute('disabled', 'true')
});

socket.on('roomCount', (roomCount) => {
    console.log(roomCount.users)
    if (roomCount.count == 2) {
        document.querySelector("input[value=" + roomCount.room + "]").setAttribute("disabled", "true")
        socket.emit('roomFull', roomCount.room)
    }
});

socket.on('data', questions => {
    chooseRoomPage.style.display="none";
    questionPage.style.display="block";
    data = questions;
    for (question of questions){
        addQuestion(question, data.indexOf(question))
    }
});

socket.on('resultPage', endObj => {
    questionPage.style.display="none";
    winnerPage.style.display="block";
    console.log(endObj.winnerScore)
    console.log(endObj.loserScore)
    if(endObj.winnerScore == endObj.loserScore){
        createTiePage(endObj.winnerScore)
    }
    else if (endObj.winner == socket.id){
        createWinnerPage(endObj.winnerScore)
    }
    else{
        createLoserPage(endObj.loserScore)
    }
})

function handleRoomSubmit(e){
    e.preventDefault()
    var room = document.querySelector('input[name="room-select"]:checked').value;
    let name = document.getElementById('name').value
    socket.emit('joinRoom', {room: room, name: name})
}

function handleQuizSubmit(e){
    e.preventDefault()
}

function shuffle(array){
    array.sort(() => Math.random() - 0.5);
}

function addQuestion(question, index) {
    index+=1;
    const answers = [];
    for (incorrect_answer of question.incorrect_answers){
        answers.push(incorrect_answer)
    }
    answers.push(question.correct_answer)
    rightAnswers.push(question.correct_answer)
    shuffle(answers)
    // Fieldset maken voor elke vraag
    // Input en label maken voor elk antwoord
    let newQuestionField = document.createElement('fieldset');
    let newQuestion = document.createElement('h3')
    questionForm.appendChild(newQuestionField);
    newQuestion.innerHTML = question.question;
    newQuestionField.appendChild(newQuestion)
    for (i = 0; i < answers.length; i++) {
        let input = document.createElement('input')
        input.setAttribute('type', 'radio')
        input.setAttribute('id', answers[i])
        input.setAttribute('name', `question${index}`)
        if (i == 0){
            input.required = true;
        }
        newQuestionField.appendChild(input)
        let label = document.createElement('label')
        label.setAttribute('for', answers[i])
        label.textContent = answers[i]
        newQuestionField.appendChild(label)
    }
    if (index == 10){
        let button = document.createElement('input')
        button.setAttribute('type', 'button')
        button.setAttribute('id', 'submitButton')
        button.setAttribute('onclick', 'submitQuestions()')
        button.setAttribute('value', 'Submit')
        questionForm.appendChild(button)
    }
}

function submitQuestions(){
    score = 0;
    for(i = 0; i < data.length; i++){
        let inputList = document.getElementsByName(`question${i+1}`)
        for (checkbox of inputList){
            if (checkbox.checked){
                playerAnswer = checkbox.id;
            }
        }
        if (rightAnswers[i]==playerAnswer){
            score++
            console.log(score)
        }
    }
    const room = document.querySelector('input[name="room-select"]:checked').value
    const userId = socket.id
    const result = {user: userId, score: score, room: room}
    socket.emit('score', result)
}

function createWinnerPage(score){
    console.log("CHAMP!!")
    const winnerDiv = document.createElement('div')
    winnerDiv.setAttribute('id', 'winnerDiv')
    winnerPage.appendChild(winnerDiv)
    const header = document.createElement('h2')
    const headerMessage = document.createTextNode("You won!!")
    header.appendChild(headerMessage)
    winnerDiv.appendChild(header)
    const text = document.createElement('p')
    const textMessage = document.createTextNode(`You answered ${score} questions correct!`)
    text.appendChild(textMessage)
    winnerDiv.appendChild(text)
    // const image = document.createElement('img')
    // image.src = 'https://giphy.com/gifs/news-atl-down-MTclfCr4tVgis'
    // winnerDiv.appendChild(image)
    let returnButton = document.createElement('input')
    returnButton.setAttribute('type', 'button')
    returnButton.setAttribute('id', 'returnButton')
    returnButton.setAttribute('onclick', 'returnEvent()')
    returnButton.setAttribute('value', 'Back to main menu')
    winnerDiv.appendChild(returnButton)
}

function createTiePage(score){
    const loserDiv = document.createElement('div')
    loserDiv.setAttribute('id', 'tieDiv')
    winnerPage.appendChild(loserDiv)
    const header = document.createElement('h2')
    const headerMessage = document.createTextNode("It's a tie!!")
    header.appendChild(headerMessage)
    loserDiv.appendChild(header)
    const text = document.createElement('p')
    const textMessage = document.createTextNode(`Both players answered ${score} questions correct!`)
    text.appendChild(textMessage)
    loserDiv.appendChild(text)
    // const image = document.createElement('img')
    // image.src = 'https://giphy.com/gifs/filmeditor-disney-pixar-3o6wrvdHFbwBrUFenu'
    // loserDiv.appendChild(image)
    let returnButton = document.createElement('input')
    returnButton.setAttribute('type', 'button')
    returnButton.setAttribute('id', 'returnButton')
    returnButton.setAttribute('onclick', 'returnEvent()')
    returnButton.setAttribute('value', 'Back to main menu')
    loserDiv.appendChild(returnButton)
}

function createLoserPage(score){
    console.log("Loser!!")
    const loserDiv = document.createElement('div')
    loserDiv.setAttribute('id', 'loserDiv')
    winnerPage.appendChild(loserDiv)
    const header = document.createElement('h2')
    const headerMessage = document.createTextNode("You lost!!")
    header.appendChild(headerMessage)
    loserDiv.appendChild(header)
    const text = document.createElement('p')
    const textMessage = document.createTextNode(`You only answered ${score} questions correct!`)
    text.appendChild(textMessage)
    loserDiv.appendChild(text)
    // const image = document.createElement('img')
    // image.src = 'https://giphy.com/gifs/filmeditor-disney-pixar-3o6wrvdHFbwBrUFenu'
    // loserDiv.appendChild(image)
    let returnButton = document.createElement('input')
    returnButton.setAttribute('type', 'button')
    returnButton.setAttribute('id', 'returnButton')
    returnButton.setAttribute('onclick', 'returnEvent()')
    returnButton.setAttribute('value', 'Back to main menu')
    loserDiv.appendChild(returnButton)
}

function returnEvent(){
    window.location.reload()
}