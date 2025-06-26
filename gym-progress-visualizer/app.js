const re = /^(?:\d{2})([/])\d{2}\1\d{4}$/;

function testDate(dateInput) {
    console.log("date received: ", dateInput);
    const ok = re.exec(dateInput);
    console.log("Regex result: ", ok);

    if(!ok) {
        displayError("Invalid Date Format! Please use MM/DD/YYYY");

        throw new Error("Invalid Date Format! Please use MM/DD/YYYY");
    }
}

const workoutForm = document.querySelector('.workout-form');
const workoutDate = document.querySelector('#workout-date');
const workoutTableBody = document.querySelector('.individual-workouts');
const workouts = JSON.parse(localStorage.getItem('workouts')) || [];
const errorMessage = document.querySelector('.error-message');
const lifts = document.querySelector('.lifts');

function displayError(message) {
    errorMessage.textContent = message;
    setTimeout(() => {
        errorMessage.textContent = '';
    }, 5000);
}

function addWorkout(e) {
    e.preventDefault();
    const date = (this.querySelector('[name=workout-date]')).value;
    const exerciseSelect = this.querySelector('[name=exercise]');
    const exercise = exerciseSelect.options[exerciseSelect.selectedIndex].text;
    const sets = (this.querySelector('[name=workout-sets]')).value;
    const reps = (this.querySelector('[name=workout-reps]')).value;
    const weight = (this.querySelector('[name=workout-weight]')).value;
    testDate(date);
    const individualWorkout = {
        date,
        exercise,
        sets,
        reps,
        weight
    };

    workouts.push(individualWorkout);
    populateTable(workouts, workoutTableBody);
    displayPersonalRecords(workouts, lifts);
    localStorage.setItem('workouts', JSON.stringify(workouts));
    this.reset();
    //console.log(testDate(workoutDate));
    //console.log("WOOW!");
}

function populateTable(loggedWorkouts = [], workoutsList) {
    const recentWorkouts = loggedWorkouts.slice(-6);
    workoutsList.innerHTML = recentWorkouts.map((workout, i) => {
        return `
            <tr id="row${i}">
                <td>${workout.date}</td>
                <td>${workout.exercise}</td>
                <td>${workout.sets}</td>
                <td>${workout.reps}</td>
                <td>${workout.weight} lbs</td>
            </tr>`;
    }).join('');
}

function calculatePersonalRecords(loggedWorkouts = []) {
    const prs = {}; // object to hold personal records

    loggedWorkouts.forEach(workout => {
        const {exercise, weight, reps } = workout;
        console.log(exercise, weight, reps);
        const oneRM = weight * (1 + (reps * 0.0333));
        console.log(oneRM);

        if (!prs[exercise] || oneRM > prs[exercise].oneRM) {
            prs[exercise] = { ...workout, oneRM};
        }
    });

    return prs;
}

function displayPersonalRecords(loggedWorkouts = [], workoutsList) {
    const prs = calculatePersonalRecords(loggedWorkouts);
    workoutsList.innerHTML = Object.values(prs).map((pr) => {
        return `<li>${pr.exercise}: <span>${pr.oneRM.toFixed(1)} lbs</span></li>`;
    }).join('');
}



workoutForm.addEventListener('submit', addWorkout);

populateTable(workouts, workoutTableBody);