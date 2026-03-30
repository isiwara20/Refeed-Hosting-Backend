/**
 * State transitions for lifecycle
 * Open/Closed Principle: easy to extend by editing ONLY this map.
 */
const transitions = {
  DRAFT: ["PUBLISHED", "CANCELLED"],
  PUBLISHED: ["RESERVED", "EXPIRED"],      // PUBLISHED -> RESERVED
  RESERVED: ["COLLECTED"],                // RESERVED -> COLLECTED
  COLLECTED: ["COMPLETED"],               // COLLECTED -> COMPLETED
};

export function validateTransition(current, next) {
  if (!transitions[current]?.includes(next)) {
    throw new Error(`Invalid status transition: ${current} → ${next}`);
  }
}




/*


This defines and validates the allowed state transitions
for the donation lifecycle using a centralized transition map.

Purpose:
Enforce strict lifecycle rules for surplus donations and prevent
invalid status changes.

Design Principle:
Open/Closed Principle (OCP):
- To modify lifecycle behavior, only the "transitions" map needs editing.
- The validation logic remains unchanged.

Lifecycle Flow:
DRAFT → PUBLISHED → RESERVED → COLLECTED → COMPLETED
Additional allowed transitions:
- DRAFT → CANCELLED
- PUBLISHED → EXPIRED

Function Behavior:

validateTransition(current, next):
- Checks whether the "next" status exists in the allowed transitions
  for the given "current" status.
- If the transition is invalid, it throws an error.
- If valid, execution continues normally.

Data Flow:
Service Layer → validateTransition() → (if valid) → Repository update

This module contains pure business rule enforcement
and does not interact with the database,
ensuring clean separation between state validation logic
and data persistence.
*/
