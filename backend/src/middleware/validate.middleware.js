export function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = req[source];
    const result = schema.safeParse(data);
    if (!result.success) {
      const flat = result.error.flatten();
      // Build a user-friendly message from field errors
      const fieldErrors = flat.fieldErrors;
      let message = "Validation failed";
      const firstField = Object.keys(fieldErrors)[0];
      if (firstField && fieldErrors[firstField]?.[0]) {
        message = fieldErrors[firstField][0];
        // Make message more user-friendly for common cases
        if (firstField === "message" && message.includes("5000")) {
          message = "Message is too long. Please keep it under 5000 characters.";
        } else if (firstField === "conversationId") {
          message = "Invalid conversation. Please start a new chat.";
        }
      } else if (flat.formErrors && flat.formErrors[0]) {
        message = flat.formErrors[0];
      }
      return res.status(400).json({ error: message, details: flat });
    }
    req[source] = result.data;
    next();
  };
}
