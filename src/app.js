const express = require('express'); // express 모듈 추가하기
const fs = require('fs');
const bodyParser = require('body-parser')

const app = express();
const port = 8080;

const solc = require('solc');
const base_code = fs.readFileSync('./data/base-random.sol','UTF-8');


app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())




app.listen(port, function(err) {
    console.log('Connected port' + port);
    if (err) {
        return console.log('Found error', err);
    }
});

function givehtml(response, page){
    fs.readFile('./static/' + page + '.html', function(err, data) {
        if(err) {
            response.send('error');
        }else{
            response.writeHead(200, {'Content-Type':'text/html'})
            response.write(data)
            response.end()
        }
    });
}


app.get('/', function(request, response) {
    var page = 'mainpage';
    givehtml(response, page);
    
});

app.get('/upload', function(request, response) {
    var page = 'uploadpage';
    givehtml(response, page);
    
});

app.post('/create', function(request, response) {
    console.log(request.body);
    response.json({url:'123'});
})

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