const logger = require('../../../logger')('apd activites route put');
const { apdActivity: defaultActivityModel } = require('../../../db').models;
const {
  loggedIn,
  loadActivity,
  synchronizeSpecific,
  userCanEditAPD
} = require('../../../middleware');

const putters = [null, 'approaches', 'expenses', 'goals', 'schedule'];

module.exports = (app, ActivityModel = defaultActivityModel) => {
  putters.forEach(putter => {
    logger.silly(
      `setting up PUT /activities/:id${putter ? `/${putter}` : ''} route`
    );

    const syncResponder = req => {
      if (putter) {
        req.body = { [putter]: req.body };
      }
      return { model: req.meta.activity, action: 'update-activity' };
    };
    module.exports.syncResponders[putter || 'base'] = syncResponder;

    app.put(
      `/activities/:id${putter ? `/${putter}` : ''}`,
      loggedIn,
      loadActivity(),
      userCanEditAPD(ActivityModel),
      synchronizeSpecific(syncResponder)
    );
  });
};

module.exports.syncResponders = {};
