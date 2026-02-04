// Configuration runtime pour l'API et les identifiants du professeur
// Éditez ce fichier pour indiquer l'URL de votre API si vous avez déployé le serveur,
// ou laissez vide pour utiliser les comportements par défaut (fichier local -> http://localhost:3005).

window.API_BASE_URL = window.API_BASE_URL || (window.location.protocol === 'file:' ? 'http://localhost/backend/api' : '/backend/api'); // Adjust when deploying

// Identifiants du professeur modifiables
window.TEACHER_CREDENTIALS = {
  username: 'professeur',
  password: 'ENSA2024',
  name: 'Ahmed Aberqi',
  modules: { isdia: ['Analyse', 'Algèbre'], info: ['Algèbre'] }
};
