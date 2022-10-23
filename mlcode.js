const URL = "https://teachablemachine.withgoogle.com/models/HixJX75kf/";

let model, webcam, labelContainer, maxPredictions;

    // Load the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    
    if (document.getElementById("webcam-container").hasChildNodes()) {
        document.getElementById("webcam-container").removeChild(webcam.canvas);
    }

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

        // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

    var instructionTextElement = document.createElement("p");
    var instructionTextText = document.createTextNode("Show the object to the webcam. Click the stop button to identify the object.");
    instructionTextElement.appendChild(instructionTextText);

    document.getElementById("stopCamButton").hidden = false;
    document.getElementById("instructions").appendChild(instructionTextElement);
    document.getElementById("startCamButton").hidden = true;

}

async function loop() {
    webcam.update(); // update the webcam frame
    
    window.requestAnimationFrame(loop);
}

async function stopCam() {
    webcam.stop();

    document.getElementById("stopCamButton").hidden = true;
    document.getElementById("startCamButton").hidden = false;
    document.getElementById("instructions").hidden = true;

    await predictLiveCam();

}

// run the webcam image through the image model
async function predictLiveCam() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability.toFixed(2) > 0.5) {
            var classPrediction = prediction[i].className + " (" + (prediction[i].probability.toFixed(2)) * 100 + "% confidence)";
        }

        else if (prediction[i].probability.toFixed(2) < 0.5) {
            var classPrediction = "";
        }

        labelContainer.childNodes[i].innerHTML = classPrediction;
        
    }
}
