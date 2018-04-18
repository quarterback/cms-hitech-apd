const logger = require('../../logger')('users route post');
const defaultUserModel = require('../../db').models.user;
const { can, synchronizeSpecific } = require('../../middleware');

const syncResponder = (UserModel = defaultUserModel) => async req => {
  const user = await UserModel.where({ id: req.params.id }).fetch();
  if (!user) {
    const error = new Error();
    error.statusCode = 404;
    throw error;
  }
  return { model: user, action: 'edit-user' };
};

module.exports = app => {
  logger.silly('setting up PUT /users/:id route');
  // TODO [GW]: update authorization check here so users can edit themselves
  app.put(
    '/users/:id',
    can('edit-users'),
    synchronizeSpecific(syncResponder())
  );
};

module.exports.syncResponder = syncResponder;
