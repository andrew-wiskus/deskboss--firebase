myApp.controller("HomeController", ["$scope", "$http", "$location", 'AuthFactory', function($scope, $http, $location, AuthFactory) {
    console.log("HomeController works");


    $scope.auth = AuthFactory;
    $scope.user;
    $scope.newTask = {
      title: "not working",
      scrum: 1,
      in_folder: null
    }
    $scope.currentTaskList = [];

    function addTaskToDB(taskObj) {
        var newTask = new TaskObject(taskObj.title, taskObj.scrum, taskObj.in_folder);
        addTask(newTask);
    }

    $scope.submitNewTask = function(taskObj){
      console.log(taskObj);
      addTaskToDB(taskObj);
      $scope.newTask = {}
    }



    //TODO:
    // addNewTask --DONE
    // deleteTask
    // editTask title
    // editTask completion
    // editTask scrum
    // editTask folder

    //-------------------------INIT DATA -------------------------
    loadUserData()

    function loadUserData() {
        $scope.auth.$onAuthStateChanged(function(user) {
            $scope.user = user;
            var dbRef = firebase.database()
                .ref()
                .child('userdb');

            //updates $scope.user.taskList
            updateTaskDataObject(dbRef, user);
        });
    }


    //-------------------------Update Data

    //updates list to sorting/filter specs
    function updateCurrentTaskList(listOrder){
      switch (listOrder){
        case 'view_all_chrono':
        $scope.currentTaskList = $scope.user.taskList.map(function(task, i){
          if(task.data.is_complete == false && task.data.is_deleted == false){
            return {id: task.id, data: task.data};
          }
        })
        break;
        default: console.log('case is broken!!! updateCurrentTaskList()')
      }
    }




    //-------------------------ADD TASK FUNCTIONs-------------------------

    //adds object to task list and updates $scope
    function addTask(taskToAdd){
      $scope.auth.$onAuthStateChanged(function(user) {
          var dbRef = firebase.database()
              .ref()
              .child('userdb');
          //adds task to db, unique header for each user id: /userdb/user.uid
          addTaskToUserTaskList(dbRef, user, taskToAdd);
          //updates $scope.user.taskList
          updateTaskDataObject(dbRef, user);
      });
    }

    //pushes object up to firebase using user.uid
    function addTaskToUserTaskList(dbRef, user, jsonObj) {
        var userDB = dbRef.child(user.uid);
        userDB.push(jsonObj);
    }

    //uses underscore to format object and update $scope.user.taskList
    function updateTaskDataObject(dbRef, user) {

        var testing = userTaskData(dbRef, user)
            .then(function(data) {
                var tempArray = [];
                _.pairs(data.val())
                    .forEach(function(dataArray) {
                        tempArray.push({
                            taskid: dataArray[0],
                            data: dataArray[1]
                        })
                    })
                    //update scoped user
                $scope.$apply(function() {
                    $scope.user.taskList = tempArray;
                    updateCurrentTaskList('view_all_chrono');
                })
            });

          console.log('testing');

    }

    //grabs all userdata from firebase
    function userTaskData(dbRef, user) {
        var userDB = dbRef.child(user.uid);
        return userDB.once('value', function(data) {})
    }

    //task object constructor
    function TaskObject(task, scrum, in_folder) {
        this.task = task;
        this.date = Date().toString()
        this.scrum = scrum;
        this.in_folder = in_folder
        this.is_complete = false;
        this.is_deleted = false;
    }





}]);


//retreives value from db refrence --CALLED WHEN EVER VALUE IS CHANGED
// dbRef.on('value', snap => console.log(snap.val()))




//          CATCH ALL METHOD when ever anything is changed, return full object
//          .on(('value'), snap=>{ })
//
//    ---------------------------------------------------
//          child changed/added/removed.. faster?

//          .on(('child_added'), snap => { })
//          .on(('child_changed'), snap => { })
//          .on(('child_removed'), snap => { })

// hobbies.on('child_added', snap => {
//   // console.log(snap.val());
// })
