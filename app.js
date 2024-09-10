App = {
  // the vaiable below will store references of wallet, smart contract and your accounts
  webProvider: null,
  contracts: {},
  account: '0x0',
 
 
  initWeb:function() {
      // if an ethereum provider instance is already provided by metamask
      const provider = window.ethereum
      if( provider ){
        App.webProvider = provider;
      }
      else{
        App.webProvider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
      }
   
      return App.initContract();
  },
 
 
  initContract: function() {
      $.getJSON("Donation.json", function( donation ){
        // instantiate a new truffle contract from the artifict
        App.contracts.Donation = TruffleContract( donation );
   
        // connect provider to interact with contract
        App.contracts.Donation.setProvider( App.webProvider );
        
        return App.render();
      })
  },
 
 // NOTE: render function starts below  
  render: async function(){
      
      // open wallet and load account data
      if (window.ethereum) {
        try {
          // recommended approach to requesting user to connect mmetamask instead of directly getting the list of connected account
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          App.account = accounts;
          $("#accountAddress").html(`Your account address: ${App.account[0]}`);
        } catch (error) {
          if (error.code === 4001) {
            // User rejected request
            console.warn('user rejected')
          }
          $("#accountAddress").html("Your Account: Not Connected");
          console.error(error);
        }
      }
  },
  register_donor: async function(){
    const contractInstance = await App.contracts.Donation.deployed()
    const name = $("#donor_name").val();
    const phone = $("#donor_phone").val();
    const result = await contractInstance.register_as_donor(name,phone,App.account[0],{ from: App.account[0] })
    alert("You are registered successfully");
  },
  donate: async function(){
    const contractInstance = await App.contracts.Donation.deployed()
    const zone = $("#zone").val();
    const phone = $("#donor_phone").val();
    const amount = parseInt($("#amount").val()) * 1e18;
    const result = await contractInstance.lets_donate(phone,zone,{ from: App.account[0], value: amount })
    alert("We received your kindness. May you be blessed!");
  },
  show: async function () {
    const contractInstance = await App.contracts.Donation.deployed()
    const result = await contractInstance.donation_summary()
    const total = result[0];
    const sylhet = result[1];
    const c_n = result[2];
    const c_s = result[3];
        const displayText = `
        Total Fund Raised: ${total/1e18} ETH<br>
        Fund raised in Sylhet: ${sylhet/1e18} ETH<br>
        Fund raised in Chittagong North: ${c_n/1e18} ETH<br>
        Fund raised in Chittagong South: ${c_s/1e18} ETH
    `;
    $("#show_space").html(displayText);
  },
  find_me: async function(){
    const contractInstance = await App.contracts.Donation.deployed()
    const acc = $("#acc").val();
    const result = await contractInstance.who_am_i(acc, {from: App.account[0]})
    const name = result[0];
    const phone = result[1];
    
    $("#profile").html(`Welcome, ${name}. <br>Your phone number is: ${phone}`);
  },

 };
 
 
 $(function() {
  $(window).load(function() {
    App.initWeb();
  });
 });
 
