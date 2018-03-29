const logger = require('../../../../logger')('apd activites route put');
const {
  apdActivity: defaultActivityModel,
  apdActivityGoal: defaultGoalModel,
  apdActivityGoalObjective: defaultObjectiveModel
} = require('../../../../db').models;
const {
  loggedIn,
  loadActivity,
  userCanEditAPD,
  expectArray,
  deleteFromActivity,
  sendOne
} = require('../../../../middleware');

const createGoalsAndObjectives = (GoalModel, ObjectiveModel) => async (
  req,
  res,
  next
) => {
  try {
    const activityID = req.meta.activity.get('id');

    logger.silly(req, 'creating new goal models');
    await Promise.all(
      req.body.map(async goal => {
        if (goal.description) {
          const goalModel = GoalModel.forge({
            description: goal.description,
            activity_id: activityID
          });
          await goalModel.save();
          const goalID = goalModel.get('id');

          if (Array.isArray(goal.objectives)) {
            await Promise.all(
              goal.objectives.map(async objective => {
                if (typeof objective === 'string' && objective) {
                  const objectiveModel = ObjectiveModel.forge({
                    description: objective,
                    activity_goal_id: goalID
                  });
                  await objectiveModel.save();
                }
              })
            );
          }
        }
      })
    );

    next();
  } catch (e) {
    logger.error(req, e);
    res.status(500).end();
  }
};

module.exports = (
  app,
  ActivityModel = defaultActivityModel,
  GoalModel = defaultGoalModel,
  ObjectiveModel = defaultObjectiveModel
) => {
  logger.silly('setting up PUT /activities/:id/goals route');
  app.put(
    '/activities/:id/goals',
    loggedIn,
    loadActivity(),
    userCanEditAPD(ActivityModel),
    expectArray(),
    deleteFromActivity('goals'),
    createGoalsAndObjectives(GoalModel, ObjectiveModel),
    sendOne(ActivityModel, {
      fetch: { withRelated: ['goals.objectives', 'approaches'] }
    })
  );
};

module.exports.createGoalsAndObjectives = createGoalsAndObjectives;
