const { pool } = require('../db'); // Connexion à PostgreSQL
const { Client } = require('@googlemaps/google-maps-services-js'); // Google Maps API
const polyline = require('@mapbox/polyline'); // ➕ Ajout du décodeur de polylines
const client = new Client({});

// Rechercher un itinéraire
const searchItinerary = async (req, res) => {
  const { start_location, end_location, user_id } = req.body;

  if (!start_location || !end_location || !user_id) {
    return res.status(400).json({ error: 'Les champs start_location, end_location et user_id sont requis.' });
  }

  try {
    // Appeler Google Directions API pour calculer l'itinéraire
    const response = await client.directions({
      params: {
        origin: start_location,
        destination: end_location,
        mode: 'driving',
        key: process.env.GOOGLE_API_KEY,
      },
    });

    // ➤ Extraire et décoder la polyline
    const encodedPolyline = response.data.routes[0].overview_polyline.points;
    const decodedPoints = polyline.decode(encodedPolyline);
    const routePoints = decodedPoints.map(([lat, lng]) => ({ lat, lng }));

    const route = response.data.routes[0];

    // Enregistrer l'itinéraire dans la base de données
    const result = await pool.query(
      `INSERT INTO itineraries (user_id, start_location, end_location, route_points, duration, distance, cost, toll_free)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        user_id,
        start_location,
        end_location,
        JSON.stringify(routePoints),
        route.legs[0].duration.value,
        route.legs[0].distance.value,
        0,
        false,
      ]
    );

    res.status(201).json({ message: 'Itinéraire créé', itinerary: result.rows[0] });
  } catch (error) {
    console.error("Erreur lors de la recherche d'itinéraire :", error.message);
    res.status(500).json({ error: "Erreur lors de la recherche d'itinéraire." });
  }
};

// Recalculer l'itinéraire en cas d'incidents (inchangé sauf si tu veux aussi améliorer ici)
const recalculateItinerary = async (req, res) => {
  const { itinerary_id, incidents = [] } = req.body;

  if (!itinerary_id) {
    return res.status(400).json({ error: "Le champ 'itinerary_id' est requis." });
  }

  try {
    const result = await pool.query('SELECT * FROM itineraries WHERE id = $1', [itinerary_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Itinéraire non trouvé.' });
    }

    const itinerary = result.rows[0];
    const routePoints = JSON.parse(itinerary.route_points);

    let activeIncidents = incidents;
    if (incidents.length === 0) {
      const incidentsResult = await pool.query("SELECT * FROM incidents WHERE status = 'active'");
      activeIncidents = incidentsResult.rows;
    }

    const tolerance = 0.01;
    const affectedIncidents = activeIncidents.filter(incident =>
      routePoints.some(point =>
        Math.abs(point.lat - incident.latitude) < tolerance &&
        Math.abs(point.lng - incident.longitude) < tolerance
      )
    );

    if (affectedIncidents.length === 0) {
      return res.status(200).json({
        message: 'Aucun recalcul nécessaire',
        itinerary,
      });
    }

    const response = await client.directions({
      params: {
        origin: itinerary.start_location,
        destination: itinerary.end_location,
        mode: 'driving',
        avoid: 'tolls',
        key: process.env.GOOGLE_API_KEY,
      },
    });

    const encodedPolyline = response.data.routes[0].overview_polyline.points;
    const decodedPoints = polyline.decode(encodedPolyline);
    const newRoutePoints = decodedPoints.map(([lat, lng]) => ({ lat, lng }));

    res.status(200).json({
      message: 'Itinéraire recalculé en évitant les incidents',
      old_route: routePoints,
      new_route: {
        route_points: newRoutePoints,
        duration: response.data.routes[0].legs[0].duration.value,
        distance: response.data.routes[0].legs[0].distance.value,
      },
      affected_incidents: affectedIncidents,
    });
  } catch (error) {
    console.error("Erreur lors du recalcul de l'itinéraire :", error.message);
    res.status(500).json({ error: "Erreur lors du recalcul de l'itinéraire." });
  }
};

module.exports = { searchItinerary, recalculateItinerary };
