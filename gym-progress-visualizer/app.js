const re = /^(?:\d{2})([/])\d{2}\1\d{4}$/;

function testInfo(dateInput) {
    const ok = re.exec(dateInput.value);

    const result = ok
        ? console.log(`Yay the date is correct, your date is ${ok[0]}`)
        : console.log(`${dateInput.value} isn't a valid date, please enter in MM/DD/YYYY form`);
}

let listOfWorkouts = [
    {
        date: "06/02/2025",
        exercise: "Bench Press",
        sets: 3,
        reps: 5,
        weight: 200 + " lbs"
    }
];

const workoutForm = document.querySelector('.workout-form');
const workoutDate = document.querySelector('#workout-date');
const workouts = JSON.parse(localStorage.getItem('workouts')) || [];




function addWorkout(e) {
    e.preventDefault();
    const date = (this.querySelector('[name=workout-date]')).value;
    const exercise = (this.querySelector('[name=exercise]')).value;
    const sets = (this.querySelector('[name=workout-sets]')).value;
    const reps = (this.querySelector('[name=workout-reps]')).value;
    const weight = (this.querySelector('[name=workout-weight]')).value;
    const individualWorkout = {
        date,
        exercise,
        sets,
        reps,
        weight
    };

    workouts.push()
    //console.log(testInfo(workoutDate));
    //console.log("WOOW!");
}

function populateTable(loggedWorkouts = [], workoutsList) {

}



workoutForm.addEventListener('submit', addWorkout);