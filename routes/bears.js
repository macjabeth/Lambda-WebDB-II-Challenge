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
router.post('/', async ({ body: newBear }, res) => {
  const result = Joi.validate(newBear, schema);
  if (result.error) {
    const messages = result.error.details.map(err => err.message);
    return res.status(400).json({ error: messages });
  }

  try {
    const [id] = await db('bears').insert(newBear);
    const [bear] = await db('bears').where({ id });
    res.status(201).json(bear);
  } catch (error) {
    debug(error); res.status(500).json({
      error: 'There was an error while saving the bear to the database.' // I find this error message rather comical
    });
  }
});

// R - GET
router.get('/', async (req, res) => {
  try {
    const bears = await db('bears');
    res.status(200).json(bears);
  } catch (error) {
    debug(error); res.status(500).json({
      error: 'The bears information could not be retrieved.'
    });
  }
});

router.get('/:id', async ({ params: { id } }, res) => {
  try {
    const [bear] = await db('bears').where({ id });
    Boolean(bear)
      ? res.status(200).json(bear)
      : res.status(404).json({ error: 'The bear with the specified ID does not exist.' });
  } catch (error) {
    debug(error); res.status(500).json({
      error: 'The bear information could not be retrieved.'
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
    const count = await db('bears').where({ id }).update(changes);
    Boolean(count)
      ? res.status(200).json({ count })
      : res.status(404).json({ error: 'The bear with the specified ID does not exist.' })
  } catch (error) {
    debug(error); res.status(304).json({
      error: 'The bear information could not be modified.'
    });
  }
});

// D - DELETE
router.delete('/:id', async ({ params: { id } }, res) => {
  try {
    const count = await db('bears').where({ id }).del();
    Boolean(count)
      ? res.status(204).end()
      : res.status(404).json({ error: 'The bear with the specified ID does not exist.' })
  } catch (error) {
    debug(error); res.status(500).json({
      error: 'The bear could not be removed.'
    });
  }
});

module.exports = router;
