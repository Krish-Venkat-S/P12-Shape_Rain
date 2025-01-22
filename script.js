var world, camera, scene, renderer, controls;
        var fixedTimeStep = 1/60;
        var maxSubSteps = 3;
        var lastTime;
        var meshes = [];
        var bodies = [];

        
        const colors = [
            0xFF0000, 
            0xFF7F00, 
            0xFFFF00, 
            0x00FF00, 
            0x0000FF, 
            0x4B0082, 
            0x9400D3  
        ];

        initCannon();
        initThree();
        createGround();
        animate();

        function initThree() {
            scene = new THREE.Scene();
            
            
            scene.fog = new THREE.FogExp2(0x000000, 0.02);

            camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.5, 1000);
            camera.position.set(0, 20, 20);
            camera.lookAt(new THREE.Vector3(0, 0, 0));

            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x000000);
            document.body.appendChild(renderer.domElement);

            
            const ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(10, 30, 20);
            scene.add(light);

            controls = new THREE.TrackballControls(camera, renderer.domElement);
            
            window.addEventListener('resize', onWindowResize, false);
        }

        function initCannon() {
            world = new CANNON.World();
            world.gravity.set(0, -20, 0);
            world.broadphase = new CANNON.NaiveBroadphase();
            world.solver.iterations = 10;
        }

        function createGround() {
            
            const groundShape = new CANNON.Plane();
            const groundBody = new CANNON.Body({ mass: 0 });
            groundBody.addShape(groundShape);
            groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI/2);
            world.add(groundBody);

            
            const groundGeo = new THREE.PlaneGeometry(100, 100, 20, 20);
            const groundMat = new THREE.MeshPhongMaterial({
                color: 0x222222,
                shininess: 80,
                wireframe: true
            });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.rotation.x = -Math.PI/2;
            ground.receiveShadow = true;
            scene.add(ground);
        }

        function addRandomSphere() {
            const radius = 1 + Math.random();
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            
            const sphereShape = new CANNON.Sphere(radius);
            const sphereBody = new CANNON.Body({ mass: 5 });
            sphereBody.addShape(sphereShape);
            sphereBody.position.set(
                (Math.random() - 0.5) * 10,
                20 + Math.random() * 10,
                (Math.random() - 0.5) * 10
            );
            world.add(sphereBody);
            bodies.push(sphereBody);

            
            const sphereGeo = new THREE.SphereGeometry(radius, 32, 32);
            const sphereMat = new THREE.MeshPhongMaterial({
                color: randomColor,
                shininess: 100
            });
            const sphere = new THREE.Mesh(sphereGeo, sphereMat);
            scene.add(sphere);
            meshes.push(sphere);
        }

        function addRandomBox() {
            const size = 1 + Math.random();
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            
            const boxShape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
            const boxBody = new CANNON.Body({ mass: 5 });
            boxBody.addShape(boxShape);
            boxBody.position.set(
                (Math.random() - 0.5) * 10,
                20 + Math.random() * 10,
                (Math.random() - 0.5) * 10
            );
            world.add(boxBody);
            bodies.push(boxBody);

            
            const boxGeo = new THREE.BoxGeometry(size, size, size);
            const boxMat = new THREE.MeshPhongMaterial({
                color: randomColor,
                shininess: 100
            });
            const box = new THREE.Mesh(boxGeo, boxMat);
            scene.add(box);
            meshes.push(box);
        }

        function addRandomCylinder() {
            const radius = 0.8 + Math.random() * 0.5;
            const height = 2 + Math.random();
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            
            const cylinderShape = new CANNON.Cylinder(radius, radius, height, 16);
            const cylinderBody = new CANNON.Body({ mass: 5 });
            cylinderBody.addShape(cylinderShape);
            cylinderBody.position.set(
                (Math.random() - 0.5) * 10,
                20 + Math.random() * 10,
                (Math.random() - 0.5) * 10
            );
            world.add(cylinderBody);
            bodies.push(cylinderBody);

            
            const cylinderGeo = new THREE.CylinderGeometry(radius, radius, height, 32);
            const cylinderMat = new THREE.MeshPhongMaterial({
                color: randomColor,
                shininess: 100
            });
            const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
            scene.add(cylinder);
            meshes.push(cylinder);
        }

        function resetScene() {
            
            for (let i = 0; i < bodies.length; i++) {
                world.remove(bodies[i]);
                scene.remove(meshes[i]);
            }
            bodies = [];
            meshes = [];
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            controls.handleResize();
        }

        function updatePhysics() {
            world.step(fixedTimeStep);
            
            
            for (let i = 0; i < bodies.length; i++) {
                meshes[i].position.copy(bodies[i].position);
                meshes[i].quaternion.copy(bodies[i].quaternion);
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            updatePhysics();
            controls.update();
            renderer.render(scene, camera);
        }