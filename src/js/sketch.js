import { CONSTANTS } from './constants.js';
import { DopplerModel } from './model/DopplerModel.js';
import { DopplerView } from './view/DopplerView.js';
import { DopplerController } from './controller/DopplerController.js';

let model, view, controller;

function setup() {
  createCanvas(800, 600);
  
  model = new DopplerModel();
  view = new DopplerView();
  controller = new DopplerController(model, view);
  
  model.initialize(width, height);
}

function draw() {
  controller.update();
}

function mousePressed() {
  controller.handleMouseInteraction(mouseX, mouseY, true);
}

function mouseReleased() {
  controller.handleMouseInteraction(mouseX, mouseY, false);
}

function keyPressed() {
  return controller.handleKeyPress(keyCode);
}