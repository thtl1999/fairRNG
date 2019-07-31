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
    //should get Tx, account address
    var tx_addr = generate_256();
    var account_addr = generate_256();
    
    var data_set = {
        tx_addr: tx_addr,
        account_addr: account_addr
    };

    const rawResponse = await fetch('/create', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data_set)
    });
    const content = await rawResponse.json();

    console.log(content);

}

//generate random 256bit hex number and return with 0x
function generate_256(){
    var n = '';
    
    for(var i=0;i<8;i++){
        var r = Math.floor(Math.random()*4294967295).toString(16);
        r = '00000000' + r;
        r = r.slice(-8);
        n = n + r;
    }
    n = '0x' + n;
    console.log(n);
    return n;
}