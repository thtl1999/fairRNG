const express = require('express'); // express 모듈 추가하기
const fs = require('fs');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const port = 8080;

const solc = require('solc');
const base_code = fs.readFileSync('data/base-random.sol','UTF-8');


app.use('/css', express.static('static/css'))
app.use('/js', express.static('static/js'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())




app.listen(port, function(err) {
    console.log('Connected port' + port);
    if (err) {
        return console.log('Found error', err);
    }
});

function givehtml(response, page){
    fs.readFile('static/' + page + '.html', function(err, data) {
        if(err) {
            response.send('error');
        }else{
            response.writeHead(200, {'Content-Type':'text/html'});
            response.write(data);
            response.end();
        }
    });
}

async function searchresponse(response, addr, index){

    var index_per_page = 10;
    var html_table = '';
    try{
        //read dir and convert files name(string) to int
        var files = fs.readdirSync('data/addr/' + addr).map(function(v) {
            return parseInt(v, 10);
        });
    }catch(e){
        givehtml(response,'nothingsearch');
        return;
    }
    
    
    if (files.length < 1 + index*index_per_page){
        givehtml(response,'nothingsearch');
        return;
    }


    for(var i=index*index_per_page;i<(index+1)*index_per_page && i<files.length;i++)
    {
        var info = await JSON.parse(fs.readFileSync('data/addr/' + addr + '/' + String(i)));
        var t = new Date(info.date);
        html_table += '<tr><td><a href="/data/' + info.account_addr + '/' 
        + String(i) + '">' + info.title + '</a></td><td>' 
        + info.tx_addr + '</td><td>' + t.toGMTString() + '</td></tr>\n';
    }



    var html = fs.readFileSync('static/searchpage.html','UTF-8');
    html = html.replace('TABLE_DATA',html_table);
    html = html.replace('ADDRESS_DATA',info.account_addr);
    html = html.replace('INDEX_NUMBER',String(index));

    if (index == 0)
        html = html.replace('LEFT_AR','hidden');
    else
        html = html.replace('LEFT_AR','visible');
    if (files.length < 1 + (index+1)*index_per_page)
        html = html.replace('RIGHT_AR','hidden');
    else
        html = html.replace('RIGHT_AR','visible');

    
    response.writeHead(200, {'Content-Type':'text/html'});
    response.write(html);
    response.end();

}


app.get('/', function(request, response) {
    var page = 'mainpage';
    givehtml(response, page);
    
});

app.get('/upload', function(request, response) {
    var page = 'uploadpage';
    givehtml(response, page);
    
});

app.get('/search/:addr', function(request, response) {
    searchresponse(response, request.params.addr, 0);
});

app.get('/search/:addr/:index', function(request, response) {
    searchresponse(response, request.params.addr, Number(request.params.index));
});

app.post('/compile', async function(request, response) {
    const wait_block_num = 10;
    var data = request.body.data;
    var addr = request.body.addr;
    var title = request.body.title;
    //console.log(data);

    const res = await fetch('https://api-ropsten.etherscan.io/api?module=proxy&action=eth_blockNumber');
    const block_info = await res.json();
    //console.log(block_info);
    const block_num = await parseInt(block_info.result);
    
    //console.log(block_num);
    var compiledCode = await compile_sol(block_num + wait_block_num,data);


    var page = await save_contract(compiledCode,data,addr,title);

    response.json({code:compiledCode,page:page});
    
});

app.post('/txresult', async function(request, response) {
    const tx = request.body.data;
    const page = request.body.page;
    const path = 'data/addr/' + tx.from + '/' + page;
    console.log(path);

    let serverdata = fs.readFileSync(path);
    let serverjson = await JSON.parse(serverdata);
    if (serverjson.account_addr == tx.from && '0x' + serverjson.code == tx.input){
        serverjson.txdata = tx;
        fs.writeFileSync(path, JSON.stringify(serverjson));
        response.json({})
    }
    
});

//save ethereum address and code
function save_contract(code,list,addr,title){
    var data = {
        date: Date.now(),
        account_addr: addr,
        tx_addr: 0,
        list_data: list,
        title: title,
        code: code
    }

    var path = 'data/addr/' + data.account_addr;
    
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    var files = fs.readdirSync(path);
    var n = String(files.length); 

    fs.writeFileSync(path + '/' + n, JSON.stringify(data));
    var page = n //'/data/' + data.account_addr + '/' + n;
    return page;
}

//save tx hash
function modify_contract(data){

}


function compile_sol(target_block, name_arr){
    var sol_code = base_code;
    var name_str = '';

    for(var i=0;i<name_arr.length;i++){
        name_str += '\"' + name_arr[i] + '\"' + ',';
    }
    name_str = name_str.slice(0, -1);


    sol_code = sol_code.replace('BLOCKNUMBER',target_block);
    sol_code = sol_code.replace('LISTLENGTH',name_arr.length);
    sol_code = sol_code.replace('STRINGLIST',name_str);

    var input = {
        language: 'Solidity',
        sources: {
            'base-code.sol': {content: sol_code}
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    }

    //console.log(sol_code);
    var compiled = JSON.parse(solc.compile(JSON.stringify(input)));
    return compiled.contracts['base-code.sol']['fair_random'].evm.bytecode.object;
}

//var bytecode = compile_sol(16,['123','456','789']);
//console.log(bytecode);