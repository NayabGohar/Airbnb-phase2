const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const mime = require('mime-types');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);

// Mock data for testing
const listings = [
  { id: 1, title: 'Beachfront Villa', location: 'Miami', price: 300, bedrooms: 3, bathrooms: 2, amenities: ['WiFi', 'Pool', 'Parking'], img: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/09/45/ed/fe/the-residency-hotel.jpg?w=1200&h=-1&s=1"},
  { id: 2, title: 'Mountain Cabin', location: 'Colorado', price: 250, bedrooms: 2, bathrooms: 1, amenities: ['WiFi', 'Hot Tub'], img: "https://pix10.agoda.net/hotelImages/788/788760/788760_15080519470033720939.jpg?ca=5&ce=1&s=414x232" },
];

const bookings = [];

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads')); // Serve uploaded files
app.use(cors({
  credentials: true,
  origin: 'http://127.0.0.1:5173',  // Adjust as needed for your frontend
  origin: "http://localhost:5173"
}));

// Helper function for local file upload
async function uploadToLocal(path, originalFilename, mimetype) {
  const newFilename = Date.now() + '.' + originalFilename.split('.').pop();
  const destPath = __dirname + '/uploads/' + newFilename;

  // Ensure the uploads directory exists
  if (!fs.existsSync(__dirname + '/uploads')) {
    fs.mkdirSync(__dirname + '/uploads');
  }

  // Move the file to the uploads folder
  fs.copyFileSync(path, destPath);
  return `/uploads/${newFilename}`;
}

// Mock User Data (No JWT or Authentication for now)
function getUserDataFromReq(req) {
  // Since no JWT, we assume a mock user is logged in for now
  return { id: 1, name: 'Test User', email: 'testuser@example.com' };
}

app.get('/api/test', (req, res) => {
  res.json('Test OK');
});

// Mock User Registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Mock user creation (no database)
  const userDoc = { name, email, password: bcrypt.hashSync(password, bcryptSalt) };
  res.json(userDoc);
});

// Mock Login (Skips actual password check)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const userDoc = { email }; // Mock user data for login

  const passOk = true;  // Always pass for mock
  if (passOk) {
    // Mock "token" without using JWT
    res.cookie('token', 'mock-token').json(userDoc);  // Send mock token
  } else {
    res.status(422).json('Invalid password');
  }
});

// Mock Profile Route (No JWT check, just returning mock data)
app.get('/api/profile', (req, res) => {
  const userData = getUserDataFromReq(req);  // Return mock user data
  res.json(userData);
});

// Mock Logout (Clearing mock token)
app.post('/api/logout', (req, res) => {
  res.cookie('token', '').json(true);
});

// Upload Image by Link (using local storage)
app.post('/api/upload-by-link', async (req, res) => {
  const { link } = req.body;
  const newName = 'photo' + Date.now() + '.jpg';
  await imageDownloader.image({
    url: link,
    dest: '/tmp/' + newName,
  });
  const url = await uploadToLocal('/tmp/' + newName, newName, mime.lookup('/tmp/' + newName));
  res.json(url);
});

// Multer Middleware for File Upload
const photosMiddleware = multer({ dest: '/tmp' });
app.post('/api/upload', photosMiddleware.array('photos', 100), async (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname, mimetype } = req.files[i];
    const url = await uploadToLocal(path, originalname, mimetype);
    uploadedFiles.push(url);
  }
  res.json(uploadedFiles);
});

// Mock Create Place
app.post('/api/places', async (req, res) => {
  const { title, address, addedPhotos, description, price, perks, extraInfo, checkIn, checkOut, maxGuests } = req.body;
  
  // Mock place creation
  const placeDoc = { title, address, photos: addedPhotos, description, price, perks, extraInfo, checkIn, checkOut, maxGuests };
  res.json(placeDoc);
});

// Mock Get User Places
app.get('/api/user-places', async (req, res) => {
  // Mock fetching places (no database)
  res.json(listings);
});

// Mock Get Place by ID
app.get('/api/places/:id', async (req, res) => {
  const { id } = req.params;
  const place = listings.find(place => place.id === parseInt(id));
  res.json(place || 'Place not found');
});

// Mock Get All Places
app.get('/api/places', async (req, res) => {
  res.json(listings);
});

// Mock Booking
app.post('/api/bookings', async (req, res) => {
  const userData = getUserDataFromReq(req);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body;

  // Mock booking creation
  const bookingDoc = { place, checkIn, checkOut, numberOfGuests, name, phone, price, user: userData.id };
  bookings.push(bookingDoc); // Store in memory (mock)
  res.json(bookingDoc);
});

// Mock Get Bookings for a User
app.get('/api/bookings', async (req, res) => {
  const userData = getUserDataFromReq(req);
  const userBookings = bookings.filter(booking => booking.user === userData.id);
  res.json(userBookings);
});

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});
