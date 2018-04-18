const approaches = {
  invalid: {
    put: [[{ fails: 'because', doesnot: 'have expected fields' }]]
  },
  valid: {
    put: {
      description: 'approach description',
      alternatives: 'approach alternatives',
      explanation: 'approach explanation'
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
    put: [{ description: 'new goal' }]
  }
};

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
      [
        {
          name: 'Find Success'
        },
        {
          id: 4100
        }
      ]
    ]
  },
  valid: {
    put: {
      id: 4100,
      name: 'new activity name',
      description: 'activity description',
      approaches: approaches.valid.put,
      goals: goals.valid.put
    }
  }
};
approaches.invalid.put.forEach(badApproaches => {
  activities.invalid.put.push({
    ...activities.valid.put,
    approaches: badApproaches
  });
});
goals.invalid.put.forEach(badGoals => {
  activities.invalid.put.push({
    ...activities.valid.put,
    goals: badGoals
  });
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
      activities: activities.valid.put
    }
  }
};
activities.invalid.put.forEach(badActivities => {
  apd.invalid.put.push({
    ...apd.valid.put,
    activities: badActivities
  });
});

console.log(JSON.stringify(apd.invalid.put, null, 2));
