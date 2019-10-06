var file = document.getElementById('filebox');

file.addEventListener('change', fileuploaded);

function fileuploaded()
{
    var txt = document.getElementById("filebox").files[0]
    var fileReader = new FileReader();
    
    fileReader.onload = async function(fileLoadedEvent){
        var textFromFileLoaded = fileLoadedEvent.target.result;
        //console.log(textFromFileLoaded);
        var item_list = textFromFileLoaded.split('\n');
        
        await delete_all_list();
        for(var i=0;i<item_list.length;i++){
            insert_to_list(item_list[i]);
        }
    };
    
    fileReader.readAsText(txt);
}


function insert_button_func()
{
    var item_text = prompt("Please type item");
    if (item_text != null) insert_to_list(item_text);
}

function insert_to_list(item_text)
{
    var list_table = document.getElementById("list_table");
    var option = document.createElement("option");
    option.text = item_text;
    list_table.add(option);
}

function delete_all_list(){
    var list_table = document.getElementById("list_table");
    if (list_table.length > 0){
        list_table.innerHTML = "";
    }
}

function delete_button_func(){
    var list_table = document.getElementById("list_table");
    list_table.remove(list_table.selectedIndex);
}

async function upload(){

    await window.ethereum.enable();

    if (false){     //test
        //should get Tx, account address
        //var account_addr = generate_hash(40);
        var tx_addr = generate_hash(64);
        var account_addr = '0xc14BeadB8B32eE7fD0D86B53521fFca1271503d2';
        
    }
    
    
    var list_data = document.getElementById("list_table").innerText.split('\n');
    var title = document.getElementById("title_box").value;
    if (title == '') title = 'Untitled';
    
    const rawBytecode = await fetch('/compile', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            data:list_data,
            addr:window.ethereum.selectedAddress.toLowerCase(),
            title: title
        })
    });

    const res = await rawBytecode;
    const bytecode = await res.json();

    const result = activate_metamask(bytecode.code, bytecode.page);

}


//generate random hex number (h length) and return with 0x
function generate_hash(h){
    var n = '';
    
    for(var i=0;i<h/8;i++){
        var r = Math.floor(Math.random()*4294967295).toString(16);
        r = '00000000' + r;
        r = r.slice(-8);
        n = n + r;
    }
    n = '0x' + n;
    console.log(n);
    return n;
}