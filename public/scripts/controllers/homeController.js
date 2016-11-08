myApp.controller("HomeController", ["$scope", "$http", "$document", "$timeout", "$location", "$anchorScroll", 'AuthFactory', 'UserFactory', function($scope, $http, $document, $timeout, $location, $anchorScroll, AuthFactory, UserFactory) {





    //KEY EVENT LISTENER !!! SO COOL :D
    var commands = ['$dir', '$delete', '$bug', '$cl', '$friend', '$help', '$view']
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
    $scope.commandHistory = ["welcome to deskboss.io :). \nalpha, v 0.15 type: $help for command list"];
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


    $scope.welcomeScreen = true;
    $scope.showTutorial = false;
    //todo: move all this shit
    $scope.currentLevel = 1;
    $scope.nextLevel = function(){

    }
    $scope.prevLevel = function(){

    }




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
    $scope.addFriend = function(friend) {
        var friendDB = firebase.database()
            .ref()
            .child('frienddb')
            .child($scope.user.uid)

        friendDB.once('value', data => {
            var friends = makeSnapshotObject(data.val());
            friends.forEach(f => {
                if (f.uid == friend.uid) {
                    friendDB.child(f.key)
                        .child('is_friend')
                        .set(true)
                }


            })
        });

    }
    $scope.denyFriend = function(friend) {
        var friendDB = firebase.database()
            .ref()
            .child('frienddb')
            .child($scope.user.uid)

        friendDB.once('value', data => {
            var friends = makeSnapshotObject(data.val());
            friends.forEach(f => {
                if (f.uid == friend.uid) {
                    friendDB.child(f.key)
                        .remove();

                }
            })
        })
    }
    $scope.clickedFolder = function(folder, index) {
        console.log(folder)
        console.log(index);
        var date = new Date()
        var datestring = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "   " + $scope.currentFolder + ': ';

        if (index == 0 || index == undefined) {
            $scope.commandHistory.push(datestring + "Clicked on: " + folder + " -> changing directory")
            $scope.currentFolder = folder;
            findFoldersToShow();
        } else {
            var newFolder = ''
            $scope.currentFolderStructure.forEach(function(e, i) {
                if (i < index) {
                    newFolder += e;
                    newFolder += '/'
                } else if (i == index) {
                    newFolder += e;
                }

            })
            $scope.commandHistory.push(datestring + "Clicked on: " + newFolder + "-> changing directory")
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
    $scope.toggleViewFolders = function() {
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

    $scope.priorityUp = function(task) {


        if (task.folder == null) { //this is a bug entry
            var tempObj = task;
            if(!(tempObj.priority >-2)){
              tempObj.priority = 0
            }
            tempObj.priority = (tempObj.priority * 1) + 1;
            console.log(tempObj);
            var taskref = firebase.database()
                .ref()
                .child('taskdb')
                .child('bugs')
                .child(task.key)
                .child('priority')
                .set(tempObj.priority)

        } else { //this is a task entry
            var tempObj = task;
            if(!(tempObj.priority >-2)){
              tempObj.priority = 0
            }
            tempObj.priority = (tempObj.priority * 1) + 1;
            console.log('attemping to increase priority:', tempObj);
            var taskref = firebase.database()
                .ref()
                .child('taskdb')
                .child($scope.user.uid)
                .child(task.key)
                .child('priority')
                .set(tempObj.priority)

        }

    }
    $scope.priorityDown = function(task) {
        if (task.folder == null) { //this is a bug entry
            var tempObj = task;
            if(!(tempObj.priority >-2)){
              tempObj.priority = 0
            }
            tempObj.priority = (tempObj.priority * 1) - 1;
            if (tempObj.priority == -2) {
                tempObj.priority = -1;
            }
            console.log(tempObj);
            var taskref = firebase.database()
                .ref()
                .child('taskdb')
                .child('bugs')
                .child(task.key)
                .child('priority')
                .set(tempObj.priority);
        } else { //this is a task entry
            var tempObj = task;
            if(!(tempObj.priority >-2)){
              tempObj.priority = 0
            }
            tempObj.priority = (tempObj.priority * 1) - 1;
            if (tempObj.priority == -2) {
                tempObj.priority = -1;
            }
            console.log('attemping to increase priority:', tempObj);
            var taskref = firebase.database()
                .ref()
                .child('taskdb')
                .child($scope.user.uid)
                .child(task.key)
                .child('priority')
                .set(tempObj.priority);
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

        $timeout(function() {
            $scope.newUser = false;
        }, 0)

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
            pojoRef.on('value', data => {
                var userPojos = [];
                var pojos = makeSnapshotObject(data.val()) // yes.. we're listening for all of them atm and pulling all in.. wtf
                pojos.forEach(pojo => {
                    var isMember = _.indexOf(pojo.members, user.email);
                    if (isMember != -1) {
                        userPojos.push(pojo);
                    }
                })

                $timeout(function() {
                    $scope.user.pojos = userPojos;
                }, 0)

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

        var date = new Date()
        var datestring = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + '   ' + $scope.currentFolder + ': ';
        var taskStr = taskObject.title

        if (commandCheck(taskObject.title)) {
            if(taskStr != '$cl'){

            $scope.welcomeScreen = false;
            }
            $scope.newTask.title = '';
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
        var objDiv = document.getElementById("taskList");
        objDiv.scrollTop = objDiv.scrollHeight;
        $scope.commandHistory.push(datestring + "adding task:     /" + $scope.currentFolder + "/" + taskTitle)
        var objDiv = document.getElementById("commandHistory");
        objDiv.scrollTop = objDiv.scrollHeight;
    }




    //MARK:------DATA SORTING / INIT

    function findFriendRequests() {
        console.log('users friends:', $scope.user.friends);
        var temp = $scope.user.friends
        var friends = [];
        var requests = [];
        temp.forEach(friend => {
            if (friend.is_friend) {
                friends.push(friend);
            } else {
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
        folders.forEach(x => {
            if (x.show == true) {
                foldercount++
            }
        })
        if (foldercount > 0) {
            $scope.hasFolders = true;
        } else {
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
            allUsers.forEach(x => {
                if (x.email == user.email) {
                    newUser = false;
                }
            })
            if (newUser) {
                console.log('newUser!!')
                $timeout(function() {
                    $scope.newUser = true;
                    $scope.user.allUsers = allUsers
                }, 0)
            } else {
                $timeout(function() {
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

        var date = new Date()
        var datestring = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + '   ' + $scope.currentFolder + ': ';

        if (str == '$dir ~') {
            $scope.currentFolder = 'main';
            findFoldersToShow()
            $scope.newTask = {};
            $scope.commandHistory.push(datestring + "$dir ~ -> changing directory to /main");
            var objDiv = document.getElementById("commandHistory");
            objDiv.scrollTop = objDiv.scrollHeight;
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
                        $scope.commandHistory.push(datestring + "ERROR: NO PARENT DIRECTORY");
                        var objDiv = document.getElementById("commandHistory");
                        objDiv.scrollTop = objDiv.scrollHeight;
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
                            $scope.commandHistory.push(datestring + "$dir .. -> moving to parent directory: " + newDir)
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
                $scope.commandHistory.push(datestring + "$dir " + commandString.substring(4) + " -> changing directory to: " + $scope.currentFolder);
                var objDiv = document.getElementById("commandHistory");
                objDiv.scrollTop = objDiv.scrollHeight;
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
                        $scope.commandHistory.push(datestring + "$delete " + deleteString + " -> deleted " + tasksToDelete.length + " tasks")
                        tasksToDelete.forEach(function(task) {
                            deleteTask(task);
                        })
                    } else {
                        $scope.newTask.title = '';

                        $scope.commandHistory.push(datestring + "$delete " + deleteString + " -> canceled delete request")
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

                $scope.commandHistory.push(datestring + "$bug " + bug.title + " -> added bug to global bug db ");
                var objDiv = document.getElementById("commandHistory");
                objDiv.scrollTop = objDiv.scrollHeight;
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
                    var friend = {};
                    $scope.user.allUsers.forEach(m => {
                        if (m.email == friendToAdd && friendToAdd != $scope.user.email) {
                            isEmail = true;
                            friend = m;

                        }
                    });

                    if (isEmail == true) {

                        var friendDB = firebase.database()
                            .ref()
                            .child('frienddb')
                            .child(friend.uid)

                        friendDB.once('value', snap => {
                            var unqRequest = true;
                            var tempArray = makeSnapshotObject(snap.val());
                            console.log(tempArray);

                            tempArray.forEach(data => {
                                if (data.email == $scope.user.email) {
                                    unqRequest = false;
                                }
                            });

                            if (unqRequest) {
                                friendDB.push({
                                    email: $scope.user.email,
                                    uid: $scope.user.uid,
                                    is_friend: false
                                });

                                $timeout(function() {
                                    $scope.commandHistory.push(datestring + "$friend add " + friend.email + " -> sent friend request");
                                    var objDiv = document.getElementById("commandHistory");
                                    objDiv.scrollTop = objDiv.scrollHeight;
                                })


                            } else {
                                $timeout(function() {
                                    $scope.commandHistory.push(datestring + "ERROR: Friend request sent already, or you're already friends :)");
                                    var objDiv = document.getElementById("commandHistory");
                                    objDiv.scrollTop = objDiv.scrollHeight;
                                })

                            }
                        }); //end of snapshot


                    }


                    if (isEmail == false) {

                        // alert('email not found in user database')
                        $scope.commandHistory.push(datestring + "$friend add " + friendToAdd + " -> ERROR: REQUEST NOT SENT, EMAIL NOT FOUND IN DB")

                    }



                }
            }
            if (commandString == "start"){
              $scope.showTutorial = true;
              $scope.commandHistory.push(datestring + ("$start -> opening tutorial challenges"));
              var objDiv = document.getElementById("commandHistory");
              objDiv.scrollTop = objDiv.scrollHeight;
            }
            if (commandString == "cl") {
                $scope.commandHistory = [datestring.substring(0, datestring.length - 2) + '/'];
                $scope.newTask.title = '';
            }

            if (commandString == "help") {
                if ($scope.showHelp) {
                    $scope.commandHistory.push(datestring + ("$help -> closing help menu"));
                    var objDiv = document.getElementById("commandHistory");
                    objDiv.scrollTop = objDiv.scrollHeight;
                } else {
                    $scope.commandHistory.push(datestring + "$help -> opening help menu");
                    var objDiv = document.getElementById("commandHistory");
                    objDiv.scrollTop = objDiv.scrollHeight;
                }
                $scope.showHelp = !$scope.showHelp;
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
        this.priority = 0;
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
            $scope.user.level = 1;
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
