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
const mostImprovedExercise = document.querySelector('.most-improved-exercise');
const bestWeekStreak = document.querySelector('.best-week-streak');

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
    displayMostImprovedLift(workouts, mostImprovedExercise);
    displayWeekStreak(workouts, bestWeekStreak);
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

function getStartOfLastMonth(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (28 * 2) + 1); // Go back to beginning of last 4 weeks
    return d;
}

function getEndOfLastMonth(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    d.setDate(d.getDate() - 28); // Go back to end of last 4 weeks
    return d;
}

function getStartOfCurrentMonth(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (d.getDate() - 1)); // Go back to beginning of month
    return d;
}

function getEndOfCurrentMonth(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    d.setDate(d.getDate() + (28 - d.getDate())); // Go to end of 4 weeks (specifically 4 weeks)
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

function calculateMostImprovedLift(loggedWorkouts = []) {
    const volumePerExerciseLastMonth = {};
    const volumePerExerciseCurrentMonth = {};
    const percentageIncreases = {};
    const currentDate = new Date();
    const lastMonthStart = getStartOfLastMonth(currentDate);
    const lastMonthEnd = getEndOfLastMonth(currentDate);
    const currentMonthStart = getStartOfCurrentMonth(currentDate);
    const currentMonthEnd = getEndOfCurrentMonth(currentDate);
    let percentageIncrease;

    loggedWorkouts.forEach(workout => {
        const { exercise, sets, reps, weight, date } = workout;
        const workoutDate = parseWorkoutDate(date);
        console.log(exercise, sets, reps, weight, date);

        if (workoutDate >= lastMonthStart && workoutDate <= lastMonthEnd) {
            const lastMonthTotalVolume = sets * reps * weight;
            console.log(lastMonthTotalVolume);

            if (!volumePerExerciseLastMonth[exercise]) {
                volumePerExerciseLastMonth[exercise] = { exercise, lastMonthTotalVolume: 0};
            }
            volumePerExerciseLastMonth[exercise].lastMonthTotalVolume += lastMonthTotalVolume;
        }

        if(workoutDate >= currentMonthStart && workoutDate <= currentMonthEnd) {
            const currentMonthTotalVolume = sets * reps * weight;
            console.log(currentMonthTotalVolume);

            if (!volumePerExerciseCurrentMonth[exercise]) {
                volumePerExerciseCurrentMonth[exercise] = { exercise, currentMonthTotalVolume: 0};
            }
            volumePerExerciseCurrentMonth[exercise].currentMonthTotalVolume += currentMonthTotalVolume;
        }
    });

    Object.keys(volumePerExerciseCurrentMonth).forEach(exercise => {
        const currentMonthVolume = volumePerExerciseCurrentMonth[exercise].currentMonthTotalVolume;
        const lastMonthVolume = volumePerExerciseLastMonth[exercise].lastMonthTotalVolume;

        if (lastMonthVolume > 0) {
            const percentageIncrease = ((currentMonthVolume - lastMonthVolume) / lastMonthVolume) * 100;
            percentageIncreases[exercise] = {
                exercise,
                percentageIncrease
            };
        }
    });

    let mostImprovedExercise = null;
    let highestPercentage = -Infinity;


    Object.values(percentageIncreases).forEach(exercise => {
        if(exercise.percentageIncrease > highestPercentage) {
            highestPercentage = exercise.percentageIncrease;
            mostImprovedExercise = exercise;
        }
    });
    
    return mostImprovedExercise;
}

function displayMostImprovedLift(loggedWorkouts = [], workoutsList) {
    const mostImprovedLift = calculateMostImprovedLift(loggedWorkouts);
    workoutsList.innerHTML = `<p>Most Improved Lift: <br><br><span>${mostImprovedLift.exercise} (+${mostImprovedLift.percentageIncrease.toFixed(1)}%)</span></p>`;
}

function calculateWeekStreak(loggedWorkouts = []) {

    // const allWorkoutDates = parseWorkoutDate(loggedWorkouts.date);
    // loggedWorkouts.sort(allWorkoutDates.getTime());
    // const datesArray = loggedWorkouts.map(workout => workout.date);
    // datesArray.sort();
    const currentDate = new Date();
    const weekStart = getStartOfWeek(currentDate);
    const weekEnd = getEndOfWeek(currentDate);
    const weeklyGroups = {};
    
    
    const sortedWorkoutsByDate = loggedWorkouts.sort((a, b) => parseWorkoutDate(a.date) - parseWorkoutDate(b.date)); // sorts all workouts by date
    const earliestDate = sortedWorkoutsByDate[0].date;

    //const groupWorkoutsByWeek = sortedWorkoutsByDate.map(workout => getStartOfWeek(parseWorkoutDate(workout.date).toISOString()));
    sortedWorkoutsByDate.forEach(workout => {
        const { exercise, sets, reps, weight, date } = workout;
        const workoutDate = parseWorkoutDate(date);
        const weekKey = getStartOfWeek(workoutDate).toISOString().split('T')[0]; // identifier to group elements by week

        // console.log('Checking workout date:', workoutDate, 'for exercise:', exercise, 'day of week: ', workoutDate.getDay());
        if (!weeklyGroups[weekKey]) {
            weeklyGroups[weekKey] = [];
        }
        weeklyGroups[weekKey].push(workout);
    });

    let weekStreak = 0;
    const earliestWeek = getStartOfWeek(earliestDate);
    const latestWeek = getStartOfWeek(currentDate);
    latestWeek.setDate(latestWeek.getDate() - 7); // go back one week to check the previous week to keep current week streak
    let current = new Date(earliestWeek);

    while (current <= latestWeek) {
        let weekKey = current.toISOString().split('T')[0];
        if(weeklyGroups[weekKey] && weeklyGroups[weekKey].length > 0) { // check if there is at least one workout in each week
            weekStreak++;
        }
        else {
            weekStreak = 0; // the moment there isn't reset the streak
        }
        console.log(weekStreak);
        current.setDate(current.getDate() + 7);
    }
    //console.log(weeklyGroups);
    return weekStreak;
}

function displayWeekStreak(loggedWorkouts = [], workoutsList) {
    const currentWeekStreak = calculateWeekStreak(loggedWorkouts);
    workoutsList.innerHTML = `<p>Best Week Streak: <br><br><span>${currentWeekStreak}</span></p>`;
}


workoutForm.addEventListener('submit', addWorkout);

populateTable(workouts, workoutTableBody);
displayPersonalRecords(workouts, lifts);
displayWeeklyVolumePerExercise(workouts, liftsTwo);
displayTotalWorkouts(workouts, totalWorkoutsLogged);
displayMostImprovedLift(workouts, mostImprovedExercise);
displayWeekStreak(workouts, bestWeekStreak);