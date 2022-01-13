
const fs = require('fs');
const {google} = require('googleapis');
const express = require("express");
const app = express();

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

function GCClient(credentialsPath) {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8")).web;
  const {client_secret, client_id, redirect_uris} = credentials;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, 
    client_secret, 
    redirect_uris[0]
  );
  this.client = oAuth2Client;
  this.authUrl = function() {
    const authUrl = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    return authUrl;
  }
  this.authorize = async function (code) {
    const { token } = await this.getAccessToken(code);
    this.token = token;
    return oAuth2Client;
  };
  this.listEvents = function() {
    const calendar = google.calendar({version: 'v3', auth: this.client});
    return new Promise((resolve, reject) => {
      calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        const events = res.data.items;
        resolve(events);
      });
    });
  }
  this.getAccessToken = async function(code) {
    const that = this;
    return new Promise((resolve, reject) => {
      that.client.getToken(code, (err, token) => {
        if (err) {
          reject(err);
          return;
        }
        that.client.setCredentials(token);
        // Store the token to disk for later program executions
        resolve({
          client: this.client,
          token,
        });
      });
    });

  }
  this.waitAuth = function (port) {
    const that = this;
    return new Promise((resolve, reject) => {
      this.app = express();
      const server = this.app.listen(port);
      this.app.get("/refresh_token", async (req, res) => {
        res.status(200).json({
          message: "success",
        });
        await that.authorize(req.query.code)
        server.close();
        that.app = null;
        resolve();
      });
    });
  }
}

module.exports = GCClient;
