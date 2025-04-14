var phaseEnum; // for changing phases of voting

App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
        try {
            window.web3 = new Web3(window.ethereum);
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            App.account = accounts[0]; // Store first account
            $("#accountAddress").html("Your account: " + App.account);
        } catch (error) {
            console.error("User denied MetaMask access:", error);
        }
    } else {
        console.log("Please install MetaMask!");
    }

    return App.initContract();
  },


  initContract: function () {
    $.getJSON("Contest.json", function (contest) {
      App.contracts.Contest = TruffleContract(contest);
      App.contracts.Contest.setProvider(window.ethereum); // Updated
      return App.render();
    });
  },

  render: function(){
    
    var contestInstance;
    var loader=$("#loader");
    var content=$("#content"); 
    loader.show();
    content.hide();
    $("#after").hide();

    web3.eth.getCoinbase(function(err,account){
      if(err===null){
        App.account=account;
        $("#accountAddress").html("Your account: "+account);
      }
    });

    

    // ------------- fetching candidates to front end from blockchain code-------------
    App.contracts.Contest.deployed().then(function(instance){
      contestInstance=instance;
      return contestInstance.contestantsCount();
    }).then(function(contestantsCount){
      // var contestantsResults=$("#contestantsResults");
      // contestantsResults.empty();

      // var contestantSelect=$("#contestantSelect");
      // contestantSelect.empty();

      // for(var i=1; i<=contestantsCount; i++){
      //   contestInstance.contestants(i).then(function(contestant){
      //     var id=contestant[0];
      //     var name=contestant[1];
      //     var voteCount=contestant[2];
      //     var fetchedParty=contestant[3];
      //     var fetchedAge = contestant[4];
      //     var fetchedQualification = contestant[5]

      //     var contestantTemplate="<tr><th>"+id+"</th><td>"+name+"</td><td>"+fetchedAge+"</td><td>"+fetchedParty+"</td><td>"+fetchedQualification+"</td><td>"+voteCount+"</td></tr>";
      //     contestantsResults.append(contestantTemplate)  ;

      //     var contestantOption="<option value='"+id+"'>"+name+"</option>";
      //     contestantSelect.append(contestantOption);

      var contestantsResults=$("#test");
      contestantsResults.empty();
      var contestantsResultsAdmin=$("#contestantsResultsAdmin");
      contestantsResultsAdmin.empty();

      var contestantSelect=$("#contestantSelect");
      contestantSelect.empty();

      for(var i=1; i<=contestantsCount; i++){
        contestInstance.contestants(i).then(function(contestant){
          var id=contestant[0];
          var name=contestant[1];
          var voteCount=contestant[2];
          var fetchedParty=contestant[3];
          var fetchedAge = contestant[4];
          var fetchedQualification = contestant[5]

          var contestantTemplate="<div class='card' style='width: 15rem; margin: 1rem;'><img class='card-img-top'src='../img/Sample_User_Icon.png' alt=''><div class='card-body text-center'><h4 class='card-title'>" 
          + name + "</h4>"+
          "<button type='button' class='btn btn-info' data-toggle='modal' data-target='#modal"+id+"'>Click Here to Vote</button>" 
          + "<div class='modal fade' id='modal"+id+"' tabindex='-1' role='dialog' aria-labelledby='exampleModalCenterTitle' aria-hidden='true'>"
          + "<div class='modal-dialog modal-dialog-centered' role='document'>"
          + "<div class='modal-content'>"
          + "<div class='modal-header'>"
          + "<h5 class='modal-title' id='exampleModalLongTitle'> <b>" + name + "</b></h5>"
          + "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>"
          + "</div>"
          + "<div class='modal-body'> <b> Party : " + fetchedParty +"<br>Age : " + fetchedAge + "<br>Qualification : " + fetchedQualification + "<br></b></div>"
          + "<div class='modal-footer'>"
          + "<button class='btn btn-info' onClick='App.castVote("+id.toString()+")'>VOTE</button>"
          +"<button type='button' class='btn btn-info' data-dismiss='modal'>Close</button></div>"
          + "</div></div></div>"
          + "</div></div>";
          contestantsResults.append(contestantTemplate)  ;

          var contestantOption="<option style='padding: auto;' value='"+id+"'>"+name+"</option>";
          contestantSelect.append(contestantOption);

          var contestantTemplateAdmin="<tr><th>"+id+"</th><td>"+name+"</td><td>"+fetchedAge+"</td><td>"+fetchedParty+"</td><td>"+fetchedQualification+"</td><td>"+voteCount+"</td></tr>";
          contestantsResultsAdmin.append(contestantTemplateAdmin)  ;
        }); 
      }
      loader.hide();
      content.show();
    }).catch(function(error){
      console.warn(error);
    });

    // ------------- fetching current phase code -------------
    App.contracts.Contest.deployed().then(function (instance){
      return instance.state();
    }).then(function(state){
      var fetchedState;
      var fetchedStateAdmin;
      phaseEnum = state.toString();
      if(state == 0){
        fetchedState = "Registration phase is on , go register yourself to vote !!";
        fetchedStateAdmin = "Registration";
      }else if(state == 1){
        fetchedState = "Voting is now live !!!";
        fetchedStateAdmin = "Voting";
      }else {
        fetchedState = "Voting is now over !!!";
        fetchedStateAdmin = "Election over";
      }
      
      var currentPhase = $("#currentPhase");//for user
      currentPhase.empty();
      var currentPhaseAdmin = $("#currentPhaseAdmin");//for admin
      currentPhaseAdmin.empty();
      var phaseTemplate = "<h1>"+fetchedState+"</h1>";
      var phaseTemplateAdmin = "<h3> Current Phase : "+fetchedStateAdmin+"</h3>";
      currentPhase.append(phaseTemplate);
      currentPhaseAdmin.append(phaseTemplateAdmin);
    }).catch(function(err){
      console.error(err);
    })

    // ------------- showing result -------------
    App.contracts.Contest.deployed().then(function (instance){
      return instance.state();
    }).then(function(state){
      var result = $('#Results');
      if(state == 2){
        $("#not").hide();
        contestInstance.contestantsCount().then(function(contestantsCount){
          for(var i=1; i<=contestantsCount; i++){
            contestInstance.contestants(i).then(function(contestant){
              var id=contestant[0];
              var name=contestant[1];
              var voteCount=contestant[2];
              var fetchedParty=contestant[3];
              var fetchedAge = contestant[4];
              var fetchedQualification = contestant[5];

              var resultTemplate="<tr><th>"+id+"</th><td>"+name+"</td><td>"+fetchedAge+"</td><td>"+fetchedParty+"</td><td>"+fetchedQualification+"</td><td>"+voteCount+"</td></tr>";
              result.append(resultTemplate)  ;
            });
          }
        })
         
      } else {
        $("#renderTable").hide();
      }
    }).catch(function(err){
      console.error(err);
    })
  },

  castVote: async function (id) {
    try {
        const instance = await App.contracts.Contest.deployed();
        const currentPhase = await instance.state(); // Get the current phase

        if (currentPhase.toString() !== "1") {  // 1 = Voting Phase
            alert("Voting is not allowed in this phase!");
            return;
        }

        await instance.vote(id, { from: App.account });
        console.log("Vote cast successfully");
        // Display success message
        $("#message1").html('<div class="alert alert-success" role="alert">Successfully Voted!</div>');

    } catch (error) {
        console.error(error);
    }
},

  addCandidate: async function () {
    $("#loader").hide();
    var name = $("#name").val();
    var age = $("#age").val();
    var party = $("#party").val();
    var qualification = $("#qualification").val();

    console.log("Adding Candidate - Name:", name, "Party:", party, "Age:", age, "Qualification:", qualification);
    console.log("Using account:", App.account); // Debug log

    if (!App.account) {
        console.error("No valid account found! Please connect MetaMask.");
        return;
    }

    try {
        const instance = await App.contracts.Contest.deployed();
        await instance.addContestant(name, party, age, qualification, { from: App.account });
        console.log("Candidate added successfully");
        $("#loader").show();
        $("#name, #age, #party, #qualification").val(""); // Clear input fields
    } catch (error) {
        console.error("Error adding candidate:", error);
    }
  },


  changeState: async function () {
    phaseEnum++; // Move to the next phase
    console.log("Changing Phase to:", phaseEnum);
    console.log("Using account:", App.account); // Debug log

    if (!App.account) {
        console.error("No valid account found! Please connect MetaMask.");
        return;
    }

    try {
        const instance = await App.contracts.Contest.deployed();
        await instance.changeState(phaseEnum, { from: App.account });
        console.log("Phase changed successfully!");
        $("#content").hide();
        $("#loader").show();
    } catch (error) {
        console.error("Error changing phase:", error);
    }
  },


  registerVoter: async function () {
    var add = $("#accadd").val();

    if (!add) {
        alert("Please enter a voter account address.");
        return;
    }

    try {
        const instance = await App.contracts.Contest.deployed();
        await instance.voterRegisteration(add, { from: App.account });

        console.log("Voter registered successfully");

        // 🔁 API call to update MySQL database
        $.post("/update-registration-status", { account_address: add }, function (response) {
            console.log("Database updated:", response);
        });

        // Display success message
        $("#message").html('<div class="alert alert-success" role="alert">User successfully registered!</div>');

        // Clear input field
        $("#accadd").val("");
        $("#content").hide();
        $("#loader").show();
    } catch (error) {
        console.error(error);
        $("#message").html('<div class="alert alert-danger" role="alert">Error registering voter.</div>');
    }
}

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
