function scrollToPost(elemID){
      console.log("SCrollon");
      var currentFocusedElem = document.querySelector(".focused");

      if(!!(currentFocusedElem)){
        currentFocusedElem.classList.remove("focused");
      }
      
      var elmnt = document.getElementById(elemID);
      elmnt.classList.add("focused");
      elmnt.scrollIntoView({ block:"center"});
}