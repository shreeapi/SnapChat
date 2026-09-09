const express = require("express");
const axios = require("axios");
//  DONT TAKE CREDIT GUYS MEHANAT LAGTI HA // BY THE WAY KEEP GROWING AN LEARNING 
const app = express();

const PORT = process.env.PORT || 3000;

const BASE_URL = "https://schatdownloader.com/wp-admin/admin-ajax.php";

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    "Origin": "https://schatdownloader.com",
    "Referer": "https://schatdownloader.com/snapchat-profile-viewer/",
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept": "application/json, text/javascript, */*; q=0.01"
};


// Get fresh nonce
async function getNonce() {
    const params = new URLSearchParams();

    params.append("action", "ssv_get_nonce");

    const response = await axios.post(
        BASE_URL,
        params.toString(),
        {
            headers,
            timeout: 30000
        }
    );

    return response.data;
}


// Fetch Snapchat profile
async function fetchProfile(username, nonce) {
    const params = new URLSearchParams();

    params.append("action", "ssv_fetch_profile");
    params.append("nonce", nonce);
    params.append("username", username);

    const response = await axios.post(
        BASE_URL,
        params.toString(),
        {
            headers,
            timeout: 30000
        }
    );

    return response.data;
}


app.get("/", (req, res) => {
    res.json({
        status: true,
        message: "Snap API is running",
        endpoint: "/api/snap?username=ansh_trio"
    });
});


app.get("/api/snap", async (req, res) => {

    try {

        const username = req.query.username?.trim();

        if (!username) {
            return res.status(400).json({
                status: false,
                message: "Username is required",
                example: "/api/snap?username=ansh_trio"
            });
        }


        // Remove @ if user sends @username
        const cleanUsername = username.replace(/^@/, "");


        // STEP 1: Get nonce
        const nonceResponse = await getNonce();

        console.log("Nonce response:", nonceResponse);


        /*
         * Depending on the site's response,
         * nonce may be directly returned as string
         * or inside an object.
         */
        let nonce;

        if (typeof nonceResponse === "string") {
            nonce = nonceResponse;
        } else if (nonceResponse?.nonce) {
            nonce = nonceResponse.nonce;
        } else if (nonceResponse?.data?.nonce) {
            nonce = nonceResponse.data.nonce;
        } else if (typeof nonceResponse?.data === "string") {
            nonce = nonceResponse.data;
        }


        if (!nonce) {
            return res.status(500).json({
                status: false,
                message: "Unable to retrieve nonce",
                nonce_response: nonceResponse
            });
        }


        // STEP 2: Fetch profile
        const profile = await fetchProfile(
            cleanUsername,
            nonce
        );


        return res.json({
            status: true,
            username: cleanUsername,
            result: profile
        });

    } catch (error) {

        console.error(
            "API Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            status: false,
            message: "Failed to fetch Snapchat profile",
            error:
                error.response?.data ||
                error.message
        });
    }

});


app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
