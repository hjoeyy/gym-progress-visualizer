# gym-progress-visualizer
An app that tracks your progress in the gym and determines if you are losing or gaining strength in the 4 main lifts: Bench Press, Squat, Deadlift, Overhead Press

There are a number of statistics cards on this application:

-Workouts logged
  -Displays total workouts logged on the application

-All-Time PRs
   -Displays your personal records in each lift based off of Epley's 1RM formula for each lift, using the workouts you log into the application

-This week's volume
  -The total volume for the most recent week of lifting, this helps track your hypertrophy progress overtime and determines if you are gaining strength or not. This will only display the week

-Add workout

  -This is where you will be able to log each individual workout, you are able to do this by entering:
  
     -The date you performed the workout (can't be in the future obviously) and the date is strict to be in MM/DD/YYYY form with a regular expression, so you can't do M/DD/YYYY or M/DD/YY or MM/DD/YY etc.
     -The exercise you performed out of the 4 options: Bench Press, Squat, Deadlift, Overhead Press
     -The number of sets you performed in the workout
     -The number of reps you performed in the workout
     -The weight you lifted during the workout
     -The RIR (Reps in Reserve) you had, the RIR is determined by how hard the set is pushed, if you could have done 2 more reps but stopped the set, this would be RIR 2

-Delete workout
  -All workouts have a number assigned to them and the workouts are in reverse order by date to display the most recent 6. Here you are able to input the number corresponding to the workout and can delete it using the workout number

-Records
  -A graph that shows the progress for each lift based off of PR, this will display the progress over the last most recent couple months and tracks the PR for each workout logged then displays it as a line graph. The purpose behind this is for the user to see their progress in their lifts overtime to determine if they are gaining or losing strength which will help them re-assess their goals

-Most recent workouts
  -A table showing logs of the most recent 6 workouts and all of their data including workout #, date, exercise, sets, reps, weight, and RIR

-Progress summary
  -A card showing 3 things:
     -Most improved lift: This is the lift that the user made the most progress on in terms of strength as it is measured by PR, it will show them the exercise name and the percentage increase and/or decrease of their progress in it
     -Best week streak: This will display the users weekly streak which is measured on the fact that they completed at least one workout every week, the moment there isn't any workouts in a week then the streak resets.
     -Monthly progress: This will calculate the overall monthly strength progress made by the user in ALL lifts, this will help them determine their overall strength gains every month

-Option for dark mode at top
  -There is a button you can toggle to turn on dark mode, click it again revert to light mode. This is based on user preference.

-Social Media links
  -There are social media links such as my github, linkedin, and twitter if you want to stop by!
