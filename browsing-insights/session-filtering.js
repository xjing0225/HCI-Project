//the series of activities 

//set color for specific transition type
function setColorForTransition(record, recordEntry) {
    if (record.transition === 'link') {
        recordEntry.style.backgroundColor = "rgb(100, 200, 200)";
    } else if (record.transition === 'typed') {
        recordEntry.style.backgroundColor  = "red";
    } else {
        recordEntry.style.backgroundColor  = "rgb(216, 242, 212)";
    }
}
