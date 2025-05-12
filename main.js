import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/Addons.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

//adds a camera and scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000035);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.z = 30;
camera.lookAt(1,1,1);

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
//const controls = new FirstPersonControls( camera, renderer.domElement );
//controls.movementSpeed = 5;
//controls.lookSpeed = 0.1;
const loader = new GLTFLoader();


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

//Geometry
const group = new THREE.Group();

function createNewWall(x, y, z, rotate = 0, width = 20, height = 10){
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
createNewWall(10, 5, 20);
createNewWall(10, 5, 0)
createNewWall(0, 5, 10, 1);
createNewWall(20, 5, 10, 1);
createNewWall(10, 0, 10, 2, 20, 20);
createNewBuilding(-10, 15, -15);
createNewBuilding(30, 5, -15);
createNewBuilding(-40, -10, 15);
createNewBuilding(50, 25, 15);
createNewBuilding(-10, 15, 45);
createNewBuilding(30, 5, 45);

const photos = new THREE.Group();

//how you create photos in space
function createPhotos(photo, x, y, z, name) {
	const textureLoad = new THREE.TextureLoader();
	const texture = textureLoad.load(photo);
	texture.colorSpace = THREE.SRGBColorSpace;

	const material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, map : texture, side: THREE.DoubleSide,});
	
	const geo = new THREE.PlaneGeometry(25, 25);
	const photoPlane = new THREE.Mesh(geo, material);
	photoPlane.name = name;
	photoPlane.position.set(x, y, z);
	photoPlane.userData.clicked = 0;
	
	return photoPlane;

}

//Creating a Group & Adding a Photo
const photo1 = createPhotos('images/pantryexterior.jpg', 5, 0, 21, 'welcome');
photos.add(photo1);
const photo2 = createPhotos('images/anniversary.png', 10, 10, 21, 'anniversary');
photos.add(photo2);
const photo3 = createPhotos('images/neverclose.png', 21, 10, 21, 'no key');
photo3.rotateY(Math.PI / 2);
photos.add(photo3);



scene.add(photos);
console.log("Children:", photos.children);

//Text and Captions Stuff
const captionGroup = new THREE.Group();


const p = document.createElement('p');
p.className = 'caption show';
p.textContent = "Welcome to the Pantry";
const captionContainer = document.createElement('div');
captionContainer.appendChild(p);

const label = new CSS2DObject(captionContainer);
label.visible = false;
photo1.add(label); //adds the text to the photo itself


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
	const intersections = raycaster.intersectObjects(photos.children, true);
	if (intersections.length > 0){
		const selectedObject = intersections[0].object; //returns the first object it collides with
		
		console.log("Clicked state:", selectedObject.userData.clicked);


		if (selectedObject.userData.clicked == 0){
			if (selectedObject.children.forEach(child => {
				if (child instanceof CSS2DObject) {
					child.visible = true;
				}
			}))
			//selectedObject.label.visible = true;
			p.className = 'caption hide'
			p.textContent = 'This is an example caption'
			selectedObject.userData.clicked = 1;
		}
		else {
			selectedObject.visible = false;

		}
		
	}

}


//sets up a render loop for our scene
function animate() {
	controls.update();
	renderer.render( scene, camera );
	labelRenderer.render(scene, camera);
  }
  renderer.setAnimationLoop( animate );
