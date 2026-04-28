const express = require('express');

const router = express.Router();

const CUSTOMER_CARE_EMAIL = process.env.CUSTOMER_CARE_EMAIL || 'kiettraveller007@gmail.com';
const OFFTOPIC_MESSAGE = process.env.CHATBOT_OFFTOPIC_MESSAGE ||
  `I can only help with KIET Traveller topics. Please contact customer care at ${CUSTOMER_CARE_EMAIL}.`;

const FAQS = [
  {
    id: 'bus-timings',
    keywords: ['bus timing', 'bus time', 'schedule', 'timings'],
    answer: 'Bus timings are available in the Schedules section. Choose your route to see pickup times and bus departure details.'
  },
  {
    id: 'driver-details',
    keywords: ['driver', 'driver details', 'driver contact'],
    answer: 'Driver details are shown in the Driver Dashboard and assigned route details for your bus.'
  },
  {
    id: 'bus-members',
    keywords: ['bus members', 'members list', 'passengers', 'student list'],
    answer: 'Bus member lists are available in the Bus or Route details screens. Admins can view full member lists.'
  },
  {
    id: 'route-details',
    keywords: ['route', 'stops', 'pickup', 'drop', 'route details'],
    answer: 'Route details and stop lists are available in Route Preview or the Routes section.'
  },
  {
    id: 'live-tracking',
    keywords: ['track', 'tracking', 'live location', 'gps'],
    answer: 'Use Live Bus Tracking to see the real-time location of your bus.'
  },
  {
    id: 'admin-actions',
    keywords: ['admin', 'management', 'add bus', 'add route', 'manage'],
    answer: 'Admins can manage buses, routes, schedules, users, and notifications in the Admin Management page.'
  },
  {
    id: 'login-help',
    keywords: ['login', 'sign in', 'password', 'reset'],
    answer: 'Use your registered email and password to sign in. If needed, use the Forgot Password link to reset your password.'
  },
  {
    id: 'register-help',
    keywords: ['register', 'signup', 'create account'],
    answer: 'Use the Register page to create an account with your role and contact information.'
  },
  {
    id: 'support',
    keywords: ['support', 'customer care', 'helpdesk', 'contact'],
    answer: `Customer care email: ${CUSTOMER_CARE_EMAIL}.`
  }
];

const normalize = (text) => String(text || '').toLowerCase();

const findBestAnswer = (question) => {
  const message = normalize(question);

  if (!message) {
    return {
      answer: 'Please enter a question about KIET Traveller.',
      matchedFaq: null
    };
  }

  const match = FAQS.find((faq) => faq.keywords.some((keyword) => message.includes(keyword)));

  if (!match) {
    return {
      answer: OFFTOPIC_MESSAGE,
      matchedFaq: null
    };
  }

  return {
    answer: match.answer,
    matchedFaq: match.id
  };
};

router.get('/faqs', (req, res) => {
  res.json({
    success: true,
    data: {
      faqs: FAQS.map(({ id, answer }) => ({ id, answer }))
    }
  });
});

router.post('/ask', (req, res) => {
  const { question } = req.body || {};
  const { answer, matchedFaq } = findBestAnswer(question);

  res.json({
    success: true,
    data: {
      answer,
      matchedFaq
    }
  });
});

module.exports = router;
