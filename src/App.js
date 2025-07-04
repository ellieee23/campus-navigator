import React, { useState, useEffect, useRef } from 'react';

// Function to convert a building name into a URL-friendly slug
const toSlug = (name) => {
    return name.toLowerCase().replace(/ building/g, '').replace(/ office/g, '').replace(/ /g, '-');
};

// Function to convert a slug back to a display name
const fromSlug = (slug) => {
    // Special handling for "centennial" to add "Building"
    if (slug === 'centennial') {
        return 'CENTENNIAL BUILDING';
    }
    // Handle "office"
    if (slug.includes('cashier') || slug.includes('registrar')) {
        const parts = slug.split('-');
        const capitalizedParts = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1));
        return capitalizedParts.join(' ') + ' Office';
    }
    const parts = slug.split('-');
    const capitalizedParts = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1));
    return capitalizedParts.join(' ') + ' BUILDING';
};


// Main App component
const App = () => {
    // State to manage the current view (home, navigating)
    const [currentPage, setCurrentPage] = useState('home');
    // State to store the selected destination (full name)
    const [selectedDestination, setSelectedDestination] = useState('');
    // State to store the navigation steps for the chosen route
    const [navigationSteps, setNavigationSteps] = useState([]);
    // State to manage messages displayed to the user
    const [message, setMessage] = useState('');

    // State for the animated marker's position (x, y coordinates relative to map container)
    const [animatedMarkerPosition, setAnimatedMarkerPosition] = useState({ x: 0, y: 0 });
    // State for the animated marker's rotation
    const [animatedMarkerRotation, setAnimatedMarkerRotation] = useState(0);
    // State to control visibility of the marker
    const [showAnimatedMarker, setShowAnimatedMarker] = useState(false);

    // State to control the visibility of the building photo modal
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    // State to store the URL of the image/video to display in the modal
    const [modalContentUrl, setModalContentUrl] = useState('');
    // State to determine if the modal content is a video (for playing)
    const [isModalContentVideo, setIsModalContentVideo] = useState(false);

    // Ref for the map container to get its dimensions
    const mapContainerRef = useRef(null);
    const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });

    // Update map dimensions on resize or when component mounts
    useEffect(() => {
        const updateDimensions = () => {
            if (mapContainerRef.current) {
                setMapDimensions({
                    width: mapContainerRef.current.offsetWidth,
                    height: mapContainerRef.current.offsetHeight
                });
                console.log("Map Container Dimensions:", mapContainerRef.current.offsetWidth, mapContainerRef.current.offsetHeight);
            }
        };

        updateDimensions(); // Set initial dimensions
        window.addEventListener('resize', updateDimensions);
        // Also ensure dimensions are updated if the map image/video itself loads later,
        // although mapContainerRef dimensions usually available before content.
        const mediaElement = mapContainerRef.current?.querySelector('img, video');
        if (mediaElement) {
            mediaElement.onload = updateDimensions; // For images
            mediaElement.onloadeddata = updateDimensions; // For videos
        }

        return () => {
            window.removeEventListener('resize', updateDimensions);
            if (mediaElement) {
                mediaElement.onload = null;
                mediaElement.onloadeddata = null;
            }
        };
    }, []);


    // Define the available campus destinations for Cebu Technological University
    // and their hypothetical routes from a central 'Main Entrance'.
    // mapPosition coordinates are percentages relative to the map image.
    const campusDestinations = [
        {
            name: 'CCICT BUILDING',
            route: [
                'Start at the Back Gate.',
                'Walk straight.',
                'Turn LEFT',
                'slight deviation to the left',
                'The CCICT BUILDING will be in your front',
            ],
            mapPosition: { top: '35%', left: '60%' },
            mapImageUrl: '', // Set to empty string as we use video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609188/CCICT_BUILDING_iyvr6l.mp4',
            photoUrl: 'https://res.cloudinary.com/dtvbrh783/image/upload/v1751608654/ict_zg7255.jpg',
            isPhotoVideo: false, // Indicate if photoUrl is a video
            pathCoordinates: [
                { x: 20, y: 90 },
                { x: 35, y: 75 },
                { x: 50, y: 60 },
                { x: 65, y: 45 },
                { x: 75, y: 30 }
            ]
        },
        {
            name: 'ENGINEERING BUILDING',
            route: [
                'Start at the Back Gate.',
                'Walk straight',
                'Turn left at the second corner near the tennis court',
                'You have arrived at the ENGINEERING BUILDING.'
            ],
            mapPosition: { top: '70%', left: '25%' },
            mapImageUrl: '', // Set to empty as using video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609245/ENGINEERING_BUILDING_qy73dm.mp4',
            photoUrl: '', // Removed photo URL to hide "View Building Photo" button
            isPhotoVideo: false,
            pathCoordinates: [ // Sample path for animation
                { x: 10, y: 10 },
                { x: 30, y: 20 },
                { x: 50, y: 30 },
                { x: 70, y: 40 }
            ]
        },
        {
            name: 'ADMIN BUILDING',
            route: [
                'Start at the Back Gate.',
                'Go straight.',
                'Turn right at the first path.',
                'After you pass the COT building and Automation building, you will see a flagpole',
                'Turn right and you will be directly ahead at the Admin building.',
            ],
            mapPosition: { top: '20%', left: '40%' },
            mapImageUrl: '', // Set to empty as using video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609171/ADMIN_BUILDING_gbdryl.mp4',
            photoUrl: 'https://res.cloudinary.com/dtvbrh783/image/upload/v1751608669/adminnnnn_eexubx.jpg',
            isPhotoVideo: false,
            pathCoordinates: [
                { x: 31, y: 19 },
                { x: 36, y: 25 },
                { x: 32, y: 35 },
                { x: 28, y: 45 },
                { x: 27, y: 50 }
            ]
        },
        {
            name: 'SCIENCE BUILDING',
            route: [
                'Start at the Back Gate.',
                'Walk straight across the open field',
                'After passing the tennis court, continue past the Kasadya Gym and the canteen.',
                'Turn left onto the paved walkway.',
                'You have arrived at the SCIENCE BUILDING.',
            ],
            mapPosition: { top: '55%', left: '80%' },
            mapImageUrl: '', // Set to empty as using video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609258/ST_BUILDING_jxvwzs.mp4',
            photoUrl: 'https://res.cloudinary.com/dtvbrh783/image/upload/v1751608588/svience_mg2jmg.jpg',
            isPhotoVideo: false,
            pathCoordinates: [ // Sample path for animation
                { x: 90, y: 90 },
                { x: 70, y: 70 },
                { x: 50, y: 50 },
                { x: 30, y: 30 }
            ]
        },
        {
            name: 'CENTENNIAL BUILDING',
            route: [
                'Start at the Back Gate.',
                'Walk straight ahead.',
                'After passing the tennis court, continue past the Kasadya Gym and the canteen.',
                'Turn left at the second corner',
                'The CENTENNIAL BUILDING will be on your right.',
            ],
            mapPosition: { top: '25%', left: '50%' },
            mapImageUrl: '', // Set to empty as using video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609213/CN_BUILDING_u5d7vq.mp4',
            photoUrl: 'https://res.cloudinary.com/dtvbrh783/image/upload/v1751608570/cn_q9wjcp.jpg',
            isPhotoVideo: false,
            pathCoordinates: [ // Sample path for animation
                { x: 50, y: 90 },
                { x: 55, y: 70 },
                { x: 60, y: 50 },
                { x: 65, y: 30 }
            ]
        },
        {
            name: 'COT BUILDING',
            route: [
                'Start at the Back Gate.',
                'Walk straight.',
                'Turn right at the first path.',
                'slight deviation to the right',
                'You have arrived at the COT BUILDING.',
            ],
            mapPosition: { top: '40%', left: '20%' },
            mapImageUrl: '', // Set to empty as using video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609220/COT_BUILDING_suh3j4.mp4',
            photoUrl: '', // Removed photo URL to hide "View Building Photo" button
            isPhotoVideo: false,
            pathCoordinates: [ // Sample path for animation
                { x: 20, y: 50 },
                { x: 25, y: 40 },
                { x: 30, y: 30 }
            ]
        },
        {
            name: 'AUTOMATION BUILDING',
            route: [
                'Start at the Back Gate.',
                'Take the path leading directly right.',
                'After passing the COT building.',
                'walk straight and slight deviation to the right',
                'You have arrived at the AUTOMATION BUILDING.',
            ],
            mapPosition: { top: '75%', left: '70%' },
            mapImageUrl: '', // Set to empty as using video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609176/AUTOMATION_BUILDING_g4vddj.mp4',
            photoUrl: '', // Removed photo URL to hide "View Building Photo" button
            isPhotoVideo: false,
            pathCoordinates: [ // Sample path for animation
                { x: 70, y: 70 },
                { x: 75, y: 60 },
                { x: 80, y: 50 }
            ]
        },
        {
            name: 'CLINIC OFFICE',
            route: [
                'Start at the Back Gate.',
                'Walk straight then turn right at the first pathway.',
                'Walk straight then slight deviation to the right',
                'After passing the Automation building, continue past the Admin building then turn right.',
                'The Medical Dental Clinic is a small, multi-tenant building on your right.',
                'You have arrived at the CLINIC office.',
            ],
            mapPosition: { top: '30%', left: '15%' },
            mapImageUrl: '', // Set to empty as using video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609206/CLINIC_OFFICE_ai0wqe.mp4',
            photoUrl: '', // Removed photo URL to hide "View Building Photo" button
            isPhotoVideo: false,
            pathCoordinates: [ // Sample path for animation
                { x: 15, y: 30 },
                { x: 20, y: 25 },
                { x: 25, y: 20 }
            ]
        },
        {
            name: 'EDUCATION BUILDING',
            route: [
                'Start at the Back Gate.',
                'Walk straight then turn right at the first pathway.',
                'Walk straight then slight deviation to the left',
                'After passing the Automation building, continue past the Admin building then turn right.',
                'You have arrived at the Education Building.',
            ],
            mapPosition: { top: '50%', left: '30%' },
            mapImageUrl: '', // Set to empty as using video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609228/EDUCATION_BUILDING_wxiopn.mp4',
            photoUrl: 'https://res.cloudinary.com/dtvbrh783/image/upload/v1751608554/educ_jdb03e.jpg',
            isPhotoVideo: false,
            pathCoordinates: [ // Sample path for animation
                { x: 30, y: 50 },
                { x: 40, y: 55 },
                { x: 50, y: 60 }
            ]
        },
        {
            name: 'GRADUATE BUILDING',
            route: [
                'Start at the Back Gate.',
                'Walk straight then turn right at the first pathway.',
                'Walk straight then slight deviation to the left',
                'After passing the Automation building, continue past the Admin building.',
                'You have arrived at the Graduate Building.',
            ],
            mapPosition: { top: '25%', left: '90%' },
            mapImageUrl: '', // Set to empty as using video for map
            mapVideoUrl: 'https://res.cloudinary.com/dtvbrh783/video/upload/v1751609253/GRADUATE_BUILDING_kopkid.mp4',
            photoUrl: 'https://res.cloudinary.com/dtvbrh783/image/upload/v1751608599/graduate_ajbpdo.jpg',
            isPhotoVideo: false,
            pathCoordinates: [ // Sample path for animation
                { x: 90, y: 25 },
                { x: 80, y: 30 },
                { x: 70, y: 35 }
            ]
        }
    ];

    // Effect to handle initial load and hash changes
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1); // Remove the '#'
            if (hash) {
                const destination = campusDestinations.find(
                    (dest) => toSlug(dest.name) === hash // Match by slug
                );
                if (destination) {
                    setSelectedDestination(destination.name);
                    setNavigationSteps(destination.route);
                    setCurrentPage('navigate');
                    setMessage('');
                    setShowAnimatedMarker(true); // Show marker when navigating
                    setShowPhotoModal(false); // Close modal if open
                    console.log("Navigating to:", destination.name, "Path exists:", destination.pathCoordinates?.length > 0);
                } else {
                    // If slug doesn't match a known destination, go home
                    setCurrentPage('home');
                    setSelectedDestination('');
                    setNavigationSteps([]);
                    setMessage('Invalid destination in URL. Please select from the list.');
                    setShowAnimatedMarker(false); // Hide marker
                    setShowPhotoModal(false); // Close modal
                }
            } else {
                // If no hash, go to home page
                setCurrentPage('home');
                setSelectedDestination('');
                setNavigationSteps([]);
                setMessage('');
                setShowAnimatedMarker(false); // Hide marker
                setShowPhotoModal(false); // Close modal
            }
        };

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
        // Call it once on mount to handle initial URL
        handleHashChange();

        // Cleanup listener
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []); // Empty dependency array means this runs once on mount

    // Effect for marker animation
    useEffect(() => {
        let animationFrameId;
        let startTime = null;
        const animationDuration = 3000; // Total animation duration in ms
        const destination = campusDestinations.find(
            (dest) => dest.name === selectedDestination
        );
        const path = destination?.pathCoordinates;

        // Function to calculate angle between two points
        const getAngle = (p1, p2) => {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            return Math.atan2(dy, dx) * 180 / Math.PI + 90;
        };

        if (currentPage === 'navigate' && path && path.length > 0 && showAnimatedMarker) {
            console.log("Starting animation for:", selectedDestination, "with path length:", path.length);
            setAnimatedMarkerPosition({ x: path[0].x, y: path[0].y });
            if (path.length > 1) {
                setAnimatedMarkerRotation(getAngle(path[0], path[1]));
            }

            const animateMarker = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const elapsed = currentTime - startTime;
                const progress = elapsed / animationDuration;

                if (progress < 1) {
                    const totalSegments = path.length - 1;
                    const currentSegmentIndex = Math.floor(progress * totalSegments);
                    const segmentProgress = (progress * totalSegments) - currentSegmentIndex;

                    const p1 = path[currentSegmentIndex];
                    const p2 = path[Math.min(currentSegmentIndex + 1, totalSegments)];

                    const interpolatedX = p1.x + (p2.x - p1.x) * segmentProgress;
                    const interpolatedY = p1.y + (p2.y - p1.y) * segmentProgress;

                    setAnimatedMarkerPosition({ x: interpolatedX, y: interpolatedY });
                    console.log(`Marker Position: X=${interpolatedX.toFixed(2)}%, Y=${interpolatedY.toFixed(2)}%`);

                    if (currentSegmentIndex < totalSegments) {
                        setAnimatedMarkerRotation(getAngle(p1, p2));
                    }
                    
                    animationFrameId = requestAnimationFrame(animateMarker);
                } else {
                    setAnimatedMarkerPosition({ x: path[path.length - 1].x, y: path[path.length - 1].y });
                    startTime = null; 
                }
            };

            animationFrameId = requestAnimationFrame(animateMarker);

            return () => {
                cancelAnimationFrame(animationFrameId);
                setShowAnimatedMarker(false);
                startTime = null;
            };
        } else {
            setShowAnimatedMarker(false);
            startTime = null;
        }
    }, [currentPage, selectedDestination, mapDimensions, campusDestinations]);


    // Function to handle destination selection (no longer from dropdown, but still called for clarity)
    const handleSelectDestination = (destinationName) => {
        setSelectedDestination(destinationName);
        setMessage(''); // Clear any previous messages
    };

    // Function to start navigation based on the selected destination
    const startNavigation = (destinationName) => { // Now expects a destinationName directly
        if (!destinationName) {
            setMessage('Please select a destination.'); // Should not happen with direct buttons
            return;
        }

        const destination = campusDestinations.find(
            (dest) => dest.name === destinationName
        );

        if (destination) {
            setNavigationSteps(destination.route);
            // Update the URL hash
            window.location.hash = toSlug(destination.name);
            // currentPage and selectedDestination will be updated by handleHashChange, which triggers marker animation
            setMessage('');
        } else {
            setMessage('Selected destination not found in routes.');
        }
    };

    // Function to open the building photo modal - DYNAMICALLY LOADS PHOTO/VIDEO
    const openBuildingPhoto = () => {
        const destination = campusDestinations.find(
            (dest) => dest.name === selectedDestination
        );
        if (destination) {
            let urlToDisplay = '';
            let isVideo = false;

            // Only consider photoUrl for the "View Building Photo" button
            if (destination.photoUrl) {
                urlToDisplay = destination.photoUrl;
                isVideo = destination.photoUrl.toLowerCase().endsWith('.mp4');
            }

            if (urlToDisplay) { // Only proceed if a photoUrl was found
                setModalContentUrl(urlToDisplay);
                setIsModalContentVideo(isVideo);
                setShowPhotoModal(true);
            } else {
                setMessage('No specific photo available for this building.'); // Updated message
            }
        } else {
            setMessage('Destination not found.');
        }
    };
    
    // Function to close the building photo modal
    const closeBuildingPhoto = () => {
        setShowPhotoModal(false);
        setModalContentUrl('');
        setIsModalContentVideo(false);
    };

    // The goHome function (re-added to be explicitly used by the button)
    const goHome = () => {
        // Clear the URL hash to go home
        window.location.hash = '';
        // currentPage and selectedDestination will be updated by handleHashChange
        setMessage('');
        setShowAnimatedMarker(false); // Hide marker when going home
        setShowPhotoModal(false); // Close modal if open
    };

    // Get the current destination object to access its map image URL and pathCoordinates
    const currentDestinationObject = campusDestinations.find(
        (dest) => dest.name === selectedDestination
    );

    return (
        // Outermost div acts as a flex container to center content, and is relative for absolute children
        <div className="min-h-screen font-sans flex flex-col items-center justify-center p-4 relative">
            {/* Top background layer */}
            <div
                className="absolute top-0 left-0 w-full h-1/2 bg-cover bg-center"
                style={{ backgroundImage: `url('https://res.cloudinary.com/dtvbrh783/image/upload/v1751609852/495264106_919129223687428_6136402725334978229_n_tihq9l.png')` }}
            ></div>
            {/* Bottom background layer */}
            <div
                className="absolute bottom-0 left-0 w-full h-1/2 bg-cover bg-center"
                style={{ backgroundImage: `url('https://res.cloudinary.com/dtvbrh783/image/upload/v1751609866/506803316_572325982338762_8652178754255906899_n_efygn0.png')` }}
            ></div>
            {/* Overlay for better readability over BOTH backgrounds */}
            <div className="absolute inset-0 bg-blue-900 opacity-60"></div>

            {/* Main Content Container - Conditionally rendered */}
            {!showPhotoModal && ( // Only show this div if the photo modal is NOT active
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-blue-200 z-10 relative">
                    {/* Header Section with main logo and title */}
                    <div className="relative w-full flex flex-col items-center mb-6">
                        {/* Main Logo */}
                        <div className="flex justify-center mb-2">
                            <img
                                src="https://res.cloudinary.com/dtvbrh783/image/upload/v1751608691/navctulogo_rgrely.png" // Updated with Cloudinary logo URL
                                alt="CTU Navigator Logo"
                                className="h-36 w-auto rounded-full shadow-lg"
                                onError={(e) => {
                                    console.error(`Error loading logo:`, e.target.src);
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/150x150/FF0000/FFFFFF?text=Logo+Error";
                                }}
                            />
                        </div>
                        
                        {/* Main Title */}
                        <h1 className="text-4xl font-bold text-center text-indigo-700">
                            CTU Campus Navigator
                        </h1>
                    </div> {/* End of Header Section */}

                    {/* Message display area */}
                    {message && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 text-center" role="alert">
                            <span className="block sm:inline">{message}</span>
                        </div>
                    )}

                    {currentPage === 'home' && (
                        <div className="flex flex-col items-center">
                            <h3 className="text-2xl font-semibold text-gray-700 mb-4 mt-6">Select a Building</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                {campusDestinations.map((building) => (
                                    <button
                                        key={building.name}
                                        onClick={() => startNavigation(building.name)} // Directly start navigation
                                        className="flex flex-col items-center justify-center p-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
                                    >
                                        {building.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentPage === 'navigate' && (
                        <div className="flex flex-col">
                            <h2 className="text-3xl font-semibold text-indigo-600 mb-4 text-center">
                                Directions to {selectedDestination}
                            </h2>

                            {/* Campus Map Section - Conditionally renders image or video */}
                            <div
                                ref={mapContainerRef}
                                className="relative w-full h-[500px] md:h-[700px] bg-gray-100 rounded-xl overflow-hidden shadow-inner mb-6 border border-gray-300"
                            >
                                {/* If mapVideoUrl is empty, it will fall through to the image tag */}
                                {currentDestinationObject?.mapVideoUrl ? (
                                    <video
                                        src={currentDestinationObject.mapVideoUrl}
                                        alt={`Video map of ${selectedDestination}`}
                                        className="w-full h-full object-contain"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        onError={(e) => {
                                            console.error(`Error loading video for ${selectedDestination}:`, e.target.src);
                                            e.target.onerror = null;
                                            // Fallback to placeholder image if video fails or is empty
                                            e.target.src = "https://placehold.co/800x400/DDEEFF/336699?text=Video+Map+Error";
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={`https://placehold.co/800x400/DDEEFF/336699?text=Map+of+${encodeURIComponent(selectedDestination)}`}
                                        alt={`Map of ${selectedDestination}`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            console.error(`Error loading image for ${selectedDestination}:`, e.target.src);
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/800x400/DDEEFF/336699?text=Error+Loading+Map";
                                        }}
                                    />
                                )}
                                   {/* Animated Marker (Person Icon) */}
                                {showAnimatedMarker && mapDimensions.width > 0 && mapDimensions.height > 0 && currentDestinationObject?.pathCoordinates?.length > 0 && (
                                    <div
                                        className="absolute bg-red-500 rounded-full border-2 border-white shadow-lg z-20 flex items-center justify-center"
                                        style={{
                                            width: '50px', // Size of the marker - increased for visibility
                                            height: '50px', // Size of the marker
                                            backgroundColor: 'lime', // Bright background for visibility
                                            borderColor: 'blue', // Contrasting border
                                            // Position the marker, adjusting for its own size so it-centers on the point
                                            left: `${animatedMarkerPosition.x}%`,
                                            top: `${animatedMarkerPosition.y}%`,
                                            transform: `translate(-50%, -50%) rotate(${animatedMarkerRotation}deg)`,
                                            transition: 'transform 0.1s linear' // Smooth movement and rotation
                                        }}
                                    >
                                        {/* Inline SVG for a person icon */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2C9.243 2 7 4.243 7 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Button to View Building Photo - now conditionally shown based ONLY on photoUrl availability */}
                            {currentDestinationObject?.photoUrl && (
                                <button
                                    onClick={openBuildingPhoto}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75 w-full mb-6"
                                >
                                    View Building Photo
                                </button>
                            )}


                            {/* Turn-by-turn navigation steps */}
                            <ul className="list-decimal list-inside space-y-3 mb-6 bg-gray-50 p-5 rounded-xl border border-gray-200">
                                {navigationSteps.map((step, index) => (
                                    <li key={index} className="text-gray-800 text-lg leading-relaxed">
                                        {step}
                                    </li>
                                ))}
                            </ul>
                            {/* "Back to All Buildings" button added back */}
                            <button
                                onClick={goHome}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-opacity-75 w-full"
                            >
                                Back to All Buildings
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Building Photo Modal Overlay */}
            {showPhotoModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
                    onClick={closeBuildingPhoto} // Close when clicking outside content
                >
                    <div
                        className="relative rounded-xl shadow-2xl p-4 w-full h-full max-w-5xl lg:max-w-6xl overflow-auto flex flex-col justify-center items-center"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside content
                        // Removed the 'bg-white' class here
                    >
                        {isModalContentVideo ? (
                            <video
                                src={modalContentUrl}
                                controls
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="max-w-full max-h-[80vh] rounded-lg"
                                onError={(e) => {
                                    console.error(`Error loading modal video:`, e.target.src);
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/600x400/FF0000/FFFFFF?text=Video+Load+Error";
                                }}
                            />
                        ) : (
                            <img
                                src={modalContentUrl}
                                alt="Building Photo"
                                className="max-w-full max-h-[80vh] rounded-lg"
                                onError={(e) => {
                                    console.error(`Error loading modal image:`, e.target.src);
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/600x400/FF0000/FFFFFF?text=Image+Load+Error";
                                }}
                            />
                        )}

                        {/* Close button (top right) */}
                        <button
                            onClick={closeBuildingPhoto}
                            className="absolute top-2 right-2 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700 transition-colors duration-200 z-40"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* New Back Button (bottom) */}
                        <button
                            onClick={closeBuildingPhoto}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-75"
                        >
                            Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
