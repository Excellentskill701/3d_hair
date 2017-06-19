
var Render = function ()
{
	var main 		 	= this;
	main.canvID     	= "";
	main.scene 			= null;
	main.camera 		= null;
	main.sWidth			= 0;
	main.sHeight		= 0;
	main.fWidth			= $(document).width();
	main.fHeight		= $(document).height();
	main.renderer 		= null;
	main.container 		= null;
	main.sPos        	= {x : 0, y : 0};

	main.isDrag			= 0;
	main.minPolarAngle  = -Math.PI / 2;
	main.maxPolarAngle  =  Math.PI / 2;

	main.clock 			= new THREE.Clock();

	main.floor 			= null;
	main.bathRoom 		= null;
	main.animations 	= null;

	main.cssScene 		= null;
	main.rendererCSS 	= null;

	main.orbitControls 	= null;

	main.init			= function(param) 
	{
		main.canvID		= param.canvID;
		main.sWidth		= main.fWidth;
		main.sHeight	= main.fHeight;

		//init 3d environment
		main.init3DEnv();
		main.animate();
		// main.initFloor();
		main.initBathRoom();
	}

	main.initFloor 		= function () 
	{
		var grid 		= document.createElement("canvas");
		var context 	= grid.getContext("2d");

		grid.width = grid.height = 128;

		context.fillStyle = "#fff";
		context.fillRect(0, 0, 128, 128);
		context.fillStyle = "#000";
		context.fillRect(0, 0, 64, 64);
		context.fillStyle = "#999";
		context.fillRect(32, 32, 32, 32);
		context.fillStyle = "#000";
		context.fillRect(64, 64, 64, 64);
		context.fillStyle = "#555";
		context.fillRect(96, 96, 32, 32);

		var texture 	= new THREE.CanvasTexture(grid);
		texture.repeat.set( 10, 10 );
		texture.wrapS 	= THREE.RepeatWrapping;
		texture.wrapT 	= THREE.RepeatWrapping;

		var material 	= new THREE.MeshBasicMaterial( { map: texture } );

		main.floor 		= new THREE.PlaneBufferGeometry( 100, 100, 15, 10 );

		var mesh = new THREE.Mesh( main.floor, material );
		mesh.position.set( 0, groundPos, 0 );
		mesh.rotation.x = - Math.PI / 2;
		mesh.scale.set( 7, 7, 7 );
		main.scene.add( mesh );

	}

	main.initBathRoom 	= function ()
	{
		// main.loadJson(
		// {
		// 	name	: "jsAnimation",
		// 	json 	: "untitled-scene.json"	
		// });	
		// main.loadCollada(
		// {
		// 	name	: "dae",
		// 	collada : "avatar.dae"	
		// });	
		// main.loadFbx(
		// {
		// 	name 	: "fbx",
		// 	fbx 	: "jessie_ipad.fbx"
		// });
		// main.loadBabylon(
		// {
		// 	name 	: "babylon",
		// 	babylon : "untitled-scene.babylon"
		// });
	    main.loadObject(
	    {
	    	name 	: "new",
			// mtl 	: "Hair_Wavy_Long(noMorphs).mtl",
			// obj 	: "Hair_Wavy_Long(noMorphs).obj"
			mtl 	: "new.mtl",
			obj 	: "new.obj"
	    }, function(object) 
	    {
	    	object.traverse( function( node ) 
			{
				node.castShadow 	= true;
				node.receiveShadow 	= true;
				
                if( node.material ) 
                {
console.log("123123123");
					// node.material = new THREE.MeshBasicMaterial({color : 0x333333});
					var map = node.material.map;
					
					// node.material = new THREE.MeshBasicMaterial({map : map});
					node.material.shading = 0.1;
					node.material.shiness = 100;
					node.material.reflectivity = 2;
					node.material.refractionRatio = 0.95;
                    node.material.side = THREE.DoubleSide;
                    node.material.depthWrite 	= true;
					node.material.alphaTest 	= 0.95;
                }
            });
	    	object.scale.set(1, 1, 1);
	    	object.position.y = 0;
	    	console.log(object);
	    	main.scene.add(object);
	    });
	}

	main.init3DEnv		= function ()
	{
		main.scene  	= new THREE.Scene();

	    main.initCamera();
	    main.initLights();
	    main.initRenderer();
	    main.initEvent();
	    main.initControls();
	}

	main.onWindowResize = function () 
	{
		if (main.camera != undefined && main.renderer != undefined) 
		{
			main.camera.aspect = window.innerWidth / window.innerHeight;
			main.camera.updateProjectionMatrix();

			main.renderer.setSize( window.innerWidth, window.innerHeight );
		}
	}

	main.onMouseDown 	= function (event) 
	{
		return;
		main.isDrag = 1;
	    main.sPos   = {x : event.screenX, y : event.screenY};
	}

	main.onMouseMove 	= function (event) 
	{
		return;
		if(!main.isDrag) return;

	    var angle_y = (event.screenX - main.sPos.x) / document.body.clientWidth  * Math.PI;
	    var angle_x = (event.screenY - main.sPos.y) / document.body.clientHeight * Math.PI;
	    var raycaster   = new THREE.Raycaster();
	    var mouse   = {x : 0, y : 0};

	    mouse.x     =  ((event.clientX - main.renderer.domElement.offsetLeft) / main.renderer.domElement.width) * 2 - 1;
	    mouse.y     = -((event.clientY - main.renderer.domElement.offsetTop) / main.renderer.domElement.height) * 2 + 1;

	    main.camera.rotation.order = 'YXZ';
	    main.camera.rotation.x = Math.max(main.minPolarAngle, Math.min(main.maxPolarAngle, angle_x + main.camera.rotation.x));
	    main.camera.rotation.y += angle_y;

	    main.cameraTrackPosition();

	    main.sPos = {x : event.screenX, y : event.screenY};
	}

	main.onMouseUp 		= function (event)
	{
	    main.isDrag = 0;
	}

	main.onDocumentMouseWheel 	= function (event) 
	{
		return;
	    var direction = main.camera.getWorldDirection();
	    main.camera.position.add( direction.multiplyScalar(event.wheelDeltaY * 0.05) );
	    main.cameraTrackPosition();
	}

	main.initEvent 		= function()
	{
		return;
	    document.addEventListener( 'mousedown', main.onMouseDown, false );
	    document.addEventListener( 'mouseup', main.onMouseUp, false );
	    document.addEventListener( 'mousemove', main.onMouseMove, false );
	    document.addEventListener( 'mousewheel', main.onDocumentMouseWheel, false );
	    
	    window.addEventListener( 'resize', main.onWindowResize, false );
	}
	
	var t = 0;
	var progress = 0;
	var lastTimestamp = 0;

	main.animate		= function ( timestamp )
	{
	    requestAnimationFrame( main.animate );
	    main.render();
	}

	main.render 		= function ()
	{
		main.orbitControls.update();
		THREE.AnimationHandler.update( main.clock.getDelta() );

		if (main.mixer)
		{
			main.mixer.update(main.clock.getDelta())
		}
		
	    main.renderer.render( main.scene, main.camera );
	}

	main.initCamera 	= function ()
	{
	    var angle   = 45;
	    var near    = 0.1;
	    var far     = 500;
	    var aspect  = main.sWidth / main.sHeight;

	    main.camera = new THREE.PerspectiveCamera( angle, aspect, near, far);

	    main.scene.add(main.camera);
	}

	main.initLights 	= function ()
	{
		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
        hemiLight.color.setHSL( 0.5, 0.16, 0.97 );
        hemiLight.groundColor.setHSL( 0.77, 0.51, 0.91 );
        hemiLight.position.set( 0, 500, 0 );
        main.scene.add( hemiLight );

        main.addLight(50, 100, 155, 0xaaaaaa, 1);
        // main.addShadowedLight( -50, 100, -155, 0xaaaaaa, 1 );
        // main.addShadowedLight( 350, 50, 350, 0xffffff, 1 );
        // main.addShadowedLight( 150, 100, 250, 0x0000AA, 0.75 );
	}

	main.addLight 			= function(x, y, z, color, intensity) 
	{
		var directionalLight 	= new THREE.DirectionalLight( color, intensity );
	    directionalLight.position.set( x, y, z ).normalize();

	    directionalLight.castShadow = false;

	    main.scene.add( directionalLight );

	    // main.scene.add( new THREE.DirectionalLightHelper( directionalLight, 50 ) );

	}

	main.addShadowedLight	= function ( x, y, z, color, intensity ) 
	{
	    var directionalLight 	= new THREE.DirectionalLight( color, intensity );
	    directionalLight.position.set( x, y, z );
	    
	    directionalLight.castShadow = true;
	    directionalLight.shadowCameraVisible = true;

	    var d = 150;
	    directionalLight.shadowCameraLeft = -d;
	    directionalLight.shadowCameraRight = d;
	    directionalLight.shadowCameraTop = d;
	    directionalLight.shadowCameraBottom = -d;
	    directionalLight.shadowCameraNear = 10;
	    directionalLight.shadowCameraFar = 500;
	    directionalLight.shadow.mapSize.width = 4096;
	    directionalLight.shadow.mapSize.height = 4096;
	    directionalLight.shadowBias = -0.00000000015;

	    main.scene.add( directionalLight );

	    main.scene.add( new THREE.DirectionalLightHelper( directionalLight, 50 ) );
	    main.scene.add( new THREE.CameraHelper( directionalLight.shadow.camera ) );
	    // directionalLight
	}

	main.initRenderer 	= function ()
	{
	    if ( !Detector.webgl )
	    {
	        alert("Your browser doesn't support webgl!");
	    }
	    if ( Detector.webgl )
	    {
	        main.renderer = new THREE.WebGLRenderer({antialias:true, preserveDrawingBuffer : true});
	    }
	    else
	        main.renderer = new THREE.CanvasRenderer({antialias:true, preserveDrawingBuffer : true}); 

	    main.renderer.setSize(main.sWidth, main.sHeight);

	    main.renderer.gammaInput = true;
	    main.renderer.gammaOutput = true;
	    main.renderer.shadowMapEnabled = true;
	    main.renderer.shadowMapCascade = true;
	    main.renderer.shadowMapType = THREE.PCFSoftShadowMap;
	    main.renderer.setClearColor( 0xFFFFFF);

	    main.container = document.getElementById(main.canvID);
	    main.container.appendChild(main.renderer.domElement);
	}

	main.initControls 	= function ()
	{
	    main.orbitControls          	= new THREE.OrbitControls(main.camera, main.renderer.domElement);
	     main.orbitControls.enabled  = true
        // main.orbitControls.maxDistance 	= 2000;
	}

	main.cameraTrackPosition 	= function () 
	{
		return;
	    if (main.camera != undefined) {
	        console.log("Camera Position ");
	        console.log(main.camera.position);
	        console.log("Camera Rotation ");
	        console.log(main.camera.rotation);
	    }
	}

	main.mouseDownWorldPosition	= function (event)
	{
		return;
		var vector = new THREE.Vector3();

		vector.set(
		    ( (event.clientX  - main.renderer.domElement.offsetLeft) / window.innerWidth ) * 2 - 1,
		    - ( (event.clientY  - main.renderer.domElement.offsetLeft) / window.innerHeight ) * 2 + 1,
		    0.5
		    );
		vector.unproject( main.camera );

		var dir = vector.sub( main.camera.position ).normalize();
		var distance = - (main.camera.position.y + 50) / dir.y;
		var pos = main.camera.position.clone().add( dir.multiplyScalar( distance ) );
		console.log("-----------world position-------------");
		console.log("x: " + pos.x + ", y: " + pos.y + ", z: " + pos.z);
	}

	main.loadGltf 				= function (param, complete) 
	{
		var loader = new THREE.GLTFLoader();

		var url = 'obj/' + param.name + "/" + param.gltf;
		loader.load(url, function (data) 
		{
			var object 		= data.scene;
			console.log(object);

			object.position.x = 0;
			object.position.y = 100;
			object.position.z = 0;

			var animations	= data.animations;
			var mixer 		= null;
			if (animations && animations.length) 
			{
				mixer 		= new THREE.AnimationMixer(object);
				for (var i = 0; i < animations.length; i ++)
				{
					var animation 		= animations[i];
					animation.duration 	= 2000;
					mixer.clipAction( animation ).play(); 
				}
			}

			main.scene.add(object);
		});
	}

	main.loadFbx 				= function (param, complete)
	{
		var loader = new THREE.FBXLoader();

		var onProgress  = function ( xhr ) {};
	    var onError     = function ( xhr ) {};

	    loader.load( 'obj/' + param.name + "/" + param.fbx, function( object ) 
	    {

			object.traverse( function( child ) {

				if ( child instanceof THREE.Mesh ) {

					// pass

				}

				if ( child instanceof THREE.SkinnedMesh ) {

					if ( child.geometry.animations !== undefined || child.geometry.morphAnimations !== undefined ) {

						child.mixer = new THREE.AnimationMixer( child );
						mixers.push( child.mixer );

						var action = child.mixer.clipAction( child.geometry.animations[ 0 ] );
						action.play();

					}

				}

			} );

			main.scene.add( object );


		}, onProgress, onError );
	}

	main.mixer = null;

	main.loadJson 				= function (param, complete)
	{
		var objectLoader = new THREE.ObjectLoader();
		objectLoader.load('obj/' + param.name + "/" + param.json, function ( obj ) {
			console.log(obj);
			obj.traverse(function (node) {
				// console.log(node);
				// node.material.morphTargets = true;
			});
		 	main.scene.add( obj );

		 	main.mixer = new THREE.AnimationMixer( main.scene );

			main.mixer.clipAction( obj.animations[0] ).play();
			console.log(main.mixer);

		} );
	}

	main.loadBabylon			= function (param, complete)
	{
		var loader = new THREE.BabylonLoader();

		var onProgress  = function ( xhr ) {};
	    var onError     = function ( xhr ) {};

	    loader.load( 'obj/' + param.name + "/" + param.babylon, function( babylonScene ) 
	    {

	    	console.log(babylonScene.children[0]);
			main.scene.add( babylonScene.children[0] );

		}, onProgress, onError );
	}

	main.loadCollada			= function (param, complete) 
	{
		var loader	= new THREE.ColladaLoader();

	    loader.load('obj/' + param.name + "/" + param.collada, function (collada)
	    {
	    	var dae = collada.scene;

	    	dae.traverse( function ( child ) 
	    	{
				// console.log(child);
			} );

			dae.scale.x = dae.scale.y = dae.scale.z = 10;
			dae.rotation.x -= Math.PI / 2;

	    	main.scene.add(dae);
	    });
	}

	main.loadObject 			= function (param, complete) 
	{
		var mtlLoader   = new THREE.MTLLoader();
   		var objLoader   = new THREE.OBJLoader();

   		var onProgress  = function ( xhr ) {};
	    var onError     = function ( xhr ) {};

	    mtlLoader.setPath( 'obj/' + param.name + "/" );

	    mtlLoader.load(param.mtl, function(materials) 
	    {
	        materials.preload();

	        objLoader.setPath( 'obj/' + param.name + "/" );
	        objLoader.setMaterials(materials);

	        objLoader.load( param.obj, function ( object ) 
	        {
	        	if (complete == undefined) 
	        	{
	        		main.scene.add( object );
	        	}
	        	else 
	        	{
	        		complete( object );
	        	}
	        }, onProgress, onError);
	    });
	}

	main.cameraMove 			= function (targetPosition, targetRotation, complete, duration, delay)
	{
	    var tween = new TWEEN.Tween( main.camera.position )
	    .to( 
	    {
	        x : targetPosition.x,
	        y : targetPosition.y,
	        z : targetPosition.z
	    }, duration )
	    .easing( TWEEN.Easing.Exponential.InOut )
	    .onComplete( complete );

	    if (delay != undefined)
	        tween.delay(delay);
	    tween.start();

	    main.camera.rotation.x = (main.camera.rotation.x + Math.PI) % (Math.PI * 2) - Math.PI;
	    main.camera.rotation.y = (main.camera.rotation.y + Math.PI) % (Math.PI * 2) - Math.PI;
	    main.camera.rotation.z = (main.camera.rotation.z + Math.PI) % (Math.PI * 2) - Math.PI;

	    var tween = new TWEEN.Tween( main.camera.rotation )
	    .to( 
	    {
	        x : (targetRotation.x + Math.PI) % (Math.PI * 2) - Math.PI,
	        y : (targetRotation.y + Math.PI) % (Math.PI * 2) - Math.PI,
	        z : (targetRotation.z + Math.PI) % (Math.PI * 2) - Math.PI
	    }, duration )
	    .easing( TWEEN.Easing.Exponential.InOut );

	    if (delay != undefined)
	        tween.delay(delay);
	    tween.start();
	}
}