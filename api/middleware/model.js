const logger = require('../logger')('model middleware');
const { cache, modelIndex } = require('./cache');

const addFieldMaker = ({ fieldName, fromParam = 'id' }) =>
  cache(['addField', fieldName, fromParam], () => {
    const addField = (req, res, next) => {
      logger.silly(
        req,
        `adding '${fieldName}' field to model(s), from parameter '${fromParam}'`
      );
      try {
        if (Array.isArray(req.meta.built)) {
          req.meta.built.forEach(m => m.set(fieldName, req.params[fromParam]));
        } else {
          req.meta.built.set(fieldName, req.params[fromParam]);
        }
        next();
      } catch (e) {
        logger.error(req, e);
        res.send(500).end();
      }
    };
    return addField;
  });

const buildMaker = model =>
  cache(['build', modelIndex(model)], () => {
    const build = (req, res, next) => {
      logger.silly(req, 'building model(s) from request');
      try {
        if (Array.isArray(req.body)) {
          req.meta.built = req.body.map(o => model.forge(o));
          logger.silly(`built ${req.meta.built.length} models`);
        } else {
          req.meta.built = model.forge(req.body);
          logger.silly('build one model');
        }
        next();
      } catch (e) {
        logger.error(req, e);
        res.status(500).end();
      }
    };
    return build;
  });

const cascadeDelete = async model => {
  if (model.relations) {
    const relations = Object.keys(model.relations);
    await Promise.all(
      relations.map(async relation => {
        const related = model.related(relation);
        await Promise.all(related.map(cascadeDelete));
      })
    );
  }
  await model.destroy();
};

const deleteFromActivityMaker = relation =>
  cache(['deleteFromActivity', relation], () => {
    const deleteFromActivity = async (req, res, next) => {
      await Promise.all(req.meta.activity.related(relation).map(cascadeDelete));
      next();
    };
    return deleteFromActivity;
  });

const expectArrayMaker = (expect = true) =>
  cache(['expectArray', expect], () => {
    const expectArray = (req, res, next) => {
      logger.silly(
        req,
        `verifying that the request is${expect ? '' : ' not'} an array`
      );
      if (expect && Array.isArray(req.body)) {
        return next();
      } else if (!expect && !Array.isArray(req.body)) {
        return next();
      }
      logger.verbose(
        req,
        `expected response to${expect ? '' : ' not'} be an array, but it is${
          expect ? ' not' : ''
        }`
      );
      return res.send(400).end();
    };
    return expectArray;
  });

const save = async (req, res, next) => {
  logger.silly(req, 'saving models');
  try {
    if (Array.isArray(req.meta.built)) {
      await Promise.all(req.meta.built.map(m => m.save()));
    } else {
      await req.meta.built.save();
    }
    next();
  } catch (e) {
    logger.error(req, e);
    res.status(500).end();
  }
};

const sendOneMaker = (model, { fetch, idField = 'id', idParam = 'id' } = {}) =>
  cache(['sendOne', modelIndex(model), fetch, idField, idParam], () => {
    const sendOne = async (req, res, next) => {
      logger.silly(
        req,
        `sending back one model, with '${idField}' param '${idParam}', with fetch:`,
        fetch
      );
      try {
        const toSend = await model
          .where({ [idField]: req.params[idParam] })
          .fetch(fetch);
        res.send(toSend.toJSON());
        next();
      } catch (e) {
        logger.error(req, e);
        res.status(500).end();
      }
    };
    return sendOne;
  });

const sendManyMaker = (model, { fetch, idField = 'id', idParam = 'id' } = {}) =>
  cache(['sendMany', modelIndex(model), fetch, idField, idParam], () => {
    const sendMany = async (req, res, next) => {
      try {
        const toSend = await model
          .where({ [idField]: req.params[idParam] })
          .fetchAll(fetch);
        res.send(toSend.toJSON());
        next();
      } catch (e) {
        logger.error(e);
        res.status(500).end();
      }
    };
    return sendMany;
  });

const upsertMaker = (model, { idField = 'id' } = {}) =>
  cache(['upsert', modelIndex(model), idField], () => {
    const upsert = async (req, res, next) => {
      try {
        const incoming = [];
        const outgoing = [];

        if (Array.isArray(req.body)) {
          incoming.push(...req.body);
        } else {
          incoming.push(req.body);
        }

        const existing = await model.fetchAll();

        existing.forEach(e => {
          const newInfo = incoming.find(a => a[idField] === e.get(idField));
          if (newInfo) {
            e.set(newInfo);
            outgoing.push(e);
          }
        });

        incoming
          .filter(a => typeof a[idField] === 'undefined')
          .forEach(newInfo => {
            outgoing.push(model.forge(newInfo));
          });

        req.meta.built = outgoing;

        next();
      } catch (e) {
        logger.error(req, e);
        res.status(500).end();
      }
    };
    return upsert;
  });

const validate = (req, res, next) => {
  logger.silly(req, 'validating models');
  try {
    if (Array.isArray(req.meta.built)) {
      req.meta.built.forEach(m => (m.validate ? m.validate() : null));
    } else if (req.meta.built.validate) {
      req.meta.built.validate();
    }
    next();
  } catch (e) {
    logger.error(req, e);
    res.status(400).end();
  }
};

module.exports = {
  addField: addFieldMaker,
  build: buildMaker,
  deleteFromActivity: deleteFromActivityMaker,
  expectArray: expectArrayMaker,
  save,
  sendOne: sendOneMaker,
  sendMany: sendManyMaker,
  upsert: upsertMaker,
  validate
};