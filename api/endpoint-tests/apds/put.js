const tap = require('tap'); // eslint-disable-line import/no-extraneous-dependencies
const {
  db,
  getFullPath,
  login,
  request,
  unauthenticatedTest
} = require('../utils');
const {
  apd: { valid: { put: validAPD }, invalid: { put: invalidAPDs } }
} = require('../data');

tap.test('APD endpoint | PUT /apds/:id', async putAPDTest => {
  const url = apdID => getFullPath(`/apds/${apdID}`);
  await db().seed.run();

  unauthenticatedTest('put', url(1), putAPDTest);

  putAPDTest.test(
    'when authenticated as a user with permission',
    async authenticated => {
      const cookies = await login('user2@email', 'something');

      authenticated.test('with a non-existant apd ID', async invalidTest => {
        const { response, body } = await request.put(url(9000), {
          jar: cookies,
          json: true
        });

        invalidTest.equal(response.statusCode, 404, 'gives a 404 status code');
        invalidTest.notOk(body, 'does not send a body');
      });

      authenticated.test(
        `with an APD in a state other than the user's state`,
        async invalidTest => {
          const { response, body } = await request.put(url(4001), {
            jar: cookies,
            json: true
          });

          invalidTest.equal(
            response.statusCode,
            404,
            'gives a 404 status code'
          );
          invalidTest.notOk(body, 'does not send a body');
        }
      );

      authenticated.test('with invalid updates', async test => {
        await Promise.all(
          invalidAPDs.map(async apd => {
            const { response, body } = await request.put(url(4000), {
              jar: cookies,
              json: apd
            });

            test.equal(response.statusCode, 400, 'gives a 400 status code');
            test.match(
              body,
              { action: 'update-apd', error: String },
              'sends back an error token'
            );
          })
        );
      });

      authenticated.test('with a valid update', async validTest => {
        const { response, body } = await request.put(url(4000), {
          jar: cookies,
          json: validAPD
        });

        const expect = { ...validAPD };
        expect.activities.forEach(a =>
          a.goals.forEach(goal => {
            goal.objectives = goal.objectives.map(o => o.description); // eslint-disable-line no-param-reassign
          })
        );

        validTest.equal(response.statusCode, 200, 'gives a 200 status code');
        validTest.match(
          body,
          {
            ...expect,
            id: 4000,
            state_id: 'mn'
          },
          'sends back the updated APD object',
          { diagnostic: true }
        );
      });
    }
  );
});
