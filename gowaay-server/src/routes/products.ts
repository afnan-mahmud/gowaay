import express from 'express';
import { body, query } from 'express-validator';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { requireUser, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router: express.Router = express.Router();
// Validation rules
const createProductValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters long'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

const updateProductValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters long'),
  body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().trim().notEmpty().withMessage('Category is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

const getProductsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  query('search').optional().trim().notEmpty().withMessage('Search term cannot be empty'),
];

// Routes
router.get('/', getProductsValidation, validateRequest, getProducts);
router.get('/:id', getProductById);
router.post('/', requireUser, requireRole(['admin']), createProductValidation, validateRequest, createProduct);
router.put('/:id', requireUser, requireRole(['admin']), updateProductValidation, validateRequest, updateProduct);
router.delete('/:id', requireUser, requireRole(['admin']), deleteProduct);

export default router;
