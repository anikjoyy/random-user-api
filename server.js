const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const dataFilePath = './user-data.json';

// Helper function to read the user data from the JSON file
function readUserData() {
  const data = fs.readFileSync(dataFilePath);
  return JSON.parse(data);
}

// Helper function to write the user data to the JSON file
function writeUserData(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Endpoint: GET /user/random
app.get('/user/random', (req, res) => {
  const userData = readUserData();
  const randomUser = userData[Math.floor(Math.random() * userData.length)];
  res.json(randomUser);
});

// Endpoint: GET /user/all
app.get('/user/all', (req, res) => {
  const userData = readUserData();
  res.json(userData);
});

// Endpoint: POST /user/save
app.post('/user/save', (req, res) => {
  const userData = readUserData();
  const newUser = req.body;
  newUser.id = uuidv4();
  userData.push(newUser);
  writeUserData(userData);
  res.json(newUser);
});

// Endpoint: PATCH /user/update/:id
app.patch('/user/update/:id', (req, res) => {
  const userId = req.params.id;
  const userData = readUserData();
  const updatedUser = req.body;
  const userIndex = userData.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
  } else {
    userData[userIndex] = { ...userData[userIndex], ...updatedUser };
    writeUserData(userData);
    res.json(userData[userIndex]);
  }
});

// Endpoint: PATCH /user/bulk-update
app.patch('/user/bulk-update', (req, res) => {
  const userIds = req.body;
  const userData = readUserData();
  const updatedUsers = [];
  userIds.forEach((userId) => {
    const userIndex = userData.findIndex((user) => user.id === userId);
    if (userIndex !== -1) {
      const updatedUser = { ...userData[userIndex], ...req.body };
      userData[userIndex] = updatedUser;
      updatedUsers.push(updatedUser);
    }
  });
  writeUserData(userData);
  res.json(updatedUsers);
});

// Endpoint: DELETE /user/delete/:id
app.delete('/user/delete/:id', (req, res) => {
  const userId = req.params.id;
  const userData = readUserData();
  const userIndex = userData.findIndex((user) => user.id === userId);
  if (userIndex === -1) {
    res.status(404).json({ error: 'User not found' });
  } else {
    const deletedUser = userData.splice(userIndex, 1);
    writeUserData(userData);
    res.json(deletedUser[0]);
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
