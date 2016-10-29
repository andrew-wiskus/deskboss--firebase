myApp.controller("HomeController", ["$scope", "$http", "$timeout", "$location", 'AuthFactory', function($scope, $http, $timeout, $location, AuthFactory) {
    console.log("HomeController works");


    $scope.auth = AuthFactory;
    $scope.user;
    $scope.newTask = {
        title: "",
        scrum: 1,
        in_folder: null
    }
    $scope.showCompleted = false;




    //MARK:------FIREBASE BRAIN
    //the super firebase listener :: ie the brain of the database all lives here. :: ie all the listeners n stuff :: ie firebase rox
    //ps. this is always running and listening for changes, even user == null. //TODO: force login/signin popup

    $scope.auth.$onAuthStateChanged(function(user) {


        var dbRef = firebase.database()
            .ref()
            .child('userdb')
            .child(user.uid)

        //anytime there is a change to the user's task list -- update dom :)
        dbRef.on('value', snap => {
            //scope init funcs.
            console.log('ish changed')
            updateUserObject(user, snap.val()) //snap.val() = user tasklist;
        })

    });



    //MARK:------PUT REQUEST
    $scope.editTask = function(task){
      var temp = task;
      temp.edit = false;
      updateListItem(temp);
    }

    $scope.completeTask = function(task) {
            var temp = task
            temp.is_complete = !temp.is_complete;
            updateListItem(temp);

    }

    //passes in list item after update and appends to db.
    function updateListItem(task) {
        var dbRef = firebase.database()
            .ref()
            .child('userdb')
            .child($scope.user.uid)
            .child(task.id)
            .set({
                title: task.title,
                scrum: task.scrum,
                in_folder: null,
                is_complete: task.is_complete
            });
    }

    //MARK:------DELETE REQUEST
    $scope.deleteTask = function(task) {
            var dbRef = firebase.database()
                .ref()
                .child('userdb')
                .child($scope.user.uid)
                .child(task.id)
                .remove();

        }
    //MARK:------POST REQUEST

    $scope.addTask = function(taskObject, user) {
        var id = $scope.user.uid
        var scrumCount = findScrum(taskObject.title).scrum
        var taskTitle = findScrum(taskObject.title).title

        //todo: fix w/o using .alert
        if (scrumCount != -1){
        if(scrumCount.search(/[a-z]/) != -1){
          console.log('HEY');
          alert('Dont use hashtags in the middle of a task title, only at the end for scrum count :)')
          return;
        }}

        var newTaskObject = new TaskObject(taskTitle, scrumCount, null)
        var user_tasklist = firebase.database()
            .ref()
            .child('userdb')
            .child(id);

        user_tasklist.push(newTaskObject);
        $scope.newTask.title = "";
    }




    //MARK:------DATA SORTING / INIT

    function findScrum(str){

      //finds if #
      var scrum = str.search('#');
      var tempObj = {};
      if(scrum != -1){
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
    }

    //uses underscore to format object and update $scope.user.taskList
    function updateUserObject(user, data) {

        var userDB = firebase.database()
            .ref()
            .child('userdb')
            .child(user.uid);


            var tempArray = [];
            _.pairs(data)
                .forEach(function(dataArray) {
                    dataArray[1].id = dataArray[0];
                    tempArray.push(
                        dataArray[1]
                    )
                })

            //update scope
            $timeout(function() {
                $scope.user = user;
                $scope.user.taskList = tempArray;
            }, 0);


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
