myApp.factory('UserFactory', ['$http', '$scope', function($http, $scope) {

    function commandCheck(str, $scope) {
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
            if (commandString == "start") {
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

    return {
        checkCommands: function() {
            return commandCheck;
        }

    };
}]);
