async function load_from_server(addr,page){

    const server_raw_data = await fetch('/reqtxdata/' + addr + '/' + page);
    var json_data = await server_raw_data.json();
    try{
        d = json_data.txdata
    }catch(e){
        return;
    }

    data_set = {
        't_txaddr':d.hash,
        't_owner':d.from,
        't_servert':json_data.date,
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

var url = window.location.href.split('/')

var addr = url[url.length -2];
var page = url[url.length -1];

load_from_server(addr,page);