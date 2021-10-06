const io=require('socket.io-client')('http://localhost:5050');

const chalk=require('chalk');



const readline=require('readline');



const rl=readline.createInterface({
    input:process.stdin,
    output:process.stdout
})


io.on('connect',()=>{
    console.log(chalk.red("node client js 127.0.0.1.5050"));
    console.log("connected to 127.0.0.1.5050");
})
 



let win = false;
// Called when a message is sent detailing what player you are
io.on("mes", (playerNum) => {
    if (playerNum === 1) {
        console.log("You are Player 1");
    } else if (playerNum === 2) {
        console.log("You are Player 2");
    } else {
        console.log("Lobby is full");
    }
    io.on("win", msg => {
        win = true;
        console.log(msg);
        process.exit();
    })
    // Prints the board when sent by server
    io.on("board", tttboard => {
        console.log(tttboard[1]+" "+tttboard[2]+" "+tttboard[3]);
    
        console.log(tttboard[4]+" "+tttboard[5]+" "+tttboard[6]);
    
        console.log(tttboard[7]+" "+tttboard[8]+" "+tttboard[9]);
    });
    // requests a turn when server calls for it
    io.on("who",res => {
        if (res !== "") {
            console.log(res);
        }
    
        rl.question('Command: ', function (result) {
            if (win === true) {
                return rl.close();
            }
            if (result === "r") {
                io.emit("exit", "");
            } else {
                io.emit("move", result);
            }
        });
    });

});


