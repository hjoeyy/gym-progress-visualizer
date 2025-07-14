const re = /^(?:\d{2})([/])\d{2}\1\d{4}$/;
let myChart = null;

function testDate(dateInput) {
    console.log("date received: ", dateInput);
    const ok = re.exec(dateInput);
    console.log("Regex result: ", ok);

    if(!ok) {
        displayError("Invalid Date Format! Please use MM/DD/YYYY");

        throw new Error("Invalid Date Format! Please use MM/DD/YYYY");
    }
    const currentDate = new Date();
    const parseDate = parseWorkoutDate(dateInput);

    if(parseDate > currentDate) {
        displayError("Hey! You can't go into the future! Please enter a past or the current date");
        throw new Error("Hey! You can't go into the future! Please enter a past or the current date");
    }
}

const elements = {
 addWorkoutForm: document.querySelector('.workout-form'),
 workoutDate: document.querySelector('#workout-date'),
 workoutTableBody: document.querySelector('.individual-workouts'),
 workouts: JSON.parse(localStorage.getItem('workouts')) || [],
 errorMessage: document.querySelector('.error-message'),
 deleteErrorMessage: document.querySelector('.delete-error-message'),
 lifts: document.querySelector('.lifts'),
 liftsTwo: document.querySelector('.lifts-two'),
 totalWorkoutsLogged: document.querySelector('.total-workouts'),
 mostImprovedExercise: document.querySelector('.most-improved-exercise'),
 bestWeekStreak: document.querySelector('.best-week-streak'),
 totalProgressIncrease: document.querySelector('.total-progress-increase'),
 deleteWorkoutForm: document.querySelector('.delete-workout-form'),
 record: document.querySelector('.record')
};

for (const [name, element] of Object.entries(elements)) {
    if(!element) {
        console.warn(`${name} not found in the DOM`);
    }
}

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    const modeFooter = document.querySelector('.footer-container');
    if (modeFooter) modeFooter.classList.add('dark-mode-footer');
    document.querySelectorAll('.statistics-card').forEach(card => card.classList.add('dark-mode-statistics'));
}

function displayError(message) {
    elements.errorMessage.textContent = message;
    setTimeout(() => {
        elements.errorMessage.textContent = '';
    }, 5000);
}

function deleteDisplayError(message) {
    elements.deleteErrorMessage.textContent = message;
    setTimeout(() => {
        elements.deleteErrorMessage.textContent = '';
    }, 5000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toggleMode() {
    const mode = document.body;
    const modeFooter = document.querySelector('.footer-container');
    const statCards = document.querySelectorAll('.statistics-card');
    const isDark = mode.classList.contains('dark-mode');
    
    mode.classList.toggle('dark-mode');
    modeFooter.classList.toggle('dark-mode-footer');
    statCards.forEach(card => card.classList.toggle('dark-mode-statistics'));

    localStorage.setItem('darkMode', isDark ? 'disabled' : 'enabled');
}

function addWorkout(e) {
    e.preventDefault();
    const number = elements.workouts.length + 1;
    const date = (this.querySelector('[name=workout-date]')).value;
    const exerciseSelect = this.querySelector('[name=exercise]');
    const exercise = exerciseSelect.options[exerciseSelect.selectedIndex].text;
    const sets = Number((this.querySelector('[name=workout-sets]')).value);
    const reps = Number((this.querySelector('[name=workout-reps]')).value);
    const weight = Number((this.querySelector('[name=workout-weight]')).value);
    const RIR = Number((this.querySelector('[name=workout-rir]')).value);
    testDate(date);
    const individualWorkout = {
        number,
        date,
        exercise,
        sets,
        reps,
        weight,
        RIR
    };

    elements.workouts.push(individualWorkout);
    elements.workouts.sort((a, b) => parseWorkoutDate(b.date) - parseWorkoutDate(a.date));
    reassignWorkoutNumbers(elements.workouts);
    populateTable(elements.workouts, elements.workoutTableBody);
    displayPersonalRecords(elements.workouts, elements.lifts);
    displayWeeklyVolumePerExercise(elements.workouts, elements.liftsTwo);
    displayTotalWorkouts(elements.workouts, elements.totalWorkoutsLogged);
    displayMostImprovedLift(elements.workouts, elements.mostImprovedExercise);
    displayWeekStreak(elements.workouts, elements.bestWeekStreak);
    displayTotalProgressIncrease(elements.workouts, elements.totalProgressIncrease);
    displayAllRecords(elements.workouts, elements.record);
    renderChart();
    localStorage.setItem('workouts', JSON.stringify(elements.workouts));
    this.reset();
}

function deleteWorkout(e) {
    e.preventDefault();
    const workoutNumberInput = this.querySelector('[name=workout-number]');
    const workoutNumber = Number(workoutNumberInput.value);

    if (
        isNaN(workoutNumber) ||
        workoutNumber < 1 ||
        workoutNumber > elements.workouts.length
    ) {
        deleteDisplayError("Invalid workout number!");
        return;
    }

    elements.workouts.splice(workoutNumber - 1, 1); // because we put the number ahead by 1, index is behind by 1 due to that
    elements.workouts.sort((a, b) => parseWorkoutDate(b.date) - parseWorkoutDate(a.date));
    reassignWorkoutNumbers(elements.workouts);
    populateTable(elements.workouts, elements.workoutTableBody);
    displayPersonalRecords(elements.workouts, elements.lifts);
    displayWeeklyVolumePerExercise(elements.workouts, elements.liftsTwo);
    displayTotalWorkouts(elements.workouts, elements.totalWorkoutsLogged);
    displayMostImprovedLift(elements.workouts, elements.mostImprovedExercise);
    displayWeekStreak(elements.workouts, elements.bestWeekStreak);
    displayTotalProgressIncrease(elements.workouts, elements.totalProgressIncrease);
    displayAllRecords(elements.workouts, elements.record);
    renderChart();
    localStorage.setItem('workouts', JSON.stringify(elements.workouts));
    this.reset();
}

function reassignWorkoutNumbers(loggedWorkouts = []) {
    // Assign highest number to the most recent (first in array)
    for (let i = 0; i < loggedWorkouts.length; i++) {
        loggedWorkouts[i].number = loggedWorkouts.length - i;
    }
}

function populateTable(loggedWorkouts = [], workoutsList) {
    const recentWorkouts = loggedWorkouts.slice(0, 6); // first 6, most recent
    workoutsList.innerHTML = recentWorkouts.map((workout, i) => {
        return `
            <tr id="row${i}">
                <td>${escapeHtml(workout.number)}</td>
                <td>${escapeHtml(workout.date)}</td>
                <td>${escapeHtml(workout.exercise)}</td>
                <td>${escapeHtml(workout.sets)}</td>
                <td>${escapeHtml(workout.reps)}</td>
                <td>${escapeHtml(workout.weight)} lbs</td>
                <td>${escapeHtml(workout.RIR)}</td>
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

function calculateLowestPersonalRecords(loggedWorkouts = []) {
    const prs = {}; // object to hold personal records

    loggedWorkouts.forEach(workout => {
        const {exercise, weight, reps, RIR } = workout;
        //console.log(exercise, weight, reps, RIR);
        const oneRM = (reps == 1 && RIR == 0) ? weight : weight * (1 + ((reps + RIR) * 0.0333));
        //console.log(oneRM);

        if (!prs[exercise] || oneRM < prs[exercise].oneRM) {
            prs[exercise] = { ...workout, oneRM};
        }
    });

    return prs;
}

function displayPersonalRecords(loggedWorkouts = [], workoutsList) {
    const prs = calculatePersonalRecords(loggedWorkouts);
    if(Object.keys(prs).length === 0) {
        workoutsList.innerHTML = `<p>No data yet</p>`;
        return;
    }
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
    d.setDate(d.getDate() - 27); // Go back to beginning of most recent 4 weeks
    return d;
}

function getEndOfCurrentMonth(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    // today
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
    if (Object.keys(volumePerExercise).length === 0) {
        workoutsList.innerHTML = `<li>No data yet</li>`;
        return;
    }
    workoutsList.innerHTML = Object.values(volumePerExercise).map(volume => {
        return `<li>${volume.exercise}: <span>${volume.totalVolume.toFixed(1)} lbs</span></li>`;
    }).join('');
}

function calculateMostImprovedLift(loggedWorkouts = []) {
    const lastMonthWorkouts = [];
    const thisMonthWorkouts = [];
    const currentDate = new Date();
    const lastMonthStart = getStartOfLastMonth(currentDate);
    const lastMonthEnd = getEndOfLastMonth(currentDate);
    const currentMonthStart = getStartOfCurrentMonth(currentDate);
    const currentMonthEnd = getEndOfCurrentMonth(currentDate);

    loggedWorkouts.forEach(workout => {
        const { date } = workout;
        const workoutDate = parseWorkoutDate(date);

        if (workoutDate >= lastMonthStart && workoutDate <= lastMonthEnd) {
            lastMonthWorkouts.push(workout);
        }

        if(workoutDate >= currentMonthStart && workoutDate <= currentMonthEnd) {
            thisMonthWorkouts.push(workout);
        }
    });
    const lastMonthPRs = calculatePersonalRecords(lastMonthWorkouts);
    const thisMonthPRs = calculatePersonalRecords(thisMonthWorkouts);
    let percentageDifferences = [];

    Object.keys(lastMonthPRs).forEach(exercise => {
        if (thisMonthPRs[exercise]) {
            const currentMPR = thisMonthPRs[exercise].oneRM;
            const lastMPR = lastMonthPRs[exercise].oneRM;

            if (lastMPR > 0) {
                const difference = Number((((currentMPR - lastMPR) / lastMPR) * 100).toFixed(2));
                percentageDifferences.push({
                    exercise: exercise,
                    percent: difference
                });
            }
        }
    });

    let avg = null;
    let highestPercent = -Infinity;
    let mostImproved = null;

    for(let i = 0; i < percentageDifferences.length; i++) {
        if (percentageDifferences[i].percent > highestPercent) {
            mostImproved = percentageDifferences[i];
            highestPercent = percentageDifferences[i].percent;
        }
    }
    return mostImproved;
}

function displayMostImprovedLift(loggedWorkouts = [], workoutsList) {
    const mostImprovedLift = calculateMostImprovedLift(loggedWorkouts);
    if(!mostImprovedLift) {
        workoutsList.innerHTML = `<p>Most Improved Lift (Monthly): <br><br><span>No Data yet</span></p>`;
        return;
    }
    workoutsList.innerHTML = `<p>Most Improved Lift: <br><br><span>${mostImprovedLift.exercise} (${mostImprovedLift.percent > 0 ? '+' + mostImprovedLift.percent.toFixed(1) : mostImprovedLift.percent.toFixed(1)}%)</span></p>`;
}

function calculateWeekStreak(loggedWorkouts = []) {

    if (!loggedWorkouts.length) return 0;
    const currentDate = new Date();
    const weeklyGroups = {};
    
    
    const sortedWorkoutsByDate = loggedWorkouts.sort((a, b) => parseWorkoutDate(a.date) - parseWorkoutDate(b.date)); // sorts all workouts by date
    const earliestDate = sortedWorkoutsByDate[0].date;

    sortedWorkoutsByDate.forEach(workout => {
        const { date } = workout;
        const workoutDate = parseWorkoutDate(date);
        const weekKey = getStartOfWeek(workoutDate).toISOString().split('T')[0]; // identifier to group elements by week

        if (!weeklyGroups[weekKey]) {
            weeklyGroups[weekKey] = [];
        }
        weeklyGroups[weekKey].push(workout);
    });

    // **DEBUG: Print all week start dates with at least one workout**
    console.log("Weeks with workouts:", Object.keys(weeklyGroups).sort());

    let weekStreak = 0;
    const earliestWeek = getStartOfWeek(earliestDate);
    let current = new Date(earliestWeek);
    const currentWeekKey = getStartOfWeek(currentDate).toISOString().split('T')[0];
    const isWorkoutThisWeek = weeklyGroups[currentWeekKey] && weeklyGroups[currentWeekKey].length > 0;
    let latestWeek;
    if (isWorkoutThisWeek) { // we want to add to the streak if there is a workout logged this week with preserving the streak until the end of the week if no log
        latestWeek = getStartOfWeek(currentDate);
    } else {
        latestWeek = getStartOfWeek(currentDate);
        latestWeek = latestWeek.setDate(latestWeek.getDate() - 7);
    }
    while (current <= latestWeek) {
        let weekKey = current.toISOString().split('T')[0];
        if(weeklyGroups[weekKey] && weeklyGroups[weekKey].length > 0) { // check if there is at least one workout in each week
            weekStreak++;
        }
        else {
            weekStreak = 0; // the moment there isn't reset the streak
        }
        current.setDate(current.getDate() + 7);
    }
    return weekStreak;
}

function displayWeekStreak(loggedWorkouts = [], workoutsList) {
    const currentWeekStreak = calculateWeekStreak(loggedWorkouts);
    workoutsList.innerHTML = `<p>Best Week Streak: <br><br><span>${currentWeekStreak || 0}</span></p>`;
}

function calculateTotalProgressIncrease(loggedWorkouts = []) {
    let lastMonthWorkouts = [];
    let currentMonthWorkouts = [];
    let percentageIncrease = -Infinity;
    const currentDate = new Date();
    const lastMonthStart = getStartOfLastMonth(currentDate);
    const lastMonthEnd = getEndOfLastMonth(currentDate);
    const currentMonthStart = getStartOfCurrentMonth(currentDate);
    const currentMonthEnd = getEndOfCurrentMonth(currentDate);

    loggedWorkouts.forEach(workout => {
        const { date } = workout;
        const workoutDate = parseWorkoutDate(date);
        if (workoutDate >= lastMonthStart && workoutDate <= lastMonthEnd) {
            lastMonthWorkouts.push(workout);
        }
        if (workoutDate >= currentMonthStart && workoutDate <= currentMonthEnd) {
            currentMonthWorkouts.push(workout);
        }
    });

    const lastMonthBiggestPR = calculatePersonalRecords(lastMonthWorkouts);
    const currentMonthBiggestPR = calculatePersonalRecords(currentMonthWorkouts);
    
    let percentageDifferences = [];

    Object.keys(lastMonthBiggestPR).forEach(workout => {
        if(currentMonthBiggestPR[workout]) {
            const lastMPR = lastMonthBiggestPR[workout].oneRM;
            const currentMPR = currentMonthBiggestPR[workout].oneRM;
            if(lastMPR > 0) {
                const difference = Number((((currentMPR - lastMPR) / lastMPR) * 100).toFixed(2));
                percentageDifferences.push(difference);
            }
        }
    });
    let avg = null;
    if (percentageDifferences.length > 0) {
        const sum = percentageDifferences.reduce((a, b) => a + b, 0);
        avg = sum / percentageDifferences.length;
    }
    return avg;
}

function displayTotalProgressIncrease(loggedWorkouts = [], workoutsList) {
    const progressIncrease = calculateTotalProgressIncrease(loggedWorkouts);
    if(!progressIncrease === undefined || progressIncrease === null || isNaN(progressIncrease) || progressIncrease === Infinity || progressIncrease  === -Infinity) {
        workoutsList.innerHTML = `<p>Monthly Progress: <br><br> <span>No Data yet</span></p>`;
        return;
    }
    workoutsList.innerHTML = `<p>Monthly Progress: <br><br> <span>${progressIncrease > 0 ? '+' + progressIncrease.toFixed(2) : progressIncrease.toFixed(2)}%</span></p>`;
} 

function storeWorkoutsByGroup(loggedWorkouts = []) {
    const exerciseByGroup = Object.groupBy(loggedWorkouts, ({ exercise }) => exercise); // group the workouts by their exercise  
    return exerciseByGroup;
}
function calculatePRForRecordLift(loggedWorkouts = []) {
    const theRecordLift = calculateMostImprovedLift(loggedWorkouts);
    if (!theRecordLift) {
        return [];
    }
    const recordLiftLogs = [];
    loggedWorkouts.forEach(workout => {
        const { exercise } = workout;
        if (exercise === theRecordLift.exercise) {
            recordLiftLogs.push(workout);
        }
    });
    return recordLiftLogs;
}

function calculateHighestPRForAllLifts(loggedWorkouts = []) {
    return calculatePersonalRecords(loggedWorkouts);
}

function displayRecords(loggedWorkouts = [], workoutsList) {
    const theRecordWorkout = calculateHighestPRForRecordLift(loggedWorkouts);
    if (!theRecordWorkout || Object.keys(theRecordWorkout).length === 0) {
        workoutsList.innerHTML = `<p>Record Lift: <br><br><span>No Data yet</span></p>`;
        return;
    }
    
    // Get the most improved exercise name
    const mostImprovedLift = calculateMostImprovedLift(loggedWorkouts);
    if (!mostImprovedLift) {
        workoutsList.innerHTML = `<p>Record Lift: <br><br><span>No Data yet</span></p>`;
        return;
    }
    
    // Get the record for that specific exercise
    const recordForExercise = theRecordWorkout[mostImprovedLift.exercise];
    if (!recordForExercise) {
        workoutsList.innerHTML = `<p>Record Lift: <br><br><span>No Data yet</span></p>`;
        return;
    }
    
    workoutsList.innerHTML = `<p>${recordForExercise.exercise}: 
    <span>${recordForExercise.weight} lbs x ${recordForExercise.reps} reps 
    (${recordForExercise.date}) with ${recordForExercise.RIR} RIR</span></p>`;
}

function displayAllRecords(loggedWorkouts = [], workoutsList) {
    const allPRs = calculateHighestPRForAllLifts(loggedWorkouts);
    if(!allPRs || Object.keys(allPRs).length === 0) {
        workoutsList.innerHTML = `<p>Record Lifts: <br><br><span>No Data yet</span></p>`;
    }

    workoutsList.innerHTML = Object.values(allPRs).map(record => {
        return `<p><b>${record.exercise}: </b> <span>${record.weight} lbs x ${record.reps} reps
        (${record.date}) with ${record.RIR} RIR</span></p>`
    }).join('');
}


function calculatePRPerExercise(loggedWorkouts = []) {
    const prs = [];
    const groupedWorkouts = storeWorkoutsByGroup(loggedWorkouts);
    const prLogs = {};
    Object.entries(groupedWorkouts).forEach(([exercise, array]) => {
        prLogs[exercise] = array.map(workout => {
            const { weight, reps, RIR, date } = workout;
            const oneRM = (reps == 1 && RIR == 0) ? weight : weight * (1 + ((reps + RIR) * 0.0333));
            return { date, oneRM };
        });
    });
    return prLogs;
}

function calculatePRPerExerciseForRecordLift(loggedWorkouts = []) {
    const prs = []; // array to hold multiple PR objects
    const bestWorkoutPRs = calculatePRForRecordLift(loggedWorkouts);

    bestWorkoutPRs.forEach(workout => {
        const { weight, reps, RIR, date } = workout;
        const oneRM = (reps == 1 && RIR == 0) ? weight : weight * (1 + ((reps + RIR) * 0.0333));
        
        // Create a new object for each PR and add it to the array
        prs.push({
            weight: oneRM,
            date: date
        });
    });
    return prs;
}

function getWeekRange(dateStr) {
    const date = parseWorkoutDate(dateStr);
    const start = getStartOfWeek(date);
    const end = getEndOfWeek(date);
    return { start, end };
}

// chart



function renderChart() {
    try {
        if (!elements.workouts.length) return; // dont run chart code at all if no workouts
   
        const ctx = document.getElementById('myChart');
        ctx.height = 350;
    
        const currentDate = new Date();
        let earliestDate, earliestWeek;
    
        earliestDate = elements.workouts[0].date;
        earliestWeek = getStartOfWeek(earliestDate);
    
        const prData = calculatePRPerExerciseForRecordLift(elements.workouts);
        const prLogs = calculatePRPerExercise(elements.workouts);
    
        const colors = [
            "#2963a3", // blue
            "#e67e22", // orange
            "#27ae60", // green
            "#8e44ad"  // purple
            ];
    
        const datasets = Object.entries(prLogs).map(([exercise, prArray], idx) => ({
            label: exercise,
            data: prArray.map(pr => ({
                x: new Date(pr.date),
                y: pr.oneRM
            })),
            backgroundColor: colors[idx % colors.length],
            borderColor: colors[idx % colors.length],
            showLine: true,
            pointRadius: 5,
            borderWidth: 1
        }));
        console.log("Datasets: ", datasets);
        // Calculate min/max from all workouts, not just PRs
        const allWorkoutDates = elements.workouts.map(w => parseWorkoutDate(w.date));
        const minDate = new Date(Math.min(...allWorkoutDates));
        const maxDate = new Date(Math.max(...allWorkoutDates));
        const prWeights = prData.map(pr => pr.weight);
        const minPR = Math.min(...prWeights);
        const maxPR = Math.max(...prWeights);
    
        if(myChart) {
            myChart.destroy();
        }
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                scales: {
                x: {
                    type: 'time',
                    time: {
                    unit: 'week',
                    tooltipFormat: 'MM/dd/yyyy',
                    displayFormats: {
                        week: 'MM/dd'
                    }
                    },
                    min: minDate,
                    max: maxDate,
                    title: {
                    display: true,
                    text: 'Date'
                    }
                },
                y: {
                    beginAtZero: false,
                    min: Math.floor(minPR / 100) * 100 - 100,
                    max: Math.ceil(maxPR / 100) * 100 + 100,
                    title: {
                    display: true,
                    text: 'PR Weight'
                    },
                    ticks: {
                        stepSize: 100
                    }
                }
                }
            }
        });      
    } catch (error) {
        console.error('Chart failed to render', error);
    }
}


if (elements.addWorkoutForm) {
    elements.addWorkoutForm.addEventListener('submit', addWorkout);
}

if (elements.deleteWorkoutForm) {
    elements.deleteWorkoutForm.addEventListener('submit', deleteWorkout);
}


populateTable(elements.workouts, elements.workoutTableBody);
displayPersonalRecords(elements.workouts, elements.lifts);
displayWeeklyVolumePerExercise(elements.workouts, elements.liftsTwo);
displayTotalWorkouts(elements.workouts, elements.totalWorkoutsLogged);
displayMostImprovedLift(elements.workouts, elements.mostImprovedExercise);
displayWeekStreak(elements.workouts, elements.bestWeekStreak);
displayTotalProgressIncrease(elements.workouts, elements.totalProgressIncrease);
displayAllRecords(elements.workouts, elements.record);
renderChart();




