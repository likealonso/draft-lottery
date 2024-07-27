var members = [
    {'Rudy, RAAAIIIIIDEEEERRSSS':"https://i.imgur.com/TBaaa0L.png"}, 
    {"Alonso, Hungry for a third title":"https://i.imgur.com/dZe7jRE.png"}, 
    {'Gilbert, Not allowed to pick Rams or Chargers':"https://i.imgur.com/cFyTT0F.png"}, 
    {'Victor, Holy shit':"https://i.imgur.com/bZUJexR.png"}, 
    {'Eddie, Set your lineup':"https://i.imgur.com/19zAiTs.png"}, 
    {'Eric, Gold-blooded still looking for first title':"https://i.imgur.com/ElWxeln.png"}, 
    {'Mike, Defending champ in the house':"https://i.imgur.com/IS7rP8I.png"}, 
    {'Oscar, What sexy team will you pick this year?':"https://i.imgur.com/eWoCvCT.png"}, 
    {'Lawrence, Got a picture':"https://i.imgur.com/jtCKlJ3.png"}, 
    {"Kevin, Welcome to the league!":"https://i.imgur.com/MA4oU0L.png"}
]

function shuffle(array) {
    console.log('shufflng')
    console.log(array)
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
     // console.log('while its not zero  ' + currentIndex)
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
     // console.log('randomIndex ' + randomIndex)
      currentIndex -= 1;
     // console.log('currentIndex - 1 = ' + currentIndex)
  
      // And swap it with the current element.
     // console.log('array[currentIndex] ' + array[currentIndex])
      temporaryValue = array[currentIndex];
     // console.log('temporaryValue ' + temporaryValue)
      array[currentIndex] = array[randomIndex];
     // console.log('array[currentIndex] ' + array[currentIndex])
      array[randomIndex] = temporaryValue;
     // console.log('array[randomIndex] ' + array[randomIndex])
     // console.log('array shuffle = ' + array)
    }
  
    return array;
}





// Used like so
function doit() {
    document.querySelector('body').style.backgroundImage="none"
    members = shuffle(members);
    var text = ['Gilbert', 'Eddie', 'Victor', 'Oscar', 'Mike', 'Eric', 'Rudy', 'Lawrence', 'Fernando', 'Alonso'];
    var counter = 0;
    var elem = document.getElementById("changeText");
    var inst = setInterval(change, 300);
    var startTime = new Date().getTime();
    function change() {
        elem.innerHTML = text[counter];
        counter++;
        if (counter >= text.length) {
            counter = 0;
            if(new Date().getTime() - startTime > 74000){
                clearInterval(inst);
                document.getElementById("changeText").innerHTML = Object.keys(members[0]).toString().split(",")[0] + ", CONGRATS!"
                // document.getElementById("parent").appendChild(document.createElement('p').appendChild(document.createTextNode("Hllo")))
                for (i=0; i<10; i++){
                    // console.log(i)
                    var listItem = document.createElement('li')
                    var listText = document.createTextNode(i + 1 + ". " + Object.keys(members[i]).toString().split(",")[0]);
                    listItem.appendChild(listText)
                    document.getElementById("parent").append(listItem)
                }
                return;
            }
            // clearInterval(inst); // uncomment this if you want to stop refreshing after one cycle
        }
    }
    change();
    //console.log(members);
    //var p3 = document.getElementById('p3')
    var timer = 0
    function doSetTimeout(i) {
        // console.log(i)
        timer ++
        var seconds
        if (i >7){
            // document.getElementById('parent3').style = "display:flex; justify-content: center;"
            seconds = 5000
        } else if (i>3 && i < 8){
            // document.getElementById('parent2').style = "display:flex; justify-content: center;"
            seconds = 6000
        } else {
            // document.getElementById('parent1').style = ""
            seconds = 7000
        }
        console.log(seconds)
        console.log(timer)
        console.log(seconds*timer/1000)
        setTimeout(function() {
            var node = document.createElement("div")
            if (i > 7){
                node.setAttribute("style", "width:30%; padding-left: 5px")
            } else if (i > 3 && i < 8){
                node.setAttribute("style", "width:40%; display:inline-block; padding-left: 5px")
            } 
            else {
                node.setAttribute("style", "width:50%; display:inline-block; padding-left: 5px")
            }
            var parg = document.createElement("p")
            var textnode = document.createTextNode(i + ". " + Object.keys(members[i-1]));
            var img = document.createElement("img")
            img.setAttribute("style", "width:100%")
            parg.appendChild(textnode)
            node.appendChild(parg);
            img.setAttribute('src', Object.values(members[i-1]))
            node.appendChild(img)
            if (i >7){
                // document.getElementById("parent4").prepend(img);
                document.getElementById("parent4").prepend(node);
            } else if (i === 6 || i === 7){
                document.getElementById("parent3").prepend(node);
                // document.getElementById("parent3").prepend(img);
            } else if (i === 4 || i === 5){
                document.getElementById("parent2").prepend(node);
                // document.getElementById("parent2").prepend(img);
            } else {
                document.getElementById("parent1").prepend(node);
                // document.getElementById("parent1").prepend(img);
            }


            // document.getElementById(numString).innerHTML = i + ". HELLO " + Object.keys(members[i-1])
            // document.getElementById(imgId).src = Object.values(members[i-1]);
        }, seconds*timer);
    }

    for (var i = 10; i > 0; i--){
        // console.log(i)
        doSetTimeout(i)
    }

    

}