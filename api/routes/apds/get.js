const logger = require('../../logger')('apds route get');
const defaultApdModel = require('../../db').models.apd;
const { loggedIn, sendOne } = require('../../middleware');

const getUserState = (req, res, next) => {
  if (!req.user.state) {
    logger.verbose('user does not have an associated state');
    return res.status(401).end();
  }
  req.params.stateID = req.user.state;
  return next();
};

module.exports = (app, ApdModel = defaultApdModel) => {
  logger.silly('setting up GET /apds route');

  app.get(
    '/apds',
    loggedIn,
    getUserState,
    sendOne(ApdModel, {
      idField: 'state_id',
      idParam: 'stateID',
      fetch: {
        withRelated: [
          'activities.goals.objectives',
          'activities.approaches',
          'activities.expenses'
        ]
      }
    })
  );
};

module.exports.getUserState = getUserState;
