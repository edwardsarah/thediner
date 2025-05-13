import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/Addons.js';
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';

//adds a camera and scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000035);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 5, 1000 );
camera.position.z = 40;
camera.position.y = 20;

//sets up the renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//set up CSS renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);


//sets up controls
const controls = new OrbitControls( camera, renderer.domElement );
const loader = new GLTFLoader();

function loadModel(path,  x, y ,z, scalex = 0.05, scaley = 0.05, scalez=0.05, rotateY = false, rotateZ= false){
	loader.load(path, (gltfScene) => {
		const model = gltfScene.scene;

	
		model.traverse((child) => {
			if (child.isMesh) {
				const edges = new THREE.EdgesGeometry( child.geometry ); 
				edges.scale(scalex, scaley, scalez);
				edges.translate(x, y, z);
				if (rotateY){
					edges.rotateY(Math.PI/2);
				}
				if (rotateZ){
					edges.rotateZ(Math.PI/2);
				}
				const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) )
				scene.add(line);
			}
		  });
	
	});

}

loadModel('./images/diner_counter/scene.gltf', 10, 3, -15, 0.04, 0.04, 0.04);
loadModel('./images/diner_door/scene.gltf', -15, 0, 15, 0.05, 0.05, 0.05, true);
loadModel('./images/table/scene.gltf', -10, 0, 0, 0.01, 0.01, 0.01, true, true);
loadModel('./images/table/scene.gltf', -10, 10, 0, 0.01, 0.01, 0.01, true, true);
loadModel('./images/diner_chair/scene.gltf', -10, 0, 4, 0.07, 0.07, 0.07, true);
loadModel('./images/diner_chair/scene.gltf', -14, 0, 4, 0.07, 0.07, 0.07, true);


//sets up lighting
const light = new THREE.DirectionalLight();
light.intensity = 2;
light.position.set(2, 5, 10);
light.castShadow = true;
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.1));

const raycaster = new THREE.Raycaster();
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousedown', onMouseDown);

//set up Bloom
const renderScene = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
const bloomPass = new UnrealBloomPass(
	new THREE.Vector2(window.innerWidth, window.innerHeight), 1.6, 0.1, 0.1
)
bloomPass.strength = 0.1;
composer.addPass(bloomPass);
//Geometry
const walls = new THREE.Group();

function createNewWall(x, y, z, rotate = 0, width = 30, height = 15){
	const geometry = new THREE.PlaneGeometry( width, height );
	const material = new THREE.MeshBasicMaterial( {color: 0x000035, side: THREE.DoubleSide} );
	const plane = new THREE.Mesh( geometry, material );
	const edges = new THREE.EdgesGeometry( geometry ); 
	const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
	line.position.set(x, y, z);

	if (rotate == 1) {
		plane.rotateY(Math.PI/2);
		line.rotateY(Math.PI/2);
	}

	if (rotate == 2){
		plane.rotateX(Math.PI/2);
		line.rotateX(Math.PI/2);
	}

	scene.add(line)
	plane.position.set(x, y, z);
	walls.add(plane);
	scene.add(plane);
}

function createNewBuilding(x, y, z){
	const geometry = new THREE.BoxGeometry(30, 70, 20);
	//const material = new THREE.MeshBasicMaterial( {color: 0x000035, side: THREE.DoubleSide} );
	//const building = new THREE.Mesh( geometry, material );
	const edges = new THREE.EdgesGeometry( geometry ); 
	const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
	
	line.position.set(x, y, z);
	scene.add(line)
	//building.position.set(x, y, z);
	//scene.add(building);
}

//building the landscape
createNewWall(0, 7.5, 15);
createNewWall(0, 7.5, -15)
createNewWall(15, 7.5, 0, 1);
createNewWall(-15, 7.5, 0, 1);
createNewWall(0, 0, 0, 2, 30, 30);
createNewBuilding(-20, 15, -35);
createNewBuilding(30, 5, -35);
createNewBuilding(-40, -10, 15);
createNewBuilding(50, 25, 15);
createNewBuilding(-10, 15, 45);
createNewBuilding(30, 5, 45);

const photos = new THREE.Group();

//how you create photos in space
function createPhotos(photo, x, y, z, name, captionText='hello', ratio = 1) {
	const textureLoad = new THREE.TextureLoader();
	const texture = textureLoad.load(photo);
	texture.colorSpace = THREE.SRGBColorSpace;

	const material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, map : texture, side: THREE.DoubleSide,});
	
	const height = 10;


	const geo = new THREE.PlaneGeometry(height*ratio, height);
	const photoPlane = new THREE.Mesh(geo, material);
	photoPlane.name = name;
	photoPlane.position.set(x, y, z);
	photoPlane.userData.clicked = 0;

	//adding the caption
	const p = document.createElement('p');
	p.className = 'caption show';
	p.textContent = captionText;
	const captionContainer = document.createElement('div');
	captionContainer.appendChild(p);

	const label = new CSS2DObject(captionContainer);
	label.visible = false;
	label.position.set(0, -photoPlane.geometry.parameters.height / 2, 0.1);
	photoPlane.add(label); //adds the text to the photo itself
	
	return photoPlane;

}

//Creating a Group & Adding a Photo
const start = createPhotos('images/pantryexterior.jpg', -8, 10, 21, 'welcome', 'Welcome to the Diner. Click on Photos to reveal text.', 1.48);
photos.add(start);
const line = createPhotos('images/theline.jpg', 8, 5, 19, 'line', 'The line snakes around the block. You think this is a problem because before coming here, your only context for lines is pastel pink coffee shops and ramen bars that serve more hype than substance. \n The city might be made for this - all sunny weather nearly every day of the year - but you are not used to being outside for longer than it takes to shuffle from parked car to air-conditioned interior. These days, you can join waiting lists from your phone. \n The line shuffles forward faster than you expect, the doors never shutting for more than a few seconds. It’s alright, you’ll be inside soon.', 1.48);
photos.add(line);
const photo2 = createPhotos('images/anniversary.png', 10, 15, 16, 'anniversary', 'This used to make you so proud. \nYou thought this place would be infinite.', 1.83);
photo2.scale.set(0.5, 0.5, 1);
photos.add(photo2);
const photo3 = createPhotos('images/neverclose.png', 15.5, 10, -4, 'no key', 'You are 23 and you’ve never owned anything in your life. It’s been six years since you’ve gone more than a few months without wondering what comes next. \n There’s never time to collect anything. Never time to be anyone other than a visitor. You are a ghost in your own skin. \n When you’re locked in the airplane bathroom, trying not to throw up in the sink, you remember that there’s a door here that’s always open. A light always flickering on.', .52);
photo3.rotateY(Math.PI / 2);
photo3.scale.set(2, 2, 1);
photos.add(photo3);
const table = createPhotos('images/viewfromback.jpg', 0, 10, 14, 'table', 'There are parts of the city that are yours. The places you grew up, held in your own hands, made into something that fits you. The other parts are borrowed. \n Whole swaths of the city that feel less like ‘Los Angeles’ and more like a quilt of cut up hand-me-downs - where dad got that horrible statue from, where mom went to high school. Things that aren’t yours, but that you carry anyway. \n This place is Dad’s.  \nYou think about him in that old photo. Being 17. His uncle in aviator sunglasses and a beard that turns his head into one big oval. Driving out across the country and leaving his tiny town behind. \n Doesn’t it hurt to leave? \nDoes it hurt more to come back? ', 1.5);
//table.rotateY(Math.PI * 7/ 8);
table.scale.set(1.5, 1.5, 1);
photos.add(table);
const food = createPhotos('images/food.jpg', -9, 11, 8, 'food', 'A Stack of Pancakes. Eggs. Sourdough Toast. Ice Water in a Plastic Cup. \n You didn’t believe him when he said these were the best pancakes in town. You weren’t even old enough to drive, then. Still young enough to think you knew everything about the world.  \n It took one bite to shut you up. The moment this place became yours. You’re still telling people about the pancakes here.', 1.5);
food.rotateY(Math.PI / 2);
food.scale.set(0.8, 0.8, 1);
photos.add(food);
const coffee = createPhotos('images/coffeemug.jpg', -14, 8, 3, 'coffee', '‘WE NEVER CLOSE’ \n It feels like a promise. It’s broken, now. ');
coffee.rotateY(Math.PI / 2);
coffee.scale.set(0.6, 0.6, 1);
photos.add(coffee);
const counter = createPhotos('images/counter.jpg', 3, 8, -12, 'counter', 'You like sitting at the counter because he did. There is no hiding at the counter - a place for the real fans of breakfast, who will eat their french toast jammed into awkward corners, let their legs dangle from seats too high off the floor. You’ve never understood wanting to wait for a table. What’s the point of a diner if you can’t see it living and breathing?', 1.5);
counter.scale.set(1.5, 1.5, 1);
photos.add(counter);
const menu = createPhotos('images/menu.jpg', 0, 20, 0, 'menu', 'You have always liked the menus here. When you manage to catch them just between breakfast and lunch, you watch, transfixed, as they slide the new boards into the slots on the walls. It’s efficient. The sort of optimization you only need when you’ve got this many people to feed. \n You don’t really need to look at it. You know what you’re getting. It’s been on your mind since you booked your flight. Maybe if you were here more often, you’d be sick of it by now. But today, this is what it means to be home. \nTrying new things is what next time is for.', 1.28);
menu.rotateY(Math.PI / 2);
photos.add(menu);
const server = createPhotos('images/alejandro.jpg', -6.5, 5, -14, 'server', 'She doesn’t need to know your name to know you. She’s seen you grow six inches and you’ve seen her climb from one rung of the ladder up to the next. \n She pretends to write down Dad’s drink order like she doesn’t already know it, and asks you how you like your eggs just in case you’ve changed your mind. \n An anchor that keeps you from floating adrift.', 1.5);
photos.add(server);
const cashierDesk = createPhotos('images/cashier.jpeg', 12, 7, -3, 'cashier', 'This is not supposed to be the ending. This is part of the ritual. Paper check in hand, you rise from your seat, fish the dollars out of your pocket and slide them over to the cashier. Count out the singles you’ve got left to make sure you can still tip the parking attendant. \n You say goodbye because it’s the right thing to do. There’s still that line trailing out the door, and they’re waiting for you. \n Are you ready to leave?', 1.5);
cashierDesk.scale.set(1.2, 1.2, 1);
cashierDesk.rotateY(-Math.PI / 2);
photos.add(cashierDesk);
const exit = createPhotos('images/lockeddoor.jpg', 14.5, 5, 7, 'exit', 'There still is no lock on the doors. Instead, they’ve wrapped a chain around the front of them to keep people out. Now, on the inside, everything is quiet. Still. \n You never thought you’d outlive this diner.', 1.33);
exit.rotateY(Math.PI / 2);
photos.add(exit);
//todo
//const ending = createPhotos('images/coffeemug.jpg', -3, 4, 12, 'coffee', 'i thought this place never closed');
//coffee.rotateY(Math.PI * 3 / 4);
//photos.add(coffe);

scene.add(photos);
console.log("Children:", photos.children);

//Text and Captions Stuff
//const captionGroup = new THREE.Group();


window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	labelRenderer.setSize(window.innerWidth, window.innerHeight);
});


function onMouseDown(event){

	const pointer = new THREE.Vector2(
		( event.clientX / renderer.domElement.clientWidth ) * 2 - 1,
		- ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1
	);

	raycaster.setFromCamera( pointer, camera );
	const intersections = raycaster.intersectObjects(photos, true);
	if (intersections.length > 0){
		const selectedObject = intersections[0].object; //returns the first object it collides with
		
		console.log("Clicked state:", selectedObject.userData.clicked, selectedObject.name);

		if (photos.children.includes(selectedObject)){
			if (selectedObject.userData.clicked == 0){
				selectedObject.children.forEach(child => {
					if (child instanceof CSS2DObject) {
						child.visible = true;
						child.element.firstChild.className = 'caption show';
					}
				})
				selectedObject.userData.clicked = 1;
			}
			else {
				selectedObject.children.forEach(child => {
					if (child instanceof CSS2DObject) {
						child.element.firstChild.classList.add('hide');
						child.element.firstChild.classList.remove('show');
					}
				})
				selectedObject.visible = false; //may change this later!
				photos.remove(selectedObject);
	
			}
		}
		
	}

}


//sets up a render loop for our scene
function animate() {
	controls.update();
	composer.render( scene, camera );
	labelRenderer.render(scene, camera);
  }
  renderer.setAnimationLoop( animate );
