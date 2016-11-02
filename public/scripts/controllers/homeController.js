myApp.controller("HomeController", ["$scope", "$http", "$document", "$timeout", "$location", 'AuthFactory', 'UserFactory', function($scope, $http, $document, $timeout, $location, AuthFactory, UserFactory) {
    console.log("HomeController works");


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
                    if (commandString.search(" ") == -1){
                      $timeout(function(){
                        $scope.newTask.title = commands[commandCycle];
                        commandCycle++
                        if(commandCycle == commands.length){
                          commandCycle = 0;
                        }
                      },0)
                    } else {
                //command entered + space, go through auto complete via task list/command list
                    switch(commandString.substring(0,commandString.search(" "))){
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
    $scope.showTimer = false;
    $scope.showCompleted = false;
    $scope.currentFolder = 'main'
    $scope.showBugs = false;

    //info objects
    $scope.auth = AuthFactory;
    $scope.user;
    $scope.newTask = {
        title: "",
        scrum: 1,
        in_folder: null
    }
    $scope.timer = {};
    //auth variables
    var userFactory = UserFactory;
    var signIn = userFactory.signIn();




    //clickfunctions
    $scope.clickedFolder = function(folder) {
        $scope.currentFolder = folder;
        findFoldersToShow();

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
    $scope.fixBug = function(bug) {
            var bugRef = firebase.database()
                .ref()
                .child('taskdb')
                .child('bugs')
                .child(bug.id)
                .remove();
        }
        //MARK:------PUT REQUEST
    $scope.editTask = function(task) {
        var temp = task;
        temp.edit = false;
        updateListItem(temp);
    }

    $scope.completeTask = function(task) {
        var temp = task
        temp.is_complete = !temp.is_complete;
        updateListItem(temp);

    }

    //MARK:------FIREBASE BRAIN
    //the super firebase listener :: ie the brain of the database all lives here. :: ie all the listeners n stuff :: ie firebase rox
    //ps. this is always running and listening for changes, even user == null. //TODO: force login/signin popup

    $scope.auth.$onAuthStateChanged(function(user) {


        var dbRef = firebase.database()
            .ref()
            .child('taskdb')
            .child(user.uid)

        //anytime there is a change to the user's task list -- update dom :)
        dbRef.on('value', snap => {
            //scope init funcs.
            console.log('ish changed in db :)')
            updateUserObject(user, snap.val()) //snap.val() = user tasklist;
        })

        var bugRef = firebase.database()
            .ref()
            .child('taskdb')
            .child('bugs')

        bugRef.on('value', snap => {


            var tempArray = [];
            _.pairs(snap.val())
                .forEach(function(dataArray) {
                    dataArray[1].id = dataArray[0];
                    tempArray.push(
                        dataArray[1]
                    )
                })
            $timeout(function() {
                $scope.user.bugs = tempArray;
            }, 0);


        })

        //TODO: POJO ! :D
        var pojoRef = firebase.database()
        .ref()
        .child('pojodb')
        .child(user.uid)

        // console.log(user.uid);
        //create pojo;
        // pojoRef.push({members: ['UJtVOdWpjxfDsfwdu5UkxIH0bzr2', 'OsPlovxTvMeCsow8dIO26EvcrqI3'], taskList: [{title: 'testing1', scrum: 'testing2'}, {title: 'testing3', scrum: 'testing4'}]})
        //TODO: make new ref for member
        //TODO: push same info

        // pojoRef.on('value', snap => {
        //
        //
        //     var tempArray = [];
        //     _.pairs(snap.val())
        //         .forEach(function(dataArray) {
        //             dataArray[1].id = dataArray[0];
        //             tempArray.push(
        //                 dataArray[1]
        //             )
        //         })
        //     $timeout(function() {
        //         $scope.user.pojo = tempArray;
        //         console.log($scope.user.pojo);
        //     }, 0);
        //
        //
        // })


        //view friends {requests: [], friends:[{id: x, email: y, emojiStatus: z}]}
        var freindRef = firebase.database()
        .ref()
        .child('frienddb')


        // user request friend?- >
        // friendRef.child(pendingFriend.uid).child('requests').push({id: user.uid, email: user.email})

        //user accept friend request? ->
        // friendRef.child(user.uid).child('friends').push({id: newFriend.uid, email: newFriend.email}) //other friend to friend info

        var userdbRef = firebase.database()
        .ref()
        .child('userdb')

        //stores pref email
        //stores display name
        //stores icon
        //stores other user data
        //if no key found -> TRIGGER FIRST TIME LOG IN;



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
            .child(task.id)
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
        }

        var newTaskObject = new TaskObject(taskTitle, scrumCount, $scope.currentFolder)
        var user_tasklist = firebase.database()
            .ref()
            .child('taskdb')
            .child(id);

        user_tasklist.push(newTaskObject);
        $scope.newTask.title = "";
    }


    //MARK:------DATA SORTING / INIT
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
        $scope.user.folders = folders;
    }

    //$function, command line tool
    //NOTE: must return true after functionality to bipass adding command to tasklist.
    function commandCheck(str) {
        // ~ == cd ~
        if (str == '~') {
            $scope.currentFolder = 'main';
            findFoldersToShow()
            $scope.newTask = {};
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
                        alert('sorry you can\'t go further up the folder tree, u at the top son')
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
                    var confirmString = '\nWARNING!! THIS WILL DELETE THE FALLOWING TASKS:\n';
                    tasksToDelete.map(function(task, i) {
                        confirmString += ((i + 1) + '. ' + task.title + '\nin: ' + task.folder + '\n');
                    })


                    if (confirm(confirmString)) {
                        console.log('pressed yes');
                        $scope.newTask.title = '';
                        tasksToDelete.forEach(function(task) {
                            deleteTask(task);
                        })
                    } else {
                        $scope.newTask.title = '';
                        console.log('pressed no');
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
                console.log('bug', bug);
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



            //$timer name xx:yy:zz
            //$timer add task

            //$timer start
            //$timer pause

            //$timer complete task

            //$timer end
            //NOTE: if refresh browser timers NEEDS to stay current. use Date.toString() and have a 'state' for each timer  in db;
            //NOTE: timer goes after set time, ui effect/alert after timer runs out.
            if (commandString.substring(0, 6) == "timer") {
                $scope.showTimer = !$scope.showTimer;
            }
            if (commandString.substring(0, 6) == "timer ") {


                // $timer time 00:00:00
                // $timer start
                // $timer pause
                // $timer end
                // $timer add task
                // $timer complete task

                var timerCommands = ['add', 'start', 'pause', 'complete', 'end'];

                //assumeing its not a command above
                //create timer
                var timerstring = '00:00:00';


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
        this.edit = false;
        this.date = Date()
            .toString();
    }

    //uses underscore to format object and update $scope.user.taskList
    function updateUserObject(user, data) {

        var userDB = firebase.database()
            .ref()
            .child('taskdb')
            .child(user.uid);


        var tempArray = [];
        _.pairs(data)
            .forEach(function(dataArray) {
                dataArray[1].id = dataArray[0];
                tempArray.push(
                    dataArray[1]
                )
            })
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
            .child(task.id)
            .set({
                title: task.title,
                scrum: task.scrum,
                folder: task.folder,
                is_complete: task.is_complete
            });
    }



}]);
