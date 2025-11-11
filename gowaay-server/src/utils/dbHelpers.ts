/**
 * Database Helper Utilities
 * Provides timeout protection and error handling for database queries
 */

/**
 * Wraps a database query with timeout protection
 * @param promise - The database query promise
 * @param timeoutMs - Timeout in milliseconds (default: 10000ms)
 * @param errorMessage - Custom error message
 * @returns Promise with timeout protection
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Database query timeout'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

/**
 * Safely executes a database query with error handling
 * @param queryFn - Function that returns a database query promise
 * @param fallbackValue - Value to return if query fails
 * @param timeoutMs - Timeout in milliseconds
 * @returns Query result or fallback value
 */
export const safeQuery = async <T>(
  queryFn: () => Promise<T>,
  fallbackValue: T | null = null,
  timeoutMs: number = 10000
): Promise<T | null> => {
  try {
    return await withTimeout(queryFn(), timeoutMs);
  } catch (error) {
    console.error('Safe query error:', error);
    return fallbackValue;
  }
};

/**
 * Validates MongoDB ObjectId
 * @param id - ID to validate
 * @returns boolean
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Safely gets a document by ID with validation
 * @param Model - Mongoose model
 * @param id - Document ID
 * @param timeoutMs - Timeout in milliseconds
 * @returns Document or null
 */
export const findByIdSafe = async <T>(
  Model: any,
  id: string,
  timeoutMs: number = 5000
): Promise<T | null> => {
  if (!id || !isValidObjectId(id)) {
    return null;
  }

  try {
    return await withTimeout(
      Model.findById(id),
      timeoutMs,
      `Query timeout for ${Model.modelName}`
    );
  } catch (error) {
    console.error(`Error finding ${Model.modelName} by ID:`, error);
    return null;
  }
};

/**
 * Safely populates a query with timeout
 * @param query - Mongoose query
 * @param populateFields - Fields to populate
 * @param timeoutMs - Timeout in milliseconds
 * @returns Query result or null
 */
export const populateSafe = async <T>(
  query: any,
  populateFields: string | string[],
  timeoutMs: number = 5000
): Promise<T | null> => {
  try {
    const populated = Array.isArray(populateFields)
      ? query.populate(populateFields)
      : query.populate(populateFields);
      
    return await withTimeout(populated, timeoutMs);
  } catch (error) {
    console.error('Populate query error:', error);
    return null;
  }
};

/**
 * Retries a database operation with exponential backoff
 * @param operation - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param initialDelay - Initial delay in ms
 * @returns Operation result
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: Error | unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`Operation failed, retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Checks if error is a MongoDB connection error
 * @param error - Error object
 * @returns boolean
 */
export const isConnectionError = (error: any): boolean => {
  return (
    error.name === 'MongoNetworkError' ||
    error.name === 'MongoTimeoutError' ||
    error.message?.includes('ECONNREFUSED') ||
    error.message?.includes('connection') ||
    error.message?.includes('timeout')
  );
};

/**
 * Safely updates a document with optimistic locking
 * @param Model - Mongoose model
 * @param id - Document ID
 * @param updates - Update data
 * @param version - Current version for optimistic locking
 * @returns Updated document or null
 */
export const updateWithOptimisticLock = async <T>(
  Model: any,
  id: string,
  updates: any,
  version?: number
): Promise<T | null> => {
  try {
    const query = version !== undefined 
      ? { _id: id, __v: version }
      : { _id: id };

    return await withTimeout(
      Model.findOneAndUpdate(
        query,
        { ...updates, $inc: { __v: 1 } },
        { new: true }
      ),
      5000
    );
  } catch (error) {
    console.error('Optimistic lock update error:', error);
    return null;
  }
};

