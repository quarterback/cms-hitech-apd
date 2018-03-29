const {
  loggedIn,
  loadActivity,
  userCanEditAPD,
  expectArray,
  build,
  addField,
  validate,
  deleteFromActivity,
  save,
  sendOne
} = require('../../../../middleware');

const logger = require('../../../../logger')(
  'apd activity approaches route post'
);

const {
  apdActivity: defaultActivityModel,
  apdActivityApproach: defaultApproachModel
} = require('../../../../db').models;

module.exports = (
  app,
  ActivityModel = defaultActivityModel,
  ApproachModel = defaultApproachModel
) => {
  logger.silly(`setting up PUT /activities/:id/approaches route`);
  app.put(
    '/activities/:id/approaches',
    loggedIn,
    loadActivity(),
    userCanEditAPD(ActivityModel),
    expectArray(),
    build(ApproachModel),
    addField({ fieldName: 'activity_id', fromParam: 'id' }),
    validate,
    deleteFromActivity('approaches'),
    save,
    sendOne(ActivityModel, {
      fetch: {
        withRelated: ['goals.objectives', 'approaches']
      }
    })
  );
};
