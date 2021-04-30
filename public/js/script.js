let socket = io();
const chooseRoomPage = document.querySelector('#chooseRoomPage')
const questionPage = document.querySelector('#questionPage')
const questionForm = document.querySelector('#questionForm')
const winnerPage = document.querySelector('#winnerPage')
const form = document.forms[0]
form.addEventListener('submit', handleRoomSubmit)
let data = {}
let rightAnswers = []

function handleRoomSubmit(e){
    e.preventDefault()
    var room = document.querySelector('input[name="room-select"]:checked').value;
    let name = document.getElementById('name').value
    socket.emit('joinRoom', {room: room, name: name})
}

function handleQuizSubmit(e){
    e.preventDefault()
}

socket.on('joinComplete', (emmited) => {
    console.dir(emmited.name)
    form.children[0].setAttribute('disabled', 'true')
    //socketio.sockets.adapter.rooms[roomId]
});

socket.on('roomCount', (roomCount) => {
    console.log(roomCount.users)
    if (roomCount.count == 1) {
        document.querySelector("input[value=" + roomCount.room + "]").setAttribute("disabled", "true")
        socket.emit('roomFull', roomCount.room)
    }
});

socket.on('data', questions => {
    chooseRoomPage.style.display="none";
    questionPage.style.display="block";
    for (question of questions){
        addQuestion(question, questions.indexOf(questions))
    }
});

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
        button.textContent = 'Submit'
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
        }
    }
    console.log()
    // socket.emit('score', score)
}