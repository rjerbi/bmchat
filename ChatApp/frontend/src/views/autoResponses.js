// autoResponses.js

export const responses = [
  {
    keywords: ['bonjour', 'salut', 'hello', 'hi'],
    popup: true,
    responses: {
      fr: [
        "Salut ! Comment puis-je t'aider aujourd’hui ?",
        "Bonjour ! Tu as besoin de quelque chose ?"
      ],
      en: [
        "Hi! How can I help you today?",
        "Hello! Do you need anything?"
      ]
    }
  },
  {
    keywords: ['ça va ?', 'how are you ?', 'how are you'],
    popup: true,
    responses: {
      fr: [
        "Je vais bien, merci ! Et toi ?",
        "Tout va bien, et toi ?"
      ],
      en: [
        "I'm good, and you?",
        "Doing well! How about you?"
      ]
    }
  },
  {
    keywords: ['merci', 'thank you'],
    popup: true,
    responses: {
      fr: ["Avec plaisir 😊", "De rien ! 😊"],
      en: ["You're welcome 😊", "No problem at all! 😊"]
    }
  },
  {
    keywords: ['tu fais quoi', 'what are you doing', 'what you are doing'],
    popup: true,
    responses: {
      fr: ["Rien de spécial et toi ?", "Je me repose un peu, et toi ?"],
      en: ["Nothing special, and you?", "Just chilling a bit, how about you?"]
    }
  },
  {
    keywords: ['aide', 'help'],
    popup: true,
    responses: {
      fr: [
        "Je suis là pour t'aider. Dis-moi tout !",
        "Bien sûr ! Que puis-je faire pour toi ?"
      ],
      en: [
        "I'm here to help you, tell me everything!",
        "Of course! What can I do for you?"
      ]
    }
  },
  {
    keywords: ['au revoir', 'bye'],
    popup: true,
    responses: {
      fr: ["À bientôt ! Prends soin de toi 😊", "Bye bye ! À la prochaine !"],
      en: ["See you soon! Take care 😊", "Goodbye! Catch you later!"]
    }
  }
];

/**
 * Normalizes text by:
 * - Lowercasing
 * - Removing diacritics (accents)
 */
export function normalizeText(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Detects language of the message using keyword presence
 * @param {string} message
 * @returns {'en'|'fr'}
 */
export function detectLanguage(message) {
  const msg = normalizeText(message);
  const frWords = ['bonjour', 'salut', 'ça va', 'merci', 'tu fais quoi', 'aide', 'au revoir'];
  const enWords = ['hi', 'hello', 'how are you', 'thank you', 'what are you doing', 'help', 'bye'];

  const frScore = frWords.filter(w => msg.includes(w)).length;
  const enScore = enWords.filter(w => msg.includes(w)).length;

  if (frScore > enScore) return 'fr';
  if (enScore > frScore) return 'en';
  return 'en'; // Default to English
}

/**
 * Returns an auto-response if a keyword matches
 * @param {string} userMessage
 * @returns {{type: string, response: string}}
 */
export function getAutoResponse(userMessage) {
  const lower = normalizeText(userMessage);

  for (const rule of responses) {
    if (rule.keywords.some(keyword =>
      new RegExp(`\\b${normalizeText(keyword)}\\b`, 'i').test(lower)
    )) {
      const lang = detectLanguage(lower);
      const randomIndex = Math.floor(Math.random() * rule.responses[lang].length);
      const randomResponse = rule.responses[lang][randomIndex];

      return {
        type: rule.popup ? 'popup' : 'auto',
        response: randomResponse
      };
    }
  }

  const lang = detectLanguage(lower);
  return {
    type: 'auto',
    response: lang === 'fr'
      ? "Désolé, je n'ai pas compris 😕"
      : "Sorry, I didn't understand 😕"
  };
}
