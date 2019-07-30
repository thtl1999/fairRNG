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



// code from https://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input
// Restricts input for the given textbox to the given inputFilter.
function setInputFilter(textbox, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    textbox.addEventListener(event, function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      }
    });
  });
}

// Restrict input to digits and '.' by using a regular expression filter.
setInputFilter(document.getElementById("input_box_time"), function(value) {
  return /^\d*$/.test(value);
});