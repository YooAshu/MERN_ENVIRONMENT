// wrapper function for async await with try and catch
// This function is a middleware wrapper that simplifies error handling in asynchronous Express route handlers.
// Accepts an async function (fn) as a parameter.
// Returns another async function that acts as a middleware.
// Inside, it:
// Tries to execute fn(req, res, next).

// Why Use asyncHandler?
// Avoids using try...catch in every route.
// Ensures proper error handling without crashing the server.
// We don't have to write try and catch every time when defining app.get('/', function)

const asyncHandler = (fn = async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
});
