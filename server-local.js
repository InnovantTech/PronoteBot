'use strict';

const app = require('./express/server2');
const PORT = 5555;

app.listen(PORT, () => console.log(`> Ready on http://localhost:${PORT}`));
