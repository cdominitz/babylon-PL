import { getObjectDict } from './dictionary.js';
import { getInfoDict } from './infoDict.js';

// put the path and name of room file here
const path = 'doc/';
const file = 'another_room.glb';

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);

// Dictionary to map object names to categories
var objectCategories = getObjectDict();
var infoDict = getInfoDict();

// Dictionary to store the assigned category for each object
var assignedCategories = {};

// Function to create the scene
var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    // Camera
    var camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(-150), BABYLON.Tools.ToRadians(65), 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    camera.target = new BABYLON.Vector3(0, 2, 0);

    // Set rotation limits for the camera
    camera.lowerBetaLimit = BABYLON.Tools.ToRadians(0); // Minimum inclination (from the ground)
    camera.upperBetaLimit = BABYLON.Tools.ToRadians(80); // Maximum inclination (looking downward)
    camera.lowerRadiusLimit = 3; // Minimum distance from the target
    camera.upperRadiusLimit = 15; // Maximum distance from the target
    
    // Set rotation limits around the y-axis
    camera.lowerAlphaLimit = BABYLON.Tools.ToRadians(-210); // Minimum rotation angle
    camera.upperAlphaLimit = BABYLON.Tools.ToRadians(-60);  // Maximum rotation angle
  

    // Light
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1;

    // Load the room mesh
    BABYLON.SceneLoader.ImportMesh("", path, file, scene, function (meshes) {
        // Iterate through meshes and assign categories
        for (var i = 0; i < meshes.length; i++) {
            var mesh = meshes[i];
            if (mesh.isPickable) {
                assignCategories(mesh);
            }
        }
    });

    return scene;
};

var scene = createScene();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});

function assignCategories(mesh){
    // Iterate through objectCategories and find the first matching category
    var matchedCategory = null;
    for (var category in objectCategories) {
        if (objectCategories.hasOwnProperty(category)) {
            var keywords = objectCategories[category];
            for (var j = 0; j < keywords.length; j++) {
                if (mesh.name.toLowerCase().includes(keywords[j])) {
                    matchedCategory = category;
                    break;
                }
            }
            // If a category is matched, break out of the loop, assign value
            if (matchedCategory) {
                assignedCategories[mesh.name] = [matchedCategory, infoDict[matchedCategory]];
                break;
            }
        }
    }

    // Assign the object name if no match is found
    if (!matchedCategory){
        assignedCategories[mesh.name] = [mesh.name,[]];
    }

    mesh.actionManager = new BABYLON.ActionManager(scene);
    mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
        displayObjectInfo(evt.meshUnderPointer.name);
    }));
}

// Function to display object information
function displayObjectInfo(objectName) {
    var objElement = document.getElementById("obj");
    var subCatElement = document.getElementById("subCat");
    var descElement = document.getElementById("desc");
    var linksElement = document.getElementById("links");

    var category = assignedCategories[objectName] || ["Unknown"];

    var { subCat, description, links } = (category[1] && typeof category[1] === 'object') ? category[1] : {};

    objElement.textContent = category[0];
    // subCatElement.textContent = subCat || "N/A";     (uncomment if subcategories are to be used)
    descElement.textContent = description || "More information coming soon!";
    linksElement.textContent = links || "N/A";
}


