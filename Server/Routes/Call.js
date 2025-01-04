const { v4: uuidv4 } = require("uuid");
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const express = require("express");
const app = express();

// use the Express JSON middleware
app.use(express.json());

// create the twilioClient
const twilioClient = require("twilio")(
  "SKffabfee7bda6be3f31d69d2bdebac1f6",
  "wywre4P1DEvFs8AJeKfFidWDzl39eyaG",
  { accountSid: "ACe3bc26b23d25de1ced72532eb0095d87" }
);

const findOrCreateRoom = async (roomName) => {
  try {
    // see if the room exists already. If it doesn't, this will throw
    // error 20404.
    await twilioClient.video.v1.rooms(roomName).fetch();
  } catch (error) {
    // the room was not found, so create it
    if (error.code == 20404) {
      await twilioClient.video.v1.rooms.create({
        uniqueName: roomName,
        type: "go",
      });
    } else {
      // let other errors bubble up
      throw error;
    }
  }
};

const getAccessToken = (roomName) => {
  // create an access token
  const token = new AccessToken(
    "ACe3bc26b23d25de1ced72532eb0095d87rr",
    "SKffabfee7bda6be3f31d69d2bdebac1f6",
    "wywre4P1DEvFs8AJeKfFidWDzl39eyaG",
    // generate a random unique identity for this participant
    { identity: uuidv4() }
  );
  // create a video grant for this specific room
  const videoGrant = new VideoGrant({
    room: roomName,
  });

  // add the video grant
  token.addGrant(videoGrant);
  // serialize the token and return it
  return token.toJwt();
};

app.post("/join-room", async (req, res) => {
  // return 400 if the request has an empty body or no roomName
  if (!req.body || !req.body.roomName) {
    return res.status(400).send("Must include roomName argument.");
  }
  const roomName = req.body.roomName;
  // find or create a room with the given roomName
  findOrCreateRoom(roomName);
  // generate an Access Token for a participant in this room
  const token = getAccessToken(roomName);
  res.json({
    token: token,
  });
});

module.exports = app;
