export const displayMap = locations => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiamFtYWwtaG5pZWRpIiwiYSI6ImNrN2RyODI4YzAydjMzZW8xZ2pibzVid3UifQ.xKMbuT-7B7sxCAXMK5gGag';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jamal-hniedi/ck7drrdjm1mgj1imzgrjtbuuk',
        scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        // Create marker
        const marker = document.createElement('div');
        marker.className = 'marker';
        // Add marker
        new mapboxgl.Marker({
            element: marker,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates)
            .addTo(map);
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend bound to include current loc
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            right: 200,
            left: 200
        }
    });
};
