// Let's imagine you want to receive an ether tip
const yourAddress = '0xddAf4De700038A99ad072B76381F2047025138E8'
const value = '0x0100000a7640000' // an ether has 18 decimals, here in hex.
const desiredNetwork = '3' // '1' is the Ethereum main network ID.

// Detect whether the current browser is ethereum-compatible,
// and handle the case where it isn't:
function click_upload(){

  if (typeof window.ethereum === 'undefined') {
    alert('Looks like you need a Dapp browser to get started.');
    alert('Consider installing MetaMask!');
  
  } else {
  
    // In the case the user has MetaMask installed, you can easily
    // ask them to sign in and reveal their accounts:
    ethereum.enable().catch(function (reason) {
      // Remember to handle the case they reject the request:
      if (reason === 'User rejected provider access') {
        // The user didn't want to sign in!
      } else {
        // This shouldn't happen, so you might want to log this...
        alert('There was an issue signing you in.');
      }
    })
  
    // In the case they approve the log-in request, you'll receive their accounts:
    .then(function (accounts) {
      // You also should verify the user is on the correct network:
      if (ethereum.networkVersion !== desiredNetwork) {
        alert('This application requires the main network, please switch it in your MetaMask UI.');
  
        // We plan to provide an API to make this request in the near future.
        // https://github.com/MetaMask/metamask-extension/issues/3663
      }
  
      // Once you have a reference to user accounts,
      // you can suggest transactions and signatures:
      const account = accounts[0];
      sendEtherFrom(account, function (err, transaction) {
        if (err) {
          return alert(`Sorry you weren't able to contribute!`)
        }
        
        alert('Thanks for your successful contribution!');
        console.log(transaction);
      })
  
    })
  }

}


function sendEtherFrom (account, callback) {

  // We're going to use the lowest-level API here, with simpler example links below
  const method = 'eth_sendTransaction'
  const parameters = [{
    from: account,
    gas: '0xf76c0',
    data: my_contract
  }]
  const from = account;

  // Now putting it all together into an RPC request:
  const payload = {
    method: method,
    params: parameters,
    from: from,
  }

  // Methods that require user authorization like this one will prompt a user interaction.
  // Other methods (like reading from the blockchain) may not.
  ethereum.sendAsync(payload, function (err, response) {
    const rejected = 'User denied transaction signature.'
    if (response.error && response.error.message.includes(rejected)) {
      return alert(`We can't take your money without your permission.`)
    }

    if (err) {
      return alert('There was an issue, please try again.')
    }

    if (response.result) {
      // If there is a response.result, the call was successful.
      // In the case of this method, it is a transaction hash.
      const txHash = response.result
      alert('Thank you for your generosity!')

      // You can poll the blockchain to see when this transaction has been mined:
      pollForCompletion(txHash, callback)
    }
  })
}

function pollForCompletion (txHash, callback) {
  let calledBack = false

  // Normal ethereum blocks are approximately every 15 seconds.
  // Here we'll poll every 2 seconds.
  const checkInterval = setInterval(function () {

    const notYet = 'response has no error or result'
    ethereum.sendAsync({
      method: 'eth_getTransactionByHash',
      params: [ txHash ],
    }, function (err, response) {
      if (calledBack) return
      if (err || response.error) {
        if (err.message.includes(notYet)) {
          return 'transaction is not yet mined'
        }

        callback(err || response.error)
      }

      // We have successfully verified the mined transaction.
      // Mind you, we should do this server side, with our own blockchain connection.
      // Client side we are trusting the user's connection to the blockchain.
      const transaction = response.result
      clearInterval(checkInterval)
      calledBack = true
      callback(null, transaction)
    })
  }, 2000)
}

const my_contract = '0x6080604052601060005560116001556000801b60025560405180606001604052806040518060400160405280600381526020017f313233000000000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600381526020017f343536000000000000000000000000000000000000000000000000000000000081525081526020016040518060400160405280600381526020017f373839000000000000000000000000000000000000000000000000000000000081525081525060039060036100df9291906100f7565b5060036004553480156100f157600080fd5b50610270565b828054828255906000526020600020908101928215610146579160200282015b82811115610145578251829080519060200190610135929190610157565b5091602001919060010190610117565b5b50905061015391906101d7565b5090565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061019857805160ff19168380011785556101c6565b828001600101855582156101c6579182015b828111156101c55782518255916020019190600101906101aa565b5b5090506101d39190610203565b5090565b61020091905b808211156101fc57600081816101f39190610228565b506001016101dd565b5090565b90565b61022591905b80821115610221576000816000905550600101610209565b5090565b90565b50805460018160011615610100020316600290046000825580601f1061024e575061026d565b601f01602090049060005260206000209081019061026c9190610203565b5b50565b6104cb8061027f6000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80634cdca538146100515780634d00ded51461006f57806376514dd01461008d578063a7fb66041461013e575b600080fd5b61005961015c565b6040518082815260200191505060405180910390f35b610077610165565b6040518082815260200191505060405180910390f35b6100c3600480360360408110156100a357600080fd5b81019080803590602001909291908035906020019092919050505061019f565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156101035780820151818401526020810190506100e8565b50505050905090810190601f1680156101305780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610146610379565b6040518082815260200191505060405180910390f35b60008054905090565b60006001546000540143118061018157506000801b6000544014155b1561019b576000544060028190555060005440905061019c565b5b90565b606060008060001b84146101b5578390506101bb565b60025490505b60008160001c90506000849050600060606004546040519080825280602002602001820160405280156101fd5781602001602082028038833980820191505090505b50905060605b600084111561036a577f80000000000000000000000000000000000000000000000000000000000000006130396341c64e6d8702018161023f57fe5b069450600454858161024d57fe5b0692506000151582848151811061026057fe5b60200260200101511515141561036557600182848151811061027e57fe5b6020026020010190151590811515815250508380600190039450506103626102a582610383565b61035d600386815481106102b557fe5b906000526020600020018054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156103535780601f1061032857610100808354040283529160200191610353565b820191906000526020600020905b81548152906001019060200180831161033657829003601f168201915b5050505050610383565b6103b1565b90505b610203565b80965050505050505092915050565b6000600254905090565b61038b61047c565b600060208301905060405180604001604052808451815260200182815250915050919050565b60608082600001518460000151016040519080825280601f01601f1916602001820160405280156103f15781602001600182028038833980820191505090505b509050600060208201905061040f8186602001518760000151610433565b6104288560000151820185602001518660000151610433565b819250505092915050565b5b602081106104575781518352602083019250602082019150602081039050610434565b60006001826020036101000a0390508019835116818551168181178652505050505050565b60405180604001604052806000815260200160008152509056fea265627a7a72305820c6615c0ad080e999b1651fe22802c4839392b910710cf3645b92e9a9c12e242e64736f6c634300050a0032';