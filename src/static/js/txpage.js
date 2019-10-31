async function load_from_server(addr,page){

    const server_raw_data = await fetch('/reqtxdata/' + addr + '/' + page);
    json_data = await server_raw_data.json();
    try{
        d = json_data.txdata
    }catch(e){
        return;
    }

    var data_set = {
        't_txaddr':d.hash,
        't_owner':d.from,
        't_servert':new Date(json_data.date),
        't_title':json_data.title
    }
    
    for (var key in data_set){
        write_table(key,data_set[key]);
    }

}

function write_table(tableid,content){
    var t = document.getElementById(tableid);
    t.innerHTML = content;
}

async function verify_all(){
    var r = document.getElementById('t_result');
    r.innerHTML = '';

    add_result('Testing 3 elements...',true);

    const bt_raw_data = await fetch('https://api-ropsten.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=' + json_data.txdata.hash);
    const bt_raw = await bt_raw_data.json();
    const bt = bt_raw.result;
    console.log(bt);

    if (bt.from === json_data.account_addr)
        add_result('Owner approved',true);
    else
        add_result('Owner error',false);


    if (bt.input === json_data.code)
        add_result('Contract code approved',true);
    else
        add_result('Contract code error',false);

    
    const block_raw_data = await fetch('https://api-ropsten.etherscan.io/api?module=block&action=getblockreward&blockno=' + String(parseInt(bt.blockNumber)));
    const block_raw = await block_raw_data.json();
    const block_time = parseInt(block_raw.result.timeStamp);
    document.getElementById('t_etht').innerHTML = new Date(block_time * 1000);
    
    var time_diff = Math.abs(json_data.date/1000 - block_time)
    if (time_diff < 120)    // 120 sec
        add_result('Timestamp approved',true);
    else
        add_result('Timestamp error',false);

    
    const abi_raw_data = await fetch('/abi');
    const abi = await abi_raw_data.json();

    const contract = web3.eth.contract(abi).at(bt.creates);


    contract.show_target_block({},async function(err, res){
        target_block_num = String(res.c[0]);
        console.log(target_block_num);

        const target_block = await fetch('https://api-ropsten.etherscan.io/api?module=block&action=getblockreward&blockno=' + target_block_num);
        const target_block_info = await target_block.json();
        const target_block_hash = parseInt(target_block_info.result.hash);

        contract.show_result(target_block_hash,json_data.list_data.length,{},async function(err, res){
            var results = res.split(',');
            document.getElementById('t_list').innerHTML = '';
            for(i=0;i<results.length -1;i++)
                add_list(String(i+1) +'. ' + results[i]);
            
        });
    });

}


function add_result(str,result){
    var r = document.getElementById('t_result');
    var p = document.createElement('p');
    var txt = str + ' ';
    if (result)
        txt += '✔️';
    else
    {
        txt += '❌';
        is_approved = false;
    }
        
    p.appendChild(document.createTextNode(txt));
    r.appendChild(p);
}

function add_list(str){
    var r = document.getElementById('t_list');
    var p = document.createElement('p');
        
    p.appendChild(document.createTextNode(str));
    r.appendChild(p);
}

var url = window.location.href.split('/')

var addr = url[url.length -2];
var page = url[url.length -1];

json_data = 0;
is_approved = true;

load_from_server(addr,page);