function search() {
    var txt = document.getElementById('txtbox');
    var addr = txt.value.toLowerCase();
    if (isAddress(addr))
        window.location = '/search/' + addr;
    else
        alert('Please input valid address');
}