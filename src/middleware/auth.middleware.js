export function auth(req, res, next) {
  const username = req.header("x-username");
  const role = req.header("x-role");

  console.log("[Auth] x-username:", username);
  console.log("[Auth] x-role:", role);

  // If headers missing, stop immediately 
  if (!username || !role) {
    res.status(401);
    return next(new Error("Missing auth headers: x-username and x-role are required"));
  }

  req.user = { username, role };
  next();
}


/*


This middleware function performs simple header-based authentication.
It extracts user identity information from custom HTTP headers
and attaches it to the request object for downstream use.

Expected Headers:
- x-username → identifies the user
- x-role → defines the user's role (e.g., DONOR, NGO, ADMIN)

Data Flow:
Client Request → auth middleware → req.user populated → Controller → Service

Behavior:

1. Reads authentication headers from the incoming request.
2. Logs the received username and role (for debugging purposes).
3. If either header is missing:
   - Sets HTTP status to 401 (Unauthorized).
   - Passes an error to Express error handling via next().
4. If valid:
   - Attaches user information to req.user.
   - Calls next() to continue request processing.

Important Notes:
- This is not secure production authentication.
- It does not validate tokens or verify credentials.
- Intended for development/testing or simplified role-based access control demos.

This middleware ensures that downstream layers
can reliably access authenticated user information via req.user.
*/