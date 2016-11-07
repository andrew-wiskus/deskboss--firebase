myApp.controller("HomeController", ["$scope", "$http", "$document", "$timeout", "$location", 'AuthFactory', 'UserFactory', function($scope, $http, $document, $timeout, $location, AuthFactory, UserFactory) {



    //KEY EVENT LISTENER !!! SO COOL :D
    var commands = ['$dir', '$delete', '$bug', '$timer']
    var commandCycle = 0;
    $document.bind("keydown", function(event) {
        //autocomplete functionality.. LIKE TERMINAL!@#! YAY
        if (event.key == "Tab") {
            var commandString = $scope.newTask.title

            if (commandString != '') {


                //cycle through commands with tab
                if (commandString[0] == '$') {
                    if (commandString.search(" ") == -1) {
                        $timeout(function() {
                            $scope.newTask.title = commands[commandCycle];
                            commandCycle++
                            if (commandCycle == commands.length) {
                                commandCycle = 0;
                            }
                        }, 0)
                    } else {
                        //command entered + space, go through auto complete via task list/command list
                        switch (commandString.substring(0, commandString.search(" "))) {
                            // case '$bug':
                            // break;
                            case '$dir':
                                console.log('dir-> find children directorys and cycle')
                                break;
                            case '$delete':
                                console.log('cycle through all folders')
                                break;
                            case '$timer':
                                console.log('cycle through timer commands')
                                break;
                            default:
                                console.log('that command has no autocomplete feature');
                        }

                    }
                } else {
                    // return // allows tab functionality if not trying to autocomplete command
                }
            }
            //stops from making a mess with focus
            event.preventDefault();
        }
    });
    //     $scope.name = 'World';
    // $scope.keyCode = "";
    // $scope.keyPressed = function(e) {
    //   $scope.keyCode = e.which;
    // };

    //show/hide filter variables
    $scope.commandHistory = ["welcome to deskboss.io :). \nalpha, v 0.11", "NOTE: Currently this app is optimized for fullscreen in chrome, in fullscreen use CMD+SHIFT+F to hide toolbar", "please use $bug command to notify me of anything, suggestions/critisim welcome as well :)", "use $help to view commands, $cl to clear this window. \nthanks again, ", "drew.wiskus" ];
    $scope.currentFolderStructure = ['main / ', 'new / ', 'works'];
    $scope.showTimer = false;
    $scope.showFolders = false;
    $scope.showCompleted = false;
    $scope.currentFolder = 'main'
    $scope.showBugs = false;
    $scope.showCommands = false;
    $scope.showFriends = false;
    $scope.showPojo = false;
    $scope.newUser = true;
    $scope.newUserName = ''
    //info objects
    $scope.auth = AuthFactory;
    $scope.user;
    $scope.newTask = {
        title: "",
        scrum: 1,
        in_folder: null
    }
    $scope.timer = {};
    $scope.hasFolders = false;
    //auth variables
    var userFactory = UserFactory;
    var signIn = userFactory.signIn();


    // var newdbref = firebase.database()
    // .ref()
    // .child('frienddb')
    // .child(user.uid)
    // .child('friendlist')



    //clickfunctions
    $scope.addFriend = function(friend){
      var friendDB = firebase.database()
      .ref()
      .child('frienddb')
      .child($scope.user.uid)

      friendDB.once('value', data=>{
        var friends = makeSnapshotObject(data.val());
        friends.forEach(f=>{
          if(f.uid == friend.uid){
            friendDB.child(f.key).child('is_friend').set(true)
          }


        })
      });

    }
    $scope.denyFriend = function(friend){
      var friendDB = firebase.database()
      .ref()
      .child('frienddb')
      .child($scope.user.uid)

      friendDB.once('value', data=>{
        var friends = makeSnapshotObject(data.val());
        friends.forEach(f=>{
          if(f.uid == friend.uid){
            friendDB.child(f.key).remove();

          }
        })
      })
    }
    $scope.clickedFolder = function(folder, index) {
        console.log(folder)
        console.log(index);
        if(index == 0 || index == undefined){
          $scope.commandHistory.push("CHANGING DIRECTORY TO: " + folder)
          $scope.currentFolder = folder;
          findFoldersToShow();
        } else {
          var newFolder = ''
          $scope.currentFolderStructure.forEach(function(e,i){
            if (i < index){
              newFolder += e;
              newFolder += '/'
            } else if(i == index){
              newFolder += e;
            }

          })
          $scope.commandHistory.push("CHANGING DIRECTORY TO: " + newFolder)
          $scope.currentFolder = newFolder;
          findFoldersToShow();
        }


    }
    $scope.login = function() {
        signIn();
    }
    $scope.goToParentFolder = function() {
        var current = $scope.currentFolder;
        var str = '';
        current = current.split('')
            .reverse();
        current.map(char => {
            str += char;
        });
        str = str.substring(str.search('/'));
        str = str.split('')
            .reverse();
        current = '';
        str.map(char => {
            current += char;
        })

        if ($scope.currentFolder != 'main') {
            $scope.currentFolder = current.substring(0, current.length - 1);
            findFoldersToShow();
        }


    }
    $scope.toggleViewFolders = function(){
      $scope.showFolders = !$scope.showFolders;
    }
    $scope.fixBug = function(bug) {
            var bugRef = firebase.database()
                .ref()
                .child('taskdb')
                .child('bugs')
                .child(bug.key)
                .remove();
        }
        //MARK:------PUT REQUEST
    $scope.editTask = function(task) {
        updateListItem(task);
    }
    $scope.completeTask = function(task) {
        var temp = task
        temp.is_complete = !temp.is_complete;
        updateListItem(temp);

    }
    $scope.scrumUp = function(task) {

        if (task.folder == null) { //this is a bug entry
            var tempObj = task;
            tempObj.scrum = (tempObj.scrum * 1) + 1;
            console.log(tempObj);
            var taskref = firebase.database()
                .ref()
                .child('taskdb')
                .child('bugs')
                .child(task.key)
                .child('scrum')
                .set(tempObj.scrum)

        } else { //this is a task entry
            var tempObj = task;
            tempObj.scrum = (tempObj.scrum * 1) + 1;
            console.log('attemping to increase scrum:', tempObj);
            var taskref = firebase.database()
                .ref()
                .child('taskdb')
                .child($scope.user.uid)
                .child(task.key)
                .child('scrum')
                .set(tempObj.scrum)

        }

    }
    $scope.scrumDown = function(task) {
        if (task.folder == null) { //this is a bug entry
            var tempObj = task;
            tempObj.scrum = (tempObj.scrum * 1) - 1;
            if (tempObj.scrum == -2) {
                tempObj.scrum = -1;
            }
            console.log(tempObj);
            var taskref = firebase.database()
                .ref()
                .child('taskdb')
                .child('bugs')
                .child(task.key)
                .child('scrum')
                .set(tempObj.scrum);
        } else { //this is a task entry
            var tempObj = task;
            tempObj.scrum = (tempObj.scrum * 1) - 1;
            if (tempObj.scrum == -2) {
                tempObj.scrum = -1;
            }
            console.log('attemping to increase scrum:', tempObj);
            var taskref = firebase.database()
                .ref()
                .child('taskdb')
                .child($scope.user.uid)
                .child(task.key)
                .child('scrum')
                .set(tempObj.scrum);
        }
    }
    $scope.addNewUser = function(newUser, user) {
      // console.log(user, newUser)
        var dbRef = firebase.database()
        .ref()
        .child('userdb');

        dbRef.push({
                name: newUser,
                email: user.email,
                uid: user.uid,
                profile_picture: null
            }) // other public info?

        $timeout(function(){
          $scope.newUser = false;
        },0)

    }




    //MARK:------FIREBASE BRAIN
    //the super firebase listener :: ie the brain of the database all lives here. :: ie all the listeners n stuff :: ie firebase rox
    //ps. this is always running and listening for changes, even user == null.

    $scope.auth.$onAuthStateChanged(function(user) {

        if (user != null) {


            //LISTENER: USER TASK LIST
            var taskRef = firebase.database()
                .ref()
                .child('taskdb')
                .child(user.uid)
            taskRef.on('value', snap => {
                //scope init funcs.
                console.log('ish changed in db :)')
                updateUserObject(user, snap.val()) //snap.val() = user tasklist;
            })


            //LISTENER: GLOBAL BUG_INFO LIST
            var bugRef = firebase.database()
                .ref()
                .child('taskdb')
                .child('bugs')
            bugRef.on('value', snap => {
                var tempArray = makeSnapshotObject(snap.val())
                $timeout(function() {
                    $scope.user.bugs = tempArray;
                }, 0);
            })


            //LISTENER: SHARED POJO LISTS
            var pojoRef = firebase.database()
                .ref()
                .child('pojodb')

            // pojoRef.push({members:['wskcontact@gmail.com', 'andrewwiskus@gmail.com'], taskList: [{scrum:2,title:'make this work'}, {scrum:5, title:'fix this ish'}], title: 'myfirstpojo'});
            //badbadbadbadbad TODO: OPTIMIZE THIS //WILL CAUSE PROBLEMS IN FUTURE IF YOU DONT!!
            pojoRef.on('value', data=>{
              var userPojos = [];
              var pojos = makeSnapshotObject(data.val()) // yes.. we're listening for all of them atm and pulling all in.. wtf
              pojos.forEach(pojo=>{
                var isMember = _.indexOf(pojo.members, user.email);
                if(isMember != -1){
                  userPojos.push(pojo);
                }
              })

              $timeout(function(){
                $scope.user.pojos = userPojos;
              },0)

            });


            //LISTENER: FRIENDS LIST/REQUESTS
            var friendRef = firebase.database()
                .ref()
                .child('frienddb')
                .child(user.uid)
            friendRef.on('value', x => {
                var tempArray = makeSnapshotObject(x.val())

                $timeout(function() {
                    $scope.user.friends = tempArray;
                    findFriendRequests()
                })
            })



            //LISTENER: GLOBAL USERDB W/ PUBLIC INFO
            var userdbRef = firebase.database()
                .ref()
                .child('userdb')
            checkNewUser(userdbRef, user)



            //LISTENER: USER SETTINGS
            var currentUserRef = firebase.database()
                .ref()
                .child('userdb')
                .child(user.uid)
            currentUserRef.on('value', x => {
                var tempArray = makeSnapshotObject(x.val())
                    //IF USER SETTINGS CHANGE:
                    //update $scope.user.settings
            })

            //LISTNER: TIMER -need for offline->online capablities
            //uses time started + time paused refrences to calcualte time remaining while comparing current time:
            //is_paused: time | null;
            //amount paused: int | null;
            //started_at: time;



        }
    });

    //MARK:------DELETE REQUEST
    $scope.deleteTask = function(task) {
        deleteTask(task);

    }

    function deleteTask(task) {
        var dbRef = firebase.database()
            .ref()
            .child('taskdb')
            .child($scope.user.uid)
            .child(task.key)
            .remove();
    }


    //MARK:------POST REQUEST
    $scope.addTask = function(taskObject, user) {

        if (commandCheck(taskObject.title)) {

            return;
        }

        var id = $scope.user.uid
        var scrumCount = findScrum(taskObject.title)
            .scrum
        var taskTitle = findScrum(taskObject.title)
            .title


        //todo: fix w/o using .alert
        if (scrumCount != -1) {
            if (scrumCount.search(/[a-z]/) != -1) {
                console.log('HEY');
                alert('Dont use hashtags in the middle of a task title, only at the end for scrum count :)')
                return;
            }
        } else {
            scrumCount = 0;
        }

        var newTaskObject = new TaskObject(taskTitle, scrumCount, $scope.currentFolder)
        var user_tasklist = firebase.database()
            .ref()
            .child('taskdb')
            .child(id);

        user_tasklist.push(newTaskObject);
        $scope.newTask.title = "";
        $scope.commandHistory.push("NEWTASK:     /" + $scope.currentFolder + "/" + taskTitle)
    }




    //MARK:------DATA SORTING / INIT

    function findFriendRequests(){
      console.log('users friends:', $scope.user.friends);
      var temp = $scope.user.friends
      var friends = [];
      var requests = [];
      temp.forEach(friend=>{
        if(friend.is_friend){
          friends.push(friend);
        } else{
          requests.push(friend);
        }


      })
      $scope.user.friends = friends;
      $scope.user.friendRequests = requests;
    }
    //finds folders to display deppening on $scope.currentFolderg
    function findFoldersToShow() {
        var current = $scope.currentFolder;
        var folders = _.uniq($scope.user.folders.map(folder => {
            return folder.folder
        }));
        folders = folders.map(folder => {

            if (current.search(folder) != -1) {
                return {
                    folder: folder,
                    show: false
                };
            }


            if (folder == current) {
                return {
                    folder: folder,
                    show: false
                };
            } else if (folder.substring(current.length + 1)
                .search('/') != -1) {
                return {
                    folder: folder,
                    show: false
                }
            }

            var rev = folder.split('')
            rev.reverse();
            var revStr = ''
            rev = rev.map(chars => {
                revStr += chars
            });
            revStr = revStr.substring(revStr.search('/'))
                .split('')
                .reverse();
            rev = ''
            revStr.map(chars => {
                rev += chars;
            })
            if (current.substring(rev.length) != '') {
                return {
                    folder: folder,
                    show: false
                };
            };


            // console.log(rev.substring(0).split('').reverse().join(''));


            return {
                folder: folder,
                show: true
            };

        })

        var foldercount = 0;
        folders.forEach(x=>{
          if(x.show == true){
            foldercount++
          }
        })
        if(foldercount > 0){
          $scope.hasFolders = true;
        } else{
          $scope.hasFolders = false;
        }
        $scope.currentFolderStructure = $scope.currentFolder.split('/');
        $scope.user.folders = folders;

    }

    //checks if the user logged in is new, if new->promopt first time user window
    function checkNewUser(dbRef, user) {
        dbRef.once('value', data => {
            console.log('all current users: ', data.val());
            console.log('current user email: ', user.email)
            var allUsers = makeSnapshotObject(data.val());
            var newUser = true;
            allUsers.forEach(x=>{
              if(x.email == user.email){
                newUser = false;
              }
            })
            if(newUser){
              console.log('newUser!!')
              $timeout(function(){
                $scope.newUser = true;
                $scope.user.allUsers = allUsers
              }, 0)
            } else{
              $timeout(function(){
                $scope.newUser = false;
                $scope.user.allUsers = allUsers
              }, 0)
            }

        })
    }


    //$function, command line tool
    //NOTE: must return true after functionality to bipass adding command to tasklist.
    function commandCheck(str) {
        // ~ == cd ~
        if (str == '~') {
            $scope.currentFolder = 'main';
            findFoldersToShow()
            $scope.newTask = {};
            $scope.commandHistory.push("CHANGE DIRECTORY: /main");
            return true;
        }


        //bling commands
        // $dir
        // $delete
        // $bug
        // $move
        // $add
        if (str[0] == '$') {
            var commandString = str.substring(1);
            //$dir x
            if (commandString.substring(0, 4) == "dir ") {

                //$dir .. == cd ..
                if (commandString.substring(4) == '..') {
                    if ($scope.currentFolder == 'main') {
                        $scope.newTask.title = '';
                        $scope.commandHistory.push("ERROR: NO PARENT DIRECTORY");
                        // alert('sorry you can\'t go further up the folder tree, u at the top son')
                        return true;
                    }
                    //TODO: PUT INTO FUNCTION PLX SO MESSY :)
                    //IDEA: search txt files for //todo's //idea's //note's and upload into tasklist ? :) ?
                    var folders = $scope.currentFolder;
                    folders = folders.split('/');
                    var newDir = '';
                    folders.map(function(folderName, index) {
                        if (index != folders.length - 1 && index != folders.length - 2) {
                            newDir += (folderName + '/')
                        } else if (index != folders.length - 1) {
                            newDir += (folderName);
                        } else {
                            $scope.commandHistory.push("CHANGING TO PARENT DIRECTORY: " + newDir)
                            $scope.currentFolder = newDir;
                            findFoldersToShow()
                        }
                    })
                    return true;
                    //end of mess for $dir ..

                }

                //NOTE: PLACE NEW $dir FUNCTION HERE BEFORE "CATCHALL"


                //NOTE: CATCHALL:
                //$dir dirName == (cd dirName || mkdir dirName);

                $scope.currentFolder += '/' + commandString.substring(4);
                $scope.commandHistory.push("CHANGING TO DIRECTORY: " + $scope.currentFolder);
                findFoldersToShow();
                $scope.newTask.title = '';
            }

            //$delete x
            if (commandString.substring(0, 7) == "delete ") {
                var deleteString = commandString.substring(7);
                $scope.newTask.title = '';
                var user = $scope.user
                var tasksToDelete = [];
                //checks to see if the string was for a folder and pushes all tasks in that folder to task list;
                user.taskList.map(function(task) {
                    if (task.folder != undefined) {
                        if (task.folder.search(deleteString) != -1) {
                            tasksToDelete.push(task);
                        }
                    }

                })

                if (tasksToDelete.length != 0) {
                    //alert with tasks that will be deleted
                    //TODO: MAKE BETTER CONFIRM STRING :)
                    var confirmString = '\nDELETE TASKS:\n';
                    tasksToDelete.map(function(task, i) {
                        confirmString += ((i + 1) + '. ' + task.title + '\nin: ' + task.folder + '\n');
                    })


                    if (confirm(confirmString)) {

                        $scope.newTask.title = '';
                        $scope.commandHistory.push("DELETED DIRECTORY " + deleteString + ", TASKS DELETED: " + tasksToDelete.length)
                        tasksToDelete.forEach(function(task) {
                            deleteTask(task);
                        })
                    } else {
                        $scope.newTask.title = '';

                        $scope.commandHistory.push("DELETE DIRECTORY CANCELED")
                    }
                } else {
                    //alert sayin there was no tasks
                    alert('no folder with that name found')
                }




            }

            //$bug x
            if (commandString.substring(0, 4) == "bug ") {
                var command = commandString.substring(4);
                $scope.newTask.title = '';
                var bug = findScrum(command)

                $scope.commandHistory.push("ADDED BUG TO GLOBAL BUG DB: " + bug.title);
                var dbRef = firebase.database()
                    .ref()
                    .child('taskdb')
                    .child('bugs')
                    .push(bug);
            }

            //$move 'x' y
            //x: task prefix
            //y: folder

            //$add x 'y' z
            //x: note, alert, calander
            //y: data
            //z: taskprefix to attach info to

            if (commandString.substring(0, 7) == "friend ") {
                //TODO:if friend doesnt exist in db -> check requested friends db so no multiples -> then execute code below
                if (commandString.substring(7, 10) == "add") {
                    var friendToAdd = commandString.substring(11);
                    var isEmail = false;
                    $scope.user.allUsers.forEach(m=>{
                      if(m.email == friendToAdd && friendToAdd != $scope.user.email ){
                        isEmail = true;
                        $scope.commandHistory.push("FRIEND REQUEST SENT TO: " + m.email);
                        var friendDB = firebase.database()
                        .ref()
                        .child('frienddb')
                        .child(m.uid)
                        .push({email: $scope.user.email, uid: $scope.user.uid, is_friend: false});

                      }
                    })

                    if(isEmail == false){

                        // alert('email not found in user database')
                        $scope.commandHistory.push("ERROR: REQUEST NOT SENT, EMAIL NOT FOUND IN DB")

                    }



                }
            }

            if(commandString == "cl"){
              $scope.commandHistory = [];
              $scope.newTask.title = '';
            }

            if(commandString == "help"){
              $scope.commandHistory.push("OPENING HELP MENU");
              $scope.showHelp = true;
            }
            //NOTE: if refresh browser timers NEEDS to stay current. use Date.toString() and have a 'state' for each timer  in db;
            //NOTE: use new Date(task.date).getTime() to compare seconds between tasks ?
            //NOTE: timer goes after set time, ui effect/alert after timer runs out.
            if (commandString.substring(0, 6) == "sprint") {
                $scope.showTimer = !$scope.showTimer;
            }
            if (commandString.substring(0, 6) == "sprint ") {

                var sprintCommands = [{
                    command: 'add',
                    run: function() {
                        console.log('ADDING TASK TO SPRINT: x')
                    }
                }, {
                    command: 'remove',
                    run: function() {
                        console.log('REMOVING TASK FROM SPRINT: x')
                    }
                }, {
                    command: 'complete',
                    run: function() {
                        console.log('COMPLETED TASK IN SPRINT: x')
                    }
                }, {
                    command: 'start',
                    run: function() {
                        console.log('STARTING SPRINT')
                    }
                }, {
                    command: 'set',
                    run: function() {
                        console.log('SETTING SPRINT TIMER: x')
                    }
                }, {
                    command: 'pause',
                    run: function() {
                        console.log('PAUSE SPRINT @: x')
                    }
                }, {
                    command: 'end',
                    run: function() {
                        console.log('SPRINT COMPLETE, CALCULATING RESULTS')
                    }
                }, ];
                var commandIndex = -1;

                sprintCommands.map((x, y) => {
                    if (commandString.substring(6) == x.command) {
                        x.run();
                    }
                });



            }








            return true;
        }

    }

    //finds number associated with scrum #23, throws error if alpha characters past #
    function findScrum(str) {

        //finds if #
        var scrum = str.search('#');
        var tempObj = {};
        if (scrum != -1) {
            tempObj.scrum = str.substring(scrum + 1)
            tempObj.title = str.substring(0, scrum);
        } else {
            tempObj.scrum = scrum;
            tempObj.title = str;
        }

        return tempObj;

    }

    //taskobject constructor for default values
    function TaskObject(title, scrum, folder) {
        this.title = title;
        this.scrum = scrum;
        this.folder = folder;
        this.is_complete = false;
        this.date = Date()
            .toString();
    }

    function makeSnapshotObject(data) {
        var tempArray = [];
        _.pairs(data)
            .forEach(function(dataArray) {
                dataArray[1].key = dataArray[0];
                tempArray.push(
                    dataArray[1]
                )
            })

        return tempArray;
    }
    //uses underscore to format object and update $scope.user.taskList
    function updateUserObject(user, data) {

        var userDB = firebase.database()
            .ref()
            .child('taskdb')
            .child(user.uid);

        var tempArray = makeSnapshotObject(data);

        var folderArray = [];
        tempArray.forEach(function(task, i) {

            // var folder = task.folder;
            if (task.folder == null) {
                tempArray[i].folder = 'main';
            }
            folderArray.push({
                folder: task.folder,
                show: false
            })
        })

        folderArray = _.uniq(folderArray);
        //update scope
        $timeout(function() {
            $scope.user = user;
            $scope.user.taskList = tempArray;
            $scope.user.folders = folderArray;
            findFoldersToShow();

        }, 0);


    }

    //passes in list item after update and appends to db.
    function updateListItem(task) {


        var dbRef = firebase.database()
            .ref()
            .child('taskdb')
            .child($scope.user.uid)
            .child(task.key)
            .set({
                date: task.date,
                title: task.title,
                scrum: task.scrum,
                folder: task.folder,
                is_complete: task.is_complete
            });
    }



}]);
