let desc = document.getElementById("desc");
let m = document.getElementById("m")
let b = document.getElementById("b")
let noise = document.getElementById("noise")
let showData = document.getElementById("generate")
let learning_rate = document.getElementById("lr")
let points = document.getElementById("points")
let trainBtn = document.getElementById("train")

let dataInputBoxes = document.getElementsByClassName("dataInputs")
let trainingInputBoxes = document.getElementsByClassName("trainingInputBoxes")

let trainingInputs = document.getElementById("trainingInputs")
let dataInputDiv = document.getElementById("dataInputDiv");

let paraHelp = document.getElementById("paraHelp");
let hypHelp = document.getElementById("hypHelp");

let graphDiv = document.getElementById("graphContainer");

let trainingStats = document.getElementsByClassName("trainingStats")[0];
let inputs = document.getElementsByClassName("inputs");

let inputsDivs = document.getElementById("inputsDivs")

let stats = document.getElementById("stats");

let resetBtn = document.getElementById("reset");

let epoch = document.getElementById("epoch")
let loss = document.getElementById("loss")
let accuracy = document.getElementById("accuracy")


let numInfo = document.getElementById("numInfo")
let noiseInfo = document.getElementById("noiseInfo")
let lrInfo = document.getElementById("lrHelp")
let epochInfo = document.getElementById("epochHelp")

let helpBtns = document.getElementsByClassName("helpBtn");


let hoverModal = document.getElementById("modal")
let hoverDesc = document.getElementById("hoverDesc")

let positiveInps = document.getElementsByClassName("positive");

noise.addEventListener("change", e => {
    if (parseInt(e.target.value) > 1) {
        noise.value = 1;
    } else if(parseInt(e.target.value) < -1){
        noise.value = -1;
    }
})

epochs.addEventListener("change", e => {
    if(parseFloat(e.target.value) > 10000){
        epochs.value = 10000;
    } else if(parseFloat(e.target.value) < 1){
        epochs.value = 1;
    }
    epochs.value = parseInt(epochs.value);

})

m.addEventListener("change", e=>{
    if(parseFloat(e.target.value) > 1e6){
        m.value = 1e6;
    } else if(parseFloat(e.target.value) < -1e6){
        m.value = -1e6;
    }
})

b.addEventListener("change", e=>{
    if(parseFloat(e.target.value) > 1e6 ){
        b.value = 1e6;
    } else if(parseFloat(e.target.value) < -1e6 ){
        b.value = -1e6;
    }
})

learning_rate.addEventListener("change", e => {
    if(parseFloat(e.target.value) > 1){
        learning_rate = 1;
    } 
})

points.addEventListener("change", e => {
    if(parseInt(e.target.value) > 5000){
        points.value = 5000
    } else if(parseInt(e.target.value) < 1){
        points.value = 1
    }
    points.value = parseInt(points.value);
})

Array.from(positiveInps).forEach(inp => inp.addEventListener("change", e => {
    if(parseFloat(e.target.value) < 0){
        inp.value = 0;
    }
}))

Array.from(helpBtns).forEach(btn => btn.addEventListener("mouseover", (e) => {
    hoverModal.classList.remove("hidden")
    let left = e.pageX;
    let top = e.pageY;
    console.log(hoverModal.style.clientWidth)
    hoverModal.style.position = "absolute";
    hoverModal.style.left = (left - (hoverModal.clientWidth)) + "px";
    hoverModal.style.top = top + "px";

    if (btn.id == "numInfo") {
        hoverDesc.innerHTML = "number of points to generate for a dataset in which the line of best fit will attempt to estimate. the larger the dataset, the better the estimation."

    } else if (btn.id == "noiseInfo") {
        hoverDesc.innerHTML = "makes the points more spread out to prevent a perfectly linear dataset. any decimal between -1 and 1 is allowed."

    } else if (btn.id == "lrHelp") {
        hoverDesc.innerHTML = "number of points to generate for a dataset in which the line of best fit will attempt to estimate. the larger the dataset, the better the estimation."

    } else if (btn.id == "epochHelp") {
        hoverDesc.innerHTML = "number of training rounds the model will take. recommended to be within the hundreds."

    }

}))

Array.from(helpBtns).forEach(btn => btn.addEventListener("mouseleave", () => {
    hoverModal.classList.add("hidden")

}))


let m_val;
let b_val;


let m_para;
let b_para;

let parameters = {
    m: [],
    b: [],
    m_real: null,
    b_real: null,
    noise: null,
    points: null
}

let hyperparameters = {
    learning_rate: null,
    epochs: null,
    loss: [],
    loss_partials_m: [],
    loss_partials_b: []
}

let xs = []
let ys = []

showData.addEventListener("click", () => {
    m_val = parseFloat(m.value);
    b_val = parseFloat(b.value);

    m_para = Math.ceil(Math.random() * 1000) / 1000;
    b_para = Math.ceil(Math.random() * 1000) / 1000;

    parameters.m = [m_para]
    parameters.b = [b_para]

    parameters.m_real = m_val;
    parameters.b_real = b_val;

    let noise_val = parseFloat(noise.value);
    let points_val = parseFloat(points.value);

    parameters.noise = noise_val
    parameters.points = points_val;


    generateData(parameters);

})

trainBtn.addEventListener("click", () => {
    let epochs_val = parseInt(epochs.value);
    let learning_rate_val = parseFloat(learning_rate.value);
    hyperparameters.epochs = epochs_val;
    hyperparameters.learning_rate = learning_rate_val;
    train(xs, ys, parameters, hyperparameters)
})



function error_val(m, b, x, i, y) {
    return Math.pow(((m * x[i] + b) - y[i]), 2)
}


function error_deriv_m(m, b, x, i, y) {
    return 2 * (((m * x[i] + b)) - y[i]) * x[i]
}
function error_deriv_b(m, b, x, i, y) {
    return 2 * (((m * x[i] + b)) - y[i])
}


function graphData(x, y, parameters) {
    graphDiv.classList.remove("hidden")
    trainingInputs.classList.remove("hidden")
    let trace1 = {
        x: x,
        y: y,
        mode: "markers",
        type: "scatter",
        name: "Actual",
        hovertemplate: "(%{x}, %{y})",
        marker: {
            "color": "rgb(125,125,125)"
        },
        textfont: {
            family: "JetBrains Mono"
        },
        text: y
    }
    let data = [trace1];


    let y_vals = [];
    for (let i = 0; i < x.length; i++) {
        let val = x[i] * parameters.m[parameters.m.length - 1] + parameters.b[parameters.b.length - 1];
        let rounded = Math.ceil(val * 1000) / 1000;
        y_vals.push(rounded);
    }

    let trace2 = {
        x: x,
        y: y_vals,
        mode: "lines",
        type: "scatter",
        name: "Predicted",
        hovertemplate: "(%{x}, %{y})",

        marker: {
            "color": "#4a6351"
        }
    }

    data.push(trace2)


    var layout = {
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
            color: "rgba(255,255,255,1)"
        },
        xaxis: {
            showgrid: false,
            showline: true,
        },
        yaxis: {
            showline: true,
            showgrid: false
        },
        height: 400,
        width: 400
    };

    Plotly.newPlot('graph', data, layout, { displayModeBar: false, responsive: true });

}

function generateData(parameters) {
    desc.innerHTML = "please enter training parameters. hit the train button when done.";

    console.log("Hey")
    let new_m_stat = document.getElementById("new_m")
    let new_b_stat = document.getElementById("new_b")

    new_m_stat.innerHTML = parameters.m[0]
    new_b_stat.innerHTML = parameters.b[0]

    let real_m_stat = document.getElementById("real_m")
    let real_b_stat = document.getElementById("real_b")

    real_m_stat.innerHTML = parameters.m_real
    real_b_stat.innerHTML = parameters.b_real

    xs = []
    ys = []
    for (let i = 0; i < parameters.points; i++) {
        let xv = Math.random();
        xs.push(xv)

        let y = (xv * parameters.m_real + parameters.b_real) + (Math.random() * parameters.noise);
        let y_round = Math.ceil(y * 1000) / 1000
        ys.push(y_round);
    }
    stats.classList.remove("hidden")
    graphData(xs, ys, parameters);
}



function train(xs, ys) {
    inputsDivs.classList.add("hidden")
    trainingStats.classList.remove("hidden")

    let i = 0;
    let paused = false;
    document.getElementById("pause").addEventListener("click", () => {
        paused = !paused;
        document.getElementById("pause").src = paused ? "assets/imgs/play.png" : "assets/imgs/pause.png"

    })
    let training = setInterval(() => {
        desc.innerHTML = "training in progress..."


        if (i < hyperparameters.epochs && paused === false) {
            resetBtn.addEventListener("click", () => {
                clearInterval(training)
                parameters = {

                    ...parameters,
                    m: [parameters.m[parameters.m.length - 1]],
                    b: [parameters.b[parameters.b.length - 1]]

                }

                hyperparameters = {
                    learning_rate: null,
                    epochs: null,
                    loss: [],
                    loss_partials_m: [],
                    loss_partials_b: []
                }
                inputsDivs.classList.remove("hidden")
                trainingStats.classList.add("hidden")
                for (let i = 0; i < dataInputBoxes.length; i++) {
                    dataInputBoxes[i].removeAttribute("disabled")
                }
                for (let i = 0; i < trainingInputBoxes.length; i++) {
                    trainingInputBoxes[i].removeAttribute("disabled")
                }
                showData.removeAttribute("disabled", "")
                trainBtn.removeAttribute("disabled", "")

            })
            optimizeData(xs, ys, parameters, hyperparameters);
            epoch.innerHTML = `epoch ${i + 1}`;
            i++;
        } else if (i >= hyperparameters.epochs) {

            clearInterval(training)
            desc.innerHTML = "training finished!"

        }

    }, 100)
}

function optimizeData(xs, ys) {
    stats.classList.remove("hidden")
    for (let i = 0; i < dataInputBoxes.length; i++) {
        dataInputBoxes[i].setAttribute("disabled", "")
    }
    for (let i = 0; i < trainingInputBoxes.length; i++) {
        trainingInputBoxes[i].setAttribute("disabled", "")
    }
    showData.setAttribute("disabled", "")
    trainBtn.setAttribute("disabled", "")
    let error = 0;
    let error_m = 0;
    let error_b = 0;

    for (let j = 0; j < xs.length; j++) {
        error += error_val(m_para, b_para, xs, j, ys) / xs.length;

        error_m += error_deriv_m(m_para, b_para, xs, j, ys)
        error_b += error_deriv_b(m_para, b_para, xs, j, ys)



    }
    error_m /= xs.length;
    error_b /= xs.length;

    m_para = m_para - (hyperparameters.learning_rate * (error_m))

    b_para = b_para - (hyperparameters.learning_rate * (error_b))

    hyperparameters.loss.push(error)
    hyperparameters.loss_partials_m.push(error_m);
    hyperparameters.loss_partials_b.push(error_b);
    parameters.m.push(m_para)
    parameters.b.push(b_para)
    graphData(xs, ys, parameters)

    updateTextData(parameters, hyperparameters);
    loss.innerHTML = `loss: ${Math.ceil(error * 1000) / 1000}`;

    updateTrainingData(parameters, hyperparameters)

    if (Math.abs(parameters.m[parameters.m.length - 1] - parameters.m[parameters.m.length - 2]) < Math.pow(10, -4) && Math.abs(parameters.b[parameters.b.length - 1] - parameters.b[parameters.b.length - 2]) < Math.pow(10, -4)) {
        i = hyperparameters.epochs;
    }


}



function updateTextData(parameters, hyperparameters) {
    let lossText = document.getElementById("lossStat")
    let m_stats = document.getElementsByClassName("m_stat")
    let new_m_stat = document.getElementsByClassName("new_m")
    let new_b_stat = document.getElementsByClassName("new_b")
    let b_stats = document.getElementsByClassName("b_stat");
    let mgrad = document.getElementsByClassName("mgrad")
    let bgrad = document.getElementsByClassName("bgrad");
    let learningRate = document.getElementById("learningRate");

    learningRate.innerHTML = hyperparameters.learning_rate;

    for (let i = 0; i < new_m_stat.length; i++) {
        new_m_stat[i].innerHTML = Math.ceil(parameters.m[parameters.m.length - 1] * 1000) / 1000

    }
    for (let i = 0; i < new_b_stat.length; i++) {
        new_b_stat[i].innerHTML = Math.ceil(parameters.b[parameters.b.length - 1] * 1000) / 1000


    }
    lossText.innerHTML = Math.ceil(hyperparameters.loss[hyperparameters.loss.length - 1] * 1000) / 1000

    for (let i = 0; i < m_stats.length; i++) {
        m_stats[i].innerHTML = Math.ceil(parameters.m[parameters.m.length - 2] * 1000) / 1000
    }
    for (let i = 0; i < b_stats.length; i++) {
        b_stats[i].innerHTML = Math.ceil(parameters.b[parameters.b.length - 2] * 1000) / 1000
    }
    for (let i = 0; i < mgrad.length; i++) {
        mgrad[i].innerHTML = Math.ceil(hyperparameters.loss_partials_m[hyperparameters.loss_partials_m.length - 1] * 1000) / 1000
    }
    for (let i = 0; i < bgrad.length; i++) {
        bgrad[i].innerHTML = Math.ceil(hyperparameters.loss_partials_b[hyperparameters.loss_partials_b.length - 1] * 1000) / 1000
    }
}


function updateTrainingData(parameters, hyperparameters) {

    let trace1 = {
        x: parameters.m,
        y: hyperparameters.loss,
        mode: "markers",
        type: "scatter",
        name: "Predicted",
        hovertemplate: `(%{x}, %{y})`,

        marker: {
            "color": "rgb(237, 200, 200)"
        }
    }



    var layout1 = {
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
            color: "rgba(255,255,255,1)"
        },
        xaxis: {
            title: "m",
            showgrid: false,
            showline: true,
        },
        yaxis: {
            title: "C",
            showline: true,
            showgrid: false
        },
        height: 300,
        width: 300
    };

    Plotly.newPlot('m_graph', [trace1], layout1, { displayModeBar: false, responsive: true });
    let trace2 = {
        x: parameters.m,
        y: hyperparameters.loss_partials_m,
        mode: "markers",
        type: "scatter",
        name: "Predicted",
        hovertemplate: `(%{x}, %{y})`,

        marker: {
            "color": "rgb(171, 142, 142);"
        }
    }

    var layout2 = {
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
            color: "rgba(255,255,255,1)"
        },
        xaxis: {
            title: "m",
            showgrid: false,
            showline: true,
        },
        yaxis: {
            title: "∂C/∂m",
            showline: true,
            showgrid: false
        },
        height: 300,
        width: 300
    };



    Plotly.newPlot('grad_m_graph', [trace2], layout2, { displayModeBar: false, responsive: true });
    let trace3 = {
        x: parameters.b,
        y: hyperparameters.loss,
        mode: "markers",
        type: "scatter",
        name: "Predicted",
        hovertemplate: `(%{x}, %{y})`,

        marker: {
            "color": "rgb(210, 215, 255);"
        }
    }

    var layout3 = {
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
            color: "rgba(255,255,255,1)"
        },
        xaxis: {
            title: "b",
            showgrid: false,
            showline: true,
        },
        yaxis: {
            title: "C",
            showline: true,
            showgrid: false
        },
        height: 300,
        width: 300
    };


    Plotly.newPlot('b_graph', [trace3], layout3, { displayModeBar: false, responsive: true });
    let trace4 = {
        x: parameters.b,
        y: hyperparameters.loss_partials_b,
        mode: "markers",
        type: "scatter",
        name: "Predicted",
        hovertemplate: `(%{x}, %{y})`,

        marker: {
            "color": "rgb(131, 135, 175);"
        }
    }


    var layout4 = {
        showlegend: false,
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: {
            color: "rgba(255,255,255,1)"
        },
        xaxis: {
            title: "b",
            showgrid: false,
            showline: true,
        },
        yaxis: {
            title: "∂C/∂b",
            showline: true,
            showgrid: false
        },
        height: 300,
        width: 300
    };

    Plotly.newPlot('grad_b_graph', [trace4], layout4, { displayModeBar: false, responsive: true });
}
