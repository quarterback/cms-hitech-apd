const contractorCosts = {
  invalid: {
    put: [[{ year: 1993 }], [{ year: 3047 }]]
  },
  valid: {
    put: {
      year: 2018,
      cost: '1000.00'
    }
  }
};

const expenseEntries = {
  valid: {
    put: {
      description: 'expense entry description',
      year: '2020',
      amount: '1000.00'
    }
  }
};

const goalObjectives = {
  valid: {
    put: { description: 'objective 1' }
  }
};

const personnelCosts = {
  invalid: {
    put: [
      [{ year: 1993 }],
      [{ year: 1993, fte: 0.5 }],
      [{ year: 3047 }],
      [{ year: 3047, fte: 0.5 }],
      [{ year: 2018, fte: -3.2 }],
      [{ fte: -3.2 }],
      [{ year: 2018, fte: 1.7 }],
      [{ fte: 1.7 }]
    ]
  },
  valid: {
    put: {
      year: 2018,
      cost: '1000.00',
      fte: '0.50'
    }
  }
};

const approaches = {
  invalid: {
    put: [
      [
        {
          fails: 'because',
          doesnot: 'have expected fields'
        }
      ]
    ]
  },
  valid: {
    put: {
      description: 'approach description',
      alternatives: 'approach alternatives',
      explanation: 'approach explanation'
    }
  }
};

const contractorResources = {
  invalid: {
    put: [
      [{ start: 'some non-date string' }],
      [{ end: 'some non-date string' }]
    ]
  },
  valid: {
    put: {
      name: 'contractor name',
      description: 'contractor description',
      start: '2018-01-01T00:00:00.000Z',
      end: '2018-01-02T00:00:00.000Z',
      years: [contractorCosts.valid.put]
    }
  }
};
contractorCosts.invalid.put.forEach(badCost => {
  contractorResources.invalid.put.push([
    {
      ...contractorResources.valid.put,
      years: badCost
    }
  ]);
});

const expenses = {
  valid: {
    put: {
      name: 'expense name',
      entries: [expenseEntries.valid.put]
    }
  }
};

const goals = {
  invalid: {
    put: [
      [{ description: 'new goal' }, { invalid: 'this one is bad' }],
      [{ description: 7 }]
    ]
  },
  valid: {
    put: {
      description: 'new goal',
      objectives: [goalObjectives.valid.put]
    }
  }
};

const schedule = {
  valid: {
    put: {
      actualEnd: 'hi',
      actualStart: 'hi',
      milestone: 'hi',
      plannedEnd: 'hi',
      plannedStart: 'hi',
      status: 'hi'
    }
  }
};

const statePersonnel = {
  invalid: {
    put: []
  },
  valid: {
    put: {
      title: 'personnel title',
      description: 'personnel description',
      years: [personnelCosts.valid.put]
    }
  }
};
personnelCosts.invalid.put.forEach(badCost => {
  statePersonnel.invalid.put.push([
    {
      ...statePersonnel.valid.put,
      years: badCost
    }
  ]);
});

const activities = {
  invalid: {
    post: [
      {
        name: 'Find Success',
        description: 'activity description'
      },
      {
        name: 7,
        description: 'activity description'
      }
    ],
    put: [
      [{ name: 'Find Success' }, { id: 4100 }],
      [{ name: 7 }],
      [{ name: 'valid name' }, { name: null }]
    ]
  },
  valid: {
    put: {
      id: 4100,
      name: 'new activity name',
      description: 'activity description',
      approaches: [approaches.valid.put],
      contractorResources: [contractorResources.valid.put],
      expenses: [expenses.valid.put],
      goals: [goals.valid.put],
      // schedule: [schedule.valid.put],
      statePersonnel: [statePersonnel.valid.put]
    }
  }
};
approaches.invalid.put.forEach(badApproaches => {
  activities.invalid.put.push([
    {
      ...activities.valid.put,
      approaches: badApproaches
    }
  ]);
});
contractorResources.invalid.put.forEach(badContractorResources => {
  activities.invalid.put.push([
    {
      ...activities.valid.put,
      contractorResources: badContractorResources
    }
  ]);
});
goals.invalid.put.forEach(badGoals => {
  activities.invalid.put.push([
    {
      ...activities.valid.put,
      goals: badGoals
    }
  ]);
});
statePersonnel.invalid.put.forEach(badStatePersonnel => {
  activities.invalid.put.push([
    {
      ...activities.valid.put,
      statePersonnel: badStatePersonnel
    }
  ]);
});

const apd = {
  invalid: {
    put: []
  },
  valid: {
    put: {
      id: 4000,
      status: 'new status',
      period: 'new period',
      activities: [activities.valid.put]
    }
  }
};
activities.invalid.put.forEach(badActivities => {
  apd.invalid.put.push({
    ...apd.valid.put,
    activities: badActivities
  });
});

module.exports = {
  apd,
  activities,
  approaches,
  contractorResources,
  contractorCosts,
  goals,
  goalObjectives,
  schedule,
  statePersonnel,
  personnelCosts
};
