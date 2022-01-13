var pym = require("./lib/pym");
require("./lib/webfonts");

// If sortable:
// window.Tablesort = require("tablesort");
// require("tablesort/dist/sorts/tablesort.number.min");
// Tablesort(document.querySelector("#state-table"))

pym.then(child => {
    child.sendHeight();
    window.addEventListener("resize", () => child.sendHeight());
});

var headers = document.getElementsByClassName('who');

for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    
    header.addEventListener("click", function(e) {
        this.parentElement.parentElement.nextElementSibling.firstElementChild.classList.toggle('hidden');
        arrow = this.childNodes[0];
        if(arrow.classList.contains("right")) {
            arrow.classList.remove("right")
            arrow.classList.add("down")
        }
        else {
        arrow.classList.remove("down")
        arrow.classList.add("right")
        }

        pym.then(child => {
            child.sendHeight();
        })
    });
    
}

// var toggleDetails = function(x) {
//     console.log(this)
// }


// headers[0].addEventListener("click", function(e) {
//     this.parentElement.parentElement.nextElementSibling.firstElementChild.classList.toggle('hidden')
// });