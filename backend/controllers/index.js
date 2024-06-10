const authController = require('./authController');
const userController = require('./userController');
const companyController = require('./companyController');
const contractController = require('./contractController');
const fileController = require('./fileController');
const benefitController = require('./benefitController');
const invoiceController = require('./invoiceController');
// const chatController = require('./chatController');

module.exports = {
  ...authController,
  ...userController,
  ...companyController,
  ...contractController,
  ...fileController,
  ...benefitController,
  ...invoiceController,
    // ...chatController,
};
