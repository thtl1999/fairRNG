const desiredNetwork = '3' // '1' is the Ethereum main network ID. '3' is ropsten

// Detect whether the current browser is ethereum-compatible,
// and handle the case where it isn't:
function activate_metamask(compiled_code, page) {
	if (typeof window.ethereum === 'undefined') {
		alert('Looks like you need a Dapp browser to get started.\nConsider installing MetaMask!');
		return 'Cannot find metamask addon';
	}

	console.log(compiled_code);
	// In the case the user has MetaMask installed, you can easily
	// ask them to sign in and reveal their accounts:
	return ethereum.enable().catch(function (reason) {
		// Remember to handle the case they reject the request:
		if (reason === 'User rejected provider access') {
			// The user didn't want to sign in!
			alert('Did you click [no] for request?');
		} else {
			// This shouldn't happen, so you might want to log this...
			alert('There was an issue signing you in.');
		}
		return 'Cannot get access from browser';
	})

		// In the case they approve the log-in request, you'll receive their account array
		.then(function (accounts) {
			// You also should verify the user is on the correct network:
			if (ethereum.networkVersion !== desiredNetwork) {
				alert('This application requires the test network, please switch it in your MetaMask UI.');
				// We plan to provide an API to make this request in the near future.
				// https://github.com/MetaMask/metamask-extension/issues/3663
				return 'User is in other ethereum network';
			}

			// Once you have a reference to user accounts,
			// you can suggest transactions and signatures:
			const account = accounts[0];
			sendEtherFrom(account, compiled_code, async function (err, transaction) {
				if (err) {
					alert('I guess you clicked [deny]');
					return 'User denied transaction';
				}

				alert('All the procedure completed successfully');
				console.log(transaction);

				const result_send = await fetch('/txresult', {
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({data:transaction,page:page})
				});
				
				window.location.href = '/data/' + transaction.from + '/' + page;
			})

		})
}


function sendEtherFrom(account, compiled_code, callback) {

	// We're going to use the lowest-level API here, with simpler example links below
	const method = 'eth_sendTransaction';

	const parameters = [{
		from: account,
		gas: '0xf76c0',	//0x376c0 is enough
		data: compiled_code
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

function pollForCompletion(txHash, callback) {
	let calledBack = false

	// Normal ethereum blocks are approximately every 15 seconds.
	// Here we'll poll every 2 seconds.
	console.log('waiting for poll for completion');
	const checkInterval = setInterval(function () {

		const notYet = 'response has no error or result'
		ethereum.sendAsync({
			method: 'eth_getTransactionByHash',
			params: [txHash],
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

