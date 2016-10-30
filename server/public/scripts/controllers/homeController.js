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
    $scope.currentFolder = 'main'



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

      if(blingCheck(taskObject.title)){
        return;
      }

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

        var newTaskObject = new TaskObject(taskTitle, scrumCount, $scope.currentFolder)
        var user_tasklist = firebase.database()
            .ref()
            .child('userdb')
            .child(id);

        user_tasklist.push(newTaskObject);
        $scope.newTask.title = "";
    }




    //MARK:------DATA SORTING / INIT
    function findFoldersToShow(){
      var current = $scope.currentFolder;
      var folders = _.uniq($scope.user.folders.map(folder=>{return folder.folder}));
      console.log(folders);
      folders = folders.map(folder=>{

        if(current.search(folder) != -1){
          return {folder: folder, show: false};
        }


        if(folder == current){
          return {folder: folder, show: false};
        } else if (folder.substring(current.length + 1).search('/') != -1 ){
          return {folder: folder, show: false}
        }

        var rev = folder.split('')
        rev.reverse();
        var revStr = ''
        rev = rev.map(chars =>{
          revStr += chars
        });
        revStr = revStr.substring(revStr.search('/')).split('').reverse();
        rev = ''
        revStr.map(chars =>{
            rev += chars;
        })
        if(current.substring(rev.length) != ''){
          return{folder: folder, show: false};
        };


        // console.log(rev.substring(0).split('').reverse().join(''));


          return {folder: folder, show: true};

      })
      console.log(folders);
      $scope.user.folders = folders;
    }
    function blingCheck(str){
      if(str == '~'){
        $scope.currentFolder = 'main';
        findFoldersToShow()
        $scope.newTask = {};
        return true;
      }
      if(str[0] == '$'){
        var tempStr = str.substring(1);
        if(tempStr.substring(0,4) == "dir "){
          if(tempStr.substring(4) == '..'){
            var folders = $scope.currentFolder;
            folders = folders.split('/');
            var newDir = '';
            folders.map(function(folderName, index){
              if(index != folders.length - 1 && index != folders.length - 2){
                newDir += (folderName + '/')
              } else if (index != folders.length - 1){
                newDir += (folderName);
              } else {
                $scope.currentFolder = newDir;
                findFoldersToShow()
              }
            })
            return true;

          }
        $scope.currentFolder += '/' + tempStr.substring(4);
        findFoldersToShow();
        $scope.newTask.title = '';
        }




        return true;
      }

    }
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
            var folderArray = [];
            tempArray.forEach(function(task){


              folderArray.push({folder: task.folder, show: false})
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
