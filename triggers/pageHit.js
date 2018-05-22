const TriggerHelper = require('./triggerHelper');
const triggerHelper = new TriggerHelper('mautic.page_on_hit', 'Trigger Zapier about page hit events');
const Contact = require('../entities/contact');

const cleanPageHits = (dirtyHits, pageId) => {
  const hits = [];
  for (var key in dirtyHits) {
    if (pageId === null || dirtyHits[key].hit.page && dirtyHits[key].hit.page.id && parseInt(dirtyHits[key].hit.page.id) === parseInt(pageId)) {
      hits.push(cleanPageHit(dirtyHits[key]));
    }
  };

  return hits;
};

const cleanPage = (dirtyPage) => {
  var page = {};

  page.id = dirtyPage.id;
  page.title = dirtyPage.title;
  page.alias = dirtyPage.alias;

  return page;
};

const cleanPageHit = (dirtyHit) => {
  var hit = {};

  if (dirtyHit.hit) {
    dirtyHit = dirtyHit.hit;
  }

  hit.id = dirtyHit.id;
  hit.dateHit = dirtyHit.dateHit;
  hit.dateLeft = dirtyHit.dateLeft;
  hit.redirect = dirtyHit.redirect;
  hit.country = dirtyHit.country;
  hit.region = dirtyHit.region;
  hit.city = dirtyHit.city;
  hit.isp = dirtyHit.isp;
  hit.organization = dirtyHit.organization;
  hit.code = dirtyHit.code;
  hit.referer = dirtyHit.referer;
  hit.url = dirtyHit.url;
  hit.urlTitle = dirtyHit.urlTitle;
  hit.userAgent = dirtyHit.userAgent;
  hit.remoteHost = dirtyHit.remoteHost;
  hit.pageLanguage = dirtyHit.pageLanguage;
  hit.source = dirtyHit.source;
  hit.sourceId = dirtyHit.sourceId;

  if (dirtyHit.lead) {
    var contact = new Contact();
    hit.contact = contact.cleanContact(dirtyHit.lead);
  }

  if (dirtyHit.page) {
    hit.page = cleanPage(dirtyHit.page);
  }

  return hit;
};

const getPageHit = (z, bundle) => {
  let pageId = null;

  if (bundle.inputData && bundle.inputData.pageId) {
    pageId = bundle.inputData.pageId;
  }

  const dirtyHits = bundle.cleanedRequest['mautic.page_on_hit'];
  return cleanPageHits(dirtyHits, pageId);
};

const getFallbackRealPage = (z, bundle) => {
  let pageId = null;

  if (bundle.inputData && bundle.inputData.pageId) {
    pageId = bundle.inputData.pageId;
  }

  return cleanPageHits(require('../fixtures/requests/pageHit.js')['mautic.page_on_hit'], pageId);
};

const getEmailFields = () => {
  return [
    {key: 'id', label: 'ID', type: 'integer'},
    {key: 'title', label: 'Title'},
    {key: 'alias', label: 'Alias'},
  ];
};

const getPageHitFields = () => {
  return [
    {key: 'id', label: 'ID', type: 'integer'},
    {key: 'emailAddress', label: 'Email Address'},
    {key: 'dateHit', label: 'Date Hit', type: 'datetime'},
    {key: 'dateLeft', label: 'Date Left', type: 'datetime'},
    {key: 'lastOpened', label: 'Last Opened', type: 'datetime'},
    {key: 'openCount', label: 'Open Count', type: 'integer'},
    {key: 'source', label: 'Source object'},
    {key: 'sourceId', label: 'Source Object ID', type: 'integer'},
    {key: 'viewedInBrowser', label: 'Viewed In Browser', type: 'boolean'},
    {key: 'email', label: 'Email', children: getEmailFields},
    {key: 'contact', label: 'Contact', children: triggerHelper.getContactCustomFields},
  ];
};

module.exports = {
  key: 'pageHit',
  noun: 'Page',
  display: {
    label: 'New Page Hit',
    description: 'Triggers when a landing page is visited by a contact.'
  },
  operation: {
    type: 'hook',
    performSubscribe: triggerHelper.subscribeHook,
    performUnsubscribe: triggerHelper.unsubscribeHook,
    perform: getPageHit,
    performList: getFallbackRealPage,
    sample: require('../fixtures/samples/pageHit.js'),
    outputFields: [getPageHitFields],
    inputFields: [
      {key: 'pageId', type: 'integer', label: 'Landing Page', dynamic: 'pages.id.name', required: false},
    ],
  }
};
