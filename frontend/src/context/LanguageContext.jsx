import { createContext, useContext, useState } from 'react';

const translations = {
  en: {
    'nav.company': 'Company',
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.integrations': 'Integrations',
    'nav.insights': 'Insights',
    'nav.login': 'Login',
    
    'hero.badge': 'Update 2.0 : AI Integration',
    'hero.title.highlight': 'Revolutionize',
    'hero.title.rest': 'your invoice extraction',
    'hero.subtitle': 'Extract stunning, professional-quality structured data in record time with our powerful AI engine. Elevate your accounting game today!',
    
    'features.title.highlight': 'Powerful',
    'features.title.rest': 'growth solutions',
    'features.subtitle': 'Craft exceptional, top-notch workflows swiftly using our robust toolset. Boost your SAAS performance now!',
    
    'feature1.title': 'Expert Guidance',
    'feature1.desc': 'Create stunning, professional-quality extractions in record time with our powerful AI kit.',
    
    'feature2.title': 'Fast and Easy Setup',
    'feature2.desc': 'Create stunning, professional-quality extractions in record time with our powerful AI kit.',
    
    'feature3.title': 'Advanced Analytics',
    'feature3.desc': 'Create stunning, professional-quality extractions in record time with our powerful AI kit.',
    
    'feature4.badge': 'AI Integration',
    'feature4.title': 'Seamless Integration',
    'feature4.desc': 'Create stunning, professional-quality extractions in record time with our powerful AI kit.',
    'feature4.cta': 'Get Started',
    
    'feature5.title': 'Customizable Solutions',
    'feature5.desc': 'Create stunning, professional-quality extractions in record time with our powerful AI kit.',

    'upload.title': 'Initiate Protocol',
    'upload.subtitle': 'Upload your invoice documents to the extraction pipeline. Supported formats include PDF, JPG, and PNG.',
    'upload.drag': 'Drag & Drop Document',
    'upload.or': 'or click to browse local files',
    'upload.cancel': 'Cancel',
    'upload.begin': 'Begin Extraction',
    'upload.uploading': 'Transmitting Data...',
    'upload.processing': 'AI Extraction in Progress...',
    'upload.complete': 'Extraction Complete',
    'upload.another': 'Process Another'
  },
  fr: {
    'nav.company': 'Société',
    'nav.features': 'Fonctionnalités',
    'nav.pricing': 'Tarifs',
    'nav.integrations': 'Intégrations',
    'nav.insights': 'Aperçus',
    'nav.login': 'Connexion',
    
    'hero.badge': 'Mise à jour 2.0 : Intégration IA',
    'hero.title.highlight': 'Révolutionnez',
    'hero.title.rest': 'votre extraction de factures',
    'hero.subtitle': 'Extrayez des données structurées de qualité professionnelle en un temps record grâce à notre puissant moteur IA. Améliorez votre comptabilité dès aujourd\'hui !',
    
    'features.title.highlight': 'Puissantes',
    'features.title.rest': 'solutions de croissance',
    'features.subtitle': 'Créez des flux de travail exceptionnels rapidement à l\'aide de notre boîte à outils. Boostez vos performances SAAS maintenant !',
    
    'feature1.title': 'Conseils d\'experts',
    'feature1.desc': 'Créez des extractions époustouflantes et de qualité professionnelle en un temps record avec notre kit IA.',
    
    'feature2.title': 'Configuration Rapide et Facile',
    'feature2.desc': 'Créez des extractions époustouflantes et de qualité professionnelle en un temps record avec notre kit IA.',
    
    'feature3.title': 'Analyses Avancées',
    'feature3.desc': 'Créez des extractions époustouflantes et de qualité professionnelle en un temps record avec notre kit IA.',
    
    'hero.title1': 'Extrayez des données avec',
    'hero.title2': 'une précision cosmique.',
    'hero.subtitle': 'Automatisez le traitement de vos factures avec la reconnaissance optique par IA. Extraction instantanée, précise et évolutive.',
    'hero.cta': 'Essai Gratuit',
    'hero.secondary': 'Voir la documentation',
    'features.title': 'Protocole d\'Extraction Intelligent',
    'features.subtitle': 'Nos modèles d\'IA analysent les documents complexes non structurés en JSON propre et validé en quelques millisecondes.',
    'features.card1.title': 'Analyse Universelle',
    'features.card1.desc': 'Gère automatiquement tous les formats de factures, langues ou mises en page.',
    'features.card2.title': 'Précision des Lignes',
    'features.card2.desc': 'Extrait les tableaux imbriqués et les articles individuels avec une précision de 99,9 %.',
    'features.card3.title': 'Auto-Validation',
    'features.card3.desc': 'Vérifie les totaux, les taxes et les dates par rapport aux valeurs calculées.',
    'features.card4.title': 'Exportation Instantanée',
    'features.card4.desc': 'Poussez les données structurées directement vers votre ERP ou logiciel de comptabilité.',
    'upload.title': 'Lancer l\'Extraction',
    'upload.subtitle': 'Téléchargez vos factures dans le pipeline d\'extraction. Les formats supportés incluent PDF, JPG, et PNG.',
    'upload.drag': 'Glisser et Déposer le Document',
    'upload.or': 'ou cliquez pour parcourir les fichiers',
    'upload.cancel': 'Annuler',
    'upload.begin': 'Lancer l\'Extraction',
    'upload.uploading': 'Transmission des données...',
    'upload.processing': 'Extraction IA en cours...',
    'upload.complete': 'Extraction Terminée',
    'upload.another': 'Traiter un autre',
    'results.vendor': 'Fournisseur',
    'results.invoice_num': 'N° Facture',
    'results.date': 'Date',
    'results.total': 'Montant Total',
    'results.line_items': 'Articles',
    'results.desc': 'Description',
    'results.qty': 'Qté',
    'results.unit_price': 'Prix Unitaire',
    'results.total': 'Total',
    'results.raw': 'Voir la sortie JSON brute'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const toggleLanguage = () => setLang((prev) => (prev === 'en' ? 'fr' : 'en'));

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ language: lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
