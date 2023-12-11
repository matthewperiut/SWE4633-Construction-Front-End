require('dotenv').config();
const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();
const port = process.env.PORT || 8000;

// Serve static files from the 'website' directory
app.use(express.static('website'));

// Endpoint to handle the Cognito code and return tokens
app.get('/get-user', async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) {
            return res.status(400).send('No code provided');
        }

        // Exchange code for tokens
        const data = qs.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.COGNITO_CLIENT_ID,
            code: code,
            redirect_uri: process.env.COGNITO_REDIRECT_URI
        });

        const response = await axios.post('https://swe4633final.auth.us-east-1.amazoncognito.com/oauth2/token', data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Extract tokens from the response
        const { id_token, access_token, refresh_token } = response.data;

        // Send tokens back to the client
        res.json({
            idToken: id_token,
            accessToken: access_token,
            refreshToken: refresh_token
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
