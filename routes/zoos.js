const Joi = require('joi');
const debug = require('debug')('server:db');
const config = require('config').get('dbConfig');
const router = require('express').Router();
const db = require('knex')(config);

// Validation
const schema = Joi.object().keys({
  name: Joi.string().required()
});

// C - POST
router.post('/', async ({ body: newZoo }, res) => {
  const result = Joi.validate(newZoo, schema);
  if (result.error) {
    const messages = result.error.details.map(err => err.message);
    return res.status(400).json({ error: messages });
  }

  try {
    const [id] = await db('zoos').insert(newZoo);
    const [zoo] = await db('zoos').where({ id });
    res.status(201).json(zoo);
  } catch (error) {
    debug(error); res.status(500).json({
      error: 'There was an error while saving the zoo to the database.'
    });
  }
});

// R - GET
router.get('/', async (req, res) => {
  try {
    const zoos = await db('zoos');
    res.status(200).json(zoos);
  } catch (error) {
    debug(error); res.status(500).json({
      error: 'The zoos information could not be retrieved.'
    });
  }
});

router.get('/:id', async ({ params: { id } }, res) => {
  try {
    const [zoo] = await db('zoos').where({ id });
    Boolean(zoo)
      ? res.status(200).json(zoo)
      : res.status(404).json({ error: 'The zoo with the specified ID does not exist.' });
  } catch (error) {
    debug(error); res.status(500).json({
      error: 'The zoo information could not be retrieved.'
    });
  }
});

// U - PUT
router.put('/:id', async ({ params: { id }, body: changes }, res) => {
  const result = Joi.validate(changes, schema);
  if (result.error) {
    const messages = result.error.details.map(err => err.message);
    return res.status(400).json({ error: messages });
  }

  try {
    const count = await db('zoos').where({ id }).update(changes);
    Boolean(count)
      ? res.status(200).json({ count })
      : res.status(404).json({ error: 'The zoo with the specified ID does not exist.' })
  } catch (error) {
    debug(error); res.status(304).json({
      error: 'The zoo information could not be modified.'
    });
  }
});

// D - DELETE
router.delete('/:id', async ({ params: { id } }, res) => {
  try {
    const count = await db('zoos').where({ id }).del();
    Boolean(count)
      ? res.status(204).end()
      : res.status(404).json({ error: 'The zoo with the specified ID does not exist.' })
  } catch (error) {
    debug(error); res.status(500).json({
      error: 'The zoo could not be removed.'
    });
  }
});

module.exports = router;
