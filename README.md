# Fire gtfs

Fire gtfs allows to broadcast gtfs information to mobile devices runnign Android and iOS.
It uses Google GCM as protocol.

If you want to push times to your users in real times, this is the API you need.

Fire gtfs will auto schedule daily updates and cache times for you. It will allow your database to rest while notifications are being sent to your users.

Fire gtfs requires a database created with Fire gtfs database (coming soon)

## Installation

npm install

## Requirements

For node-gcm
This library provides the server-side implementation of GCM.
You need to generate an [API Key](https://developers.google.com/cloud-messaging/gcm#apikey).

Edit your environnment variable : SERVER_GCM_KEY
Set it to your GCM key.

Edit lib/config/config.json 
You can use the example provided at lib/config/config.json.example

## Example application

node scripts/fire.js
