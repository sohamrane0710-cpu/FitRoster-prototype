# Features Of FitRoster
>FITNESS, PROGRESS and NUTRITION. 
>
1. Coach and athlete connect together. 
2.  Coach sets and workout the exercise the reps sets everything and athlete sees them does and logs them the logging system is like strava the heart rate calories burned etc  and the visual photo of what was worked is also shown .
3.  The coach can set a nutrition goal like the athlete has to complete this much protein ,carbs,fibre,fats etc in the day and athlete can add the same macro after his meals so coach can see his progress .
4. When the athlete doesn't know the exercise the coach can tag a video from the collection in the app or upload his own video shown how the exercise is done and athlete can watch that and follow it .
5. Athlete can add runs he has logged on like strava or Adidas running club etc and coach can see that and plan recovery ,exercise etc according to that .
6. we can find and connect to online athletes. 
7. Specialised trainers for specific programs 
8. Challenges which users can join to. 
9. we call the groups as "Rosters"


# The app 
1.  The app has two option; log in as a coach or log in as athlete like google classroom .
2.  The app in divided into three section the workout ,nutrition and the progress,
	1. In coach side workout has option like add a exercise,add sets ,reps etc and make a preset use an old preset use app made preset already present .In athlete side we can see the workout or the exercise we have to do the amount of sets and reps and can log the workout in set by set when done the set .
	2. In coach side we can see being able to add nutrition add the daily macro goals .In athlete side we can log the macro and meal name or number .
	3. in progress both see the same page when the can see the workout completion and macro progress bar or pie chart .
3. Basic instruction like keep the app not full screen in the sense that the black bar in the top of battery and time the app should start below that .
4. The app should have a home button where there are settings permissions athlete all the athlete he is connect with and option to add new athletes .In athlete there should be option to send request to coach or accept request from coach cancel the coach.
5. Don't use purple colour or any close resemblance.
6. Add progress graph in the sense that whe nthe athlete logs his exercise he will mention if he could do the weight and reps and sets mention and than track his progress how he climbs in the weight.
7. Add a option to track weight and also progress graph of weight according to the weight goal of the athlete .
8. The trainer should feel like they are operating a professional fitness management.
9. Trainer - information dense about their athletes. 
10. A group of athletes nd coach(trainer). 

# Overview
Design and overall type: 
## trainer 
>information oriented
- Overview - active clinets, adherence and recent activity .
- My theletes - manage trainee profiles. 
- both trainee and trainer profiles are public and they can find each other by usernames. 
- Nutirtion Planner can be set for a group of athletes .  
- Workout builder where the trainers can build targetted muscles workouts, via 3d anatomy and hence can include instrutional videos from youtube or upload their own unlisted on youtube and show it to their audience descriptive topics
- the trainer msut record doing to exercise, so that the trackr can learn what to track from the trainers. 
- there can be different types of trainers, maybe focused on nutirtion or workout or both. they can have their particular areas of focus. 
- trainers can be public to let the users searhc and join them , or if the trainer chooses they can acept only their own limited stuents under training. 
- there are two types to connect with the trainer, either follow them so that we can view what they're doing , what they're posting ,any new groups which they are a new part of. OR add as a trainer .
- Open trainer dont have to approve of every trainee while if the trainer wishes , the trainer which is private can choose to accept as a trainee. 
- Progress analytics accross different groups or if not people. 
- the coach can induce a fee when joining a particular group or the trainee program. 
- Trainer trainee communication must be smooth and must take less effort and should happen seamlessly. 
- Group chats directly for a group of trainees which can share their  progress. 
- 

## trainee
>Action Oriented

- Home shoing todaays workout goals and things to do physically. 
- Assigned training programs , whats going on with others, how they are progessing and all that. 
- workout logger where the user can log their workouts with camera directly via the BlazePose mediapipe to track the sets directly. 
- Assigned trainer and communication 
- history showing until day progress , previous wokrout and logs. 
- nuutrition to be followed, logging in nutrition , what they eat, how many calories and all of that. 
- trainee should be able to start thier workout with as many few intreactions as possible. 

# Standout Features 
## Intelligent workout logger 
- automatic rest timer , after completing set. 
- workout session 
- Trainers can review actual performances 


## Trainer controlled nutrition 
- trainers assign daily nutrition targets. 
- trainees log their meals 
- trainers monitor nutrition adherence 
- historical nutrition reports per trainee and also nutrition reports per group too. 


## AI Exercise form analysis 
- camera based exercise detection 
- rep counting directly 
- basic posture and movements flashback 
- external camera connection 
- both front and back camera accessibility 
- exercise specific form analysis 


## TRainer insights 
- workout completiong percentage 
- Nutrition adherence 
- strength progression 
- missed workouts 
- data accoding to groups 
- data for single individuals 
- weekly trainee reports 
- signals  for trainee's missing out. 
- 

# Aesthetic 
Premium modern fitness aesthetic rather  than a typical generic fitness- app appearance 



# Business Model
The model is that we sell to coaches .We sell them the subscription per athlete 1 st is free for a month  like a demo and than needed subscription for amount of users .The athlete doesn't have to pay he pays the coach or the gym that don't matter to us we take money from coaches per athlete .

# Marketing Strategy
Start with going to local gyms and asking them to use and beta test also by letting their coaches use the app .the sell to those coaches later partner with gyms etc further .Then add collabs with coach plus fitness influencers  .gym also like badminton gym etc .


# Proposed Tech stack 
this is a proposed tech stack only not the final implementation 

## Frontend - React Native 

Reasons - Can do for both iOS and Android with typescript.
Good for existing web development experience while sharing the application logic. 
### State Management 
**Zustland** 
Light weight 
Handles complex state required for active workout sessions (timers , current set, rep counts) seamlessly.

### UI Library 
**NativeWind** 
It is kind of an tailwind for reactnative 

### Why this Set of Choices?

#### ReactNative 
- Suitable for both anf=droid and iOS 
- Both Trainers and Trainee have exact same experience . 
- Native Bridging for AI
- low-level hardware access 
- High performance frame processors 
- We can run only the MediaPipe BlazePose directly on the device GPU and pass only the processsed skeletal coordinates back too the UI thread from preventing the app from freezing. 
- Rich Ecosystem (Mature libraries)

### Zustland
- Managing nested data 
- High-frequency Updates 
- Transient updates without making entire react tree to re-render , keeping data logic clean and easy to update. 
- Seamless Profile Switching 

### NativeWind 
- Rapid UI protoytping 
- Tailwind CSS uitlities into ReactNative 
- Speeding up NativeWind 
- Good to data-dense screens 
- Design SYstem Consistency 
- single tailwind.config.js file for unified look 
- 


<!--
## Alternartive Choices for Frontend 

### Flutter 
Google's UI toolkit that compiles native ARM code and uses its own high performance rendering engine. 

Good out-of-the-box CPU performance for running continous camera frames through Models like MediaPipe blazePose compared to  React Native's JavaScript Bridge.

 Flutter excels at custom, fluid animations. Building complex, drag-and-drop workout routines or interactive macro-tracking charts feels highly responsive and visually consistent across both iOS and Android.
 
 ### Kotlin Multiplatform (KMP) + Swift/Kotlin Native UI
 Business logic excellence, database queries , API calls once in kotlin but build the entire UI natively 
 
Zero-latency access to device's GPU and neural engines. The ultimate best for performance. 

Background syncing of heavy video uploads or offline caching of trainee data operates flawlessly using native background threading .

> There are a few alternative for State management but nativewind is lightweight . 


## Alternative choices for UI libraries 

### Tamagui 
For reactnative 

highly optimised UI toolkit and styling engine that compiles css and flattens react trees for massive oerformance gains 

Complex screens can load instanly 
Includes web like styling capabalities. 

### NativeWind 
For ReactNative

Brings Tailwind CSS directly into React Native

Accelerated our project development speed -->

# APP 
> how should the app actually look like 
## Trainer 
- Sidebar to navigate 
- Welcome back, coach (greeting and date)

### Sidebar contents 
#### client management 
My athletes 
Invitations 
#### Programming 
Workout plans 
exercise library 
nutrition plans 
#### monitoring 
progress and analytics 
schedule 
#### communication 
messages 

settings 
help and support 

Trainer profile to checkout at the end and above the layer of the rest of the contents mentioned above 

cards displaying 
total athletes , active today, avg adherence , needs attention 

Todays priorities 
which would include athlletes who missed their workouts 
unread athlete messages
scheduled check-ins 

weekly athlete adherence 

Athletes rewuiring attention 

--- 
Dashboard metric should be clicable 

## Trainee 

trainer discovery - atheletes discover trainers based on speicalizations, training goals, location(non essential), profile picture, experience, their Rosters, ratings

Roster discovery - trainee should be directly able to join an roster by discovering it publically. 

Challenges and leaderboards 
these are not associated with the trainers , these can be set by indiciduals, there can be a few challeneges set by the app. It would be scoring rules, duration and achievements. 

