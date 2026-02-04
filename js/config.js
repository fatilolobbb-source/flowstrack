// Configuration runtime pour l'API et les identifiants du professeur
// Éditez ce fichier pour indiquer l'URL de votre API si vous avez déployé le serveur,
// ou laissez vide pour utiliser les comportements par défaut (fichier local -> http://localhost:3005).

window.API_BASE_URL = window.API_BASE_URL || (window.location.protocol === 'file:' ? 'http://localhost/backend/api' : '/backend/api'); // Adjust when deploying

// Professeur fixe avec ses informations
window.TEACHER = {
  username: 'professeur',
  password: 'ENSA2024',
  name: 'Ahmed Aberqi',
  filiere: 'isdia',
  module: 'Algèbre'
};

// Étudiants inscrits par filière (pour démo)
window.STUDENTS_BY_FILIERE = {
  isdia: [
    { id: 1, num: '001', nom: 'IBRAHIM', prenom: 'Ahmed', zk_num: '1001' },
    { id: 2, num: '002', nom: 'HASSAN', prenom: 'Sara', zk_num: '1002' },
    { id: 3, num: '003', nom: 'KHAN', prenom: 'Youssef', zk_num: '1003' }
  ],
  info: [
    { id: 4, num: '004', nom: 'ANAS', prenom: 'Anas', zk_num: '2001' },
    { id: 5, num: '005', nom: 'KHADIJA', prenom: 'Khadija', zk_num: '2002' },
    { id: 6, num: '006', nom: 'BILAL', prenom: 'Bilal', zk_num: '2003' }
  ],
  logiciel: [
    { id: 7, num: '007', nom: 'RANIA', prenom: 'Rania', zk_num: '3001' },
    { id: 8, num: '008', nom: 'YASSINE', prenom: 'Yassine', zk_num: '3002' }
  ],
  cyber: [
    { id: 9, num: '009', nom: 'ZINEB', prenom: 'Zineb', zk_num: '4001' },
    { id: 10, num: '010', nom: 'MEHDI', prenom: 'Mehdi', zk_num: '4002' }
  ]
};

// Mapping filière => module par défaut (utilisé pour auto-remplir le module)
window.FILIERE_MODULE_MAP = {
  isdia: 'Algèbre',
  ilia: 'Analyse',
  info: 'Programmation',
  logiciel: 'Génie Logiciel',
  cyber: 'Sécurité des Réseaux'
};
