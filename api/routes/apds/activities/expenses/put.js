const logger = require('../../../../logger')('apd activites route put');
const {
  apdActivity: defaultActivityModel,
  apdActivityExpense: defaultActivityExpenseModel,
  apdActivityExpenseEntry: defaultActivityExpenseEntryModel
} = require('../../../../db').models;
const {
  loggedIn,
  loadActivity,
  userCanEditAPD,
  expectArray,
  deleteFromActivity,
  sendOne
} = require('../../../../middleware');

const createExpenses = (ExpenseModel, ExpenseEntryModel) => async (
  req,
  res,
  next
) => {
  try {
    // Add expenses and entries for this activity
    const activityID = req.meta.activity.get('id');
    await Promise.all(
      req.body.map(async expense => {
        if (expense.name) {
          const expenseModel = ExpenseModel.forge({
            name: expense.name,
            activity_id: activityID
          });
          await expenseModel.save();
          const expenseID = expenseModel.get('id');

          if (Array.isArray(expense.entries)) {
            await Promise.all(
              expense.entries.map(async entry => {
                const entryModel = ExpenseEntryModel.forge({
                  year: entry.year,
                  amount: entry.amount,
                  description: entry.description,
                  expense_id: expenseID
                });
                await entryModel.save();
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
  ExpenseModel = defaultActivityExpenseModel,
  ExpenseEntryModel = defaultActivityExpenseEntryModel
) => {
  logger.silly('setting up PUT /activities/:id/expenses route');
  app.put(
    '/activities/:id/expenses',
    loggedIn,
    loadActivity(),
    userCanEditAPD(ActivityModel),
    expectArray(),
    deleteFromActivity('expenses'),
    createExpenses(ExpenseModel, ExpenseEntryModel),
    sendOne(ActivityModel, {
      fetch: {
        withRelated: ['approaches', 'goals.objectives', 'expenses.entries']
      }
    })
  );
};

module.exports.createExpenses = createExpenses;
