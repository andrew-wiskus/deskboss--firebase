// //info objects
// $scope.auth = AuthFactory;
// $scope.user;
//
// var userFactory = UserFactory;
// var signIn = userFactory.signIn();
//
//
//
//
// //clickfunctions
// $scope.login = function() {
//     signIn();
// }
//
// //MARK:------GET REQUEST //FIREBASE BRAIN
// //the super firebase listener :: ie the brain of the database all lives here. :: ie all the listeners n stuff :: ie firebase rox
// $scope.auth.$onAuthStateChanged(function(user) {
//
//     $scope.user = user;
//     console.log('user logged in', user);
//     var dbRef = firebase.database()
//         .ref()
//         .child('publicData')
//
//     //anytime there is a change to publicData -- update HTML :)
//     dbRef.on('value', snap => {
//         // snap.val() == publicDatabase
//     });
//
//
//
// });
// //MARK:------DELETE REQUEST
// function deleteItemByID(item) {
//     var dbRef = firebase.database()
//         .ref()
//         .child('taskdb')
//         .child($scope.user.uid)
//         .child(task.id)
//         .remove();
// }
// //MARK:------POST REQUEST
// $scope.addNewItemToDB = function(taskObject, user) {
//     var object = {};
//     var DATABASE = 'exampledb'
//
//     //example object constructor
//     // var object = new TaskObject(taskTitle, scrumCount, $scope.currentFolder)
//
//     var currentUserData = firebase.database()
//         .ref()
//         .child(DATABASE) //finds top level header
//         .child(user.id); //finds uid header in child of DATABASE;
//
//     currentUserData.push(object); //adds object to firebase/DATABASE/$userid/
//
// }
//
// //MARK:------PUT REQUEST
// function updateListItem(item) {
//   var DATABASE = 'exampleDB'
//     var dbRef = firebase.database()
//         .ref()
//         .child(DATABASE)
//         .child($scope.user.uid) //goes to current users data
//         .child(item.id) //finds specific item to update
//         .set({
//             title: item.title,
//         }); //replaces info with info above ? full replace or only property ?
// }
