const bcrypt = require('bcryptjs');

(async () => {
  const password = 'testpassword'; // The password you are testing
  const hashedPassword = '$2a$10$jXUBZNwM/g7enM0NgzerK.oHuo0pYi5b1Htaa2pEJBwjUDJIZL.cO'; // Replace with actual hashed password from the database

  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log('Password Match:', isMatch); // Should be true if the password matches
})();

