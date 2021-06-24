const express = require('express');
const controller = require('@controllers/user.controller');

const router = express.Router();

/**
 * Load user when API with userId route parameter is hit
 */
router.param('userId', controller.load);


router
  .route('/')
  .get(controller.list)
  .post(controller.create);

router
  .route('/nearestUser')
  .get(controller.getUserList,controller.calculateDistance,controller.sortUserlistByDistance,controller.nearestUserlist)

router
  .route('/:userId')
  .get(controller.get)
  .put(controller.replace)
  .patch(controller.update)
  .delete(controller.remove);


module.exports = router;
