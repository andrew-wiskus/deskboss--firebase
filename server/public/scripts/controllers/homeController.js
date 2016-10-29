myApp.controller("HomeController", ["$scope", "$http", "$timeout", "$location", 'AuthFactory', function($scope, $http, $timeout, $location, AuthFactory) {
    console.log("HomeController works");


    $scope.auth = AuthFactory;
    $scope.user;
    $scope.newTask = {
      title: "",
      scrum: 1,
      in_folder: null
    }





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
              updateUserObject(user)
            })

        });



//MARK:------PUT REQUEST
        $scope.completeTask = function(task){
          console.log(task);
          var temp = task
          temp.is_complete = !temp.is_complete;
          updateListItem(temp);

        }
        //passes in list item after update and appends to db.
        function updateListItem(listItem){
          var dbRef = firebase.database()
              .ref()
              .child('userdb')
              .child($scope.user.uid)
              .child(listItem.id)
              .set({title: listItem.title, scrum: 9, in_folder: null, is_complete: false});
        }
//MARK:------POST REQUEST

$scope.addTask = function(taskObject, user){
  var id = $scope.user.uid
  var newTaskObject = new TaskObject(taskObject.title, taskObject.scrum, null)
  var user_tasklist = firebase.database()
    .ref()
    .child('userdb')
    .child(id);

  user_tasklist.push(newTaskObject);
}




//MARK:------DATA SORTING / INIT

//taskobject constructor for default values
function TaskObject(title, scrum, folder){
  this.title = title;
  this.scrum = scrum;
  this.folder = folder;
  this.is_compelte = false;
}

//uses underscore to format object and update $scope.user.taskList
function updateUserObject(user) {

  var userDB = firebase.database()
  .ref()
  .child('userdb')
  .child(user.uid);

  userDB.once('value', function(data) {
    var tempArray = [];
    _.pairs(data.val())
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
  })

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
