var account_addr = document.getElementById('addr_title').innerHTML;
var index_elem = document.getElementById('index_number')
var page_index = Number(index_elem.innerHTML);
console.log(account_addr,page_index);

var left_a = document.getElementById('left_a');
var right_a = document.getElementById('right_a');

index_elem.innerHTML = String(page_index + 1);
left_a.setAttribute('href','/search/' + account_addr + '/' + String(page_index-1));
right_a.setAttribute('href','/search/' + account_addr + '/' + String(page_index+1));