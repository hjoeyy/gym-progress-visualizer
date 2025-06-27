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
const liftsTwo = document.querySelector('.lifts-two');
const totalWorkoutsLogged = document.querySelector('.total-workouts');

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
    const sets = Number((this.querySelector('[name=workout-sets]')).value);
    const reps = Number((this.querySelector('[name=workout-reps]')).value);
    const weight = Number((this.querySelector('[name=workout-weight]')).value);
    const RIR = Number((this.querySelector('[name=workout-rir]')).value);
    testDate(date);
    const individualWorkout = {
        date,
        exercise,
        sets,
        reps,
        weight,
        RIR
    };

    workouts.push(individualWorkout);
    populateTable(workouts, workoutTableBody);
    displayPersonalRecords(workouts, lifts);
    displayWeeklyVolumePerExercise(workouts, liftsTwo);
    displayTotalWorkouts(workouts, totalWorkoutsLogged);
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
                <td>${workout.RIR}</td>
            </tr>`;
    }).join('');
}

function countWorkouts(loggedWorkouts = []) {
    let totalNumWorkouts = 0;

    loggedWorkouts.forEach(workout => {
        totalNumWorkouts++;
    });

    return totalNumWorkouts;
}

function displayTotalWorkouts(loggedWorkouts = [], workoutsList) {
    const totalWorkouts = countWorkouts(loggedWorkouts);
    workoutsList.innerHTML =  `
    <h3>Workouts Logged</h3>
    <p>🏋️ ${totalWorkouts}</p>
    `;
}

function calculatePersonalRecords(loggedWorkouts = []) {
    const prs = {}; // object to hold personal records

    loggedWorkouts.forEach(workout => {
        const {exercise, weight, reps, RIR } = workout;
        //console.log(exercise, weight, reps, RIR);
        const oneRM = (reps == 1 && RIR == 0) ? weight : weight * (1 + ((reps + RIR) * 0.0333));
        //console.log(oneRM);

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

function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 (Sun) - 6 (Sat)
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - day); // Go back to Sunday
    return d;
}

function getEndOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setHours(23, 59, 59, 999);
    d.setDate(d.getDate() + (6 - day)); // Go forward to Saturday
    return d;
}

function parseWorkoutDate(dateStr) {
    const [month, day, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
}

function calculateWeeklyVolumePerExercise(loggedWorkouts = []) {
    const volumePerExercise = {}; // object to hold the total weekly volume for each exercise
    const currentDate = new Date();
    const weekStart = getStartOfWeek(currentDate);
    const weekEnd = getEndOfWeek(currentDate);

    loggedWorkouts.forEach(workout => {
        const { exercise, sets, reps, weight, date} = workout;
        const workoutDate = parseWorkoutDate(date);

        if (workoutDate >= weekStart && workoutDate <= weekEnd) {
            const totalVolume = sets * reps * weight;

            if (!volumePerExercise[exercise]) {
                volumePerExercise[exercise] = { exercise, totalVolume: 0};
            }
            volumePerExercise[exercise].totalVolume += totalVolume;
        }
    });

    return volumePerExercise;
}

function displayWeeklyVolumePerExercise(loggedWorkouts = [], workoutsList) {
    const volumePerExercise = calculateWeeklyVolumePerExercise(loggedWorkouts);
    workoutsList.innerHTML = Object.values(volumePerExercise).map(volume => {
        return `<li>${volume.exercise}: <span>${volume.totalVolume.toFixed(1)} lbs</span></li>`;
    }).join();
}



workoutForm.addEventListener('submit', addWorkout);

populateTable(workouts, workoutTableBody);
displayPersonalRecords(workouts, lifts);
displayWeeklyVolumePerExercise(workouts, liftsTwo);
displayTotalWorkouts(workouts, totalWorkoutsLogged);