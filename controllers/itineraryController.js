const { pool } = require('../db'); // Connexion à PostgreSQL
const { Client } = require('@googlemaps/google-maps-services-js'); // Google Maps API
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
        key: process.env.GOOGLE_API_KEY,
      },
    });

    // Extraire les données de l'itinéraire
    const route = response.data.routes[0];
    const routePoints = route.legs[0].steps.map((step) => ({
      lat: step.end_location.lat,
      lng: step.end_location.lng,
    }));

    // Enregistrer l'itinéraire dans la base de données
    const result = await pool.query(
      `INSERT INTO itineraries (user_id, start_location, end_location, route_points, duration, distance, cost, toll_free)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        user_id,
        start_location,
        end_location,
        JSON.stringify(routePoints),
        route.legs[0].duration.value, // Durée en secondes
        route.legs[0].distance.value, // Distance en mètres
        0, // Coût par défaut
        false, // Tolérance aux péages
      ]
    );

    res.status(201).json({ message: 'Itinéraire créé', itinerary: result.rows[0] });
  } catch (error) {
    console.error('Erreur lors de la recherche d\'itinéraire :', error.message);
    res.status(500).json({ error: 'Erreur lors de la recherche d\'itinéraire.' });
  }
};

// Recalculer l'itinéraire en cas d'incidents
const recalculateItinerary = async (req, res) => {
  const { itinerary_id, incidents = [] } = req.body; // incidents devient optionnel

  if (!itinerary_id) {
    return res.status(400).json({ error: "Le champ 'itinerary_id' est requis." });
  }

  try {
    // 1. Récupérer l'itinéraire initial
    const result = await pool.query('SELECT * FROM itineraries WHERE id = $1', [itinerary_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Itinéraire non trouvé.' });
    }

    const itinerary = result.rows[0];
    const routePoints = JSON.parse(itinerary.route_points);

    // 2. Vérifier si des incidents sont fournis (sinon on les récupère depuis la base)
    let activeIncidents = incidents;
    if (incidents.length === 0) {
      const incidentsResult = await pool.query("SELECT * FROM incidents WHERE status = 'active'");
      activeIncidents = incidentsResult.rows;
    }

    // 3. Vérifier si des incidents affectent l'itinéraire
    const tolerance = 0.01; // ~1 km
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

    // 4. Recalculer l'itinéraire en évitant les incidents
    const response = await client.directions({
      params: {
        origin: itinerary.start_location,
        destination: itinerary.end_location,
        avoid: 'tolls',
        key: process.env.GOOGLE_API_KEY,
      },
    });

    const newRoute = response.data.routes[0];
    const newRoutePoints = newRoute.legs[0].steps.map(step => ({
      lat: step.end_location.lat,
      lng: step.end_location.lng,
    }));

    res.status(200).json({
      message: 'Itinéraire recalculé en évitant les incidents',
      old_route: routePoints,
      new_route: {
        route_points: newRoutePoints,
        duration: newRoute.legs[0].duration.value,
        distance: newRoute.legs[0].distance.value,
      },
      affected_incidents: affectedIncidents,
    });
  } catch (error) {
    console.error("Erreur lors du recalcul de l'itinéraire :", error.message);
    res.status(500).json({ error: "Erreur lors du recalcul de l'itinéraire." });
  }
};

module.exports = { searchItinerary, recalculateItinerary };
