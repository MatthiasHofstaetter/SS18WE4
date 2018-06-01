/*jslint node: true */
/*jslint esversion: 6*/
/*jslint eqeqeq: true */

/* global require */

(function() {
    "use strict";

    const express = require("express");
    const app = express();
    const fs = require("fs");

    const bodyParser = require("body-parser");
    const jwt = require("jsonwebtoken");
    const cors = require("cors");
    const simulation = require("./simulation.js");
    const expressWs = require('express-ws')(app);

    let user;
    let available;
    let devices = {};

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(cors());


    //todo: before every function called by Rest check token in authentication header
    app.get("/devices/available", getAvailable);
    app.post("/authentication", authenticate);
    app.put("/password", changePassword);

    app.get("/devices", getDevices);
    app.post("/devices", addDevice);
    app.delete("/devices/:index", deleteDevice);
    app.patch("/devices/:index", moveDevice);
    app.post("/devices/:index/successors", addSuccessor);
    app.delete("/devices/:predecessor/successors/:successor", deleteSuccessor);

    // TODO Create a WebSocket that clients can connect to
    var updateThing = expressWs.getWss('/updateDevices'); //leave out path to broadcast to all clients

    app.ws('/updateDevices',function(ws,req){
        console.log("client verbunden");
        console.log("devices: "+devices);


        //callback functions:
        ws.on('message',(msg,flags)=>{
            
            let msgJson = JSON.parse(msg);

            console.log("update index: "+msgJson.index);
            console.log("update value: "+msgJson.updateValue);

            //verify message
            verifyJWT(msgJson.jwt);
            
            updateDevice(msgJson.index,msgJson.updateValue);
            //broadcast reply
            updateThing.clients.forEach((client)=>{
                //client.send(JSON.stringify(data));
                client.send("hallo vom server!");
            });
        });
    });

   

    // TODO Check validity of JWT tokens on requests

    /**
     * Send the list of available devices to the client
     * @param req The request
     * @param res The response
     */
    function getAvailable(req, res) {
        if (!available) {
            res.status(500).json({message: "Devices not loaded"});
        } else {
            res.status(200).json(available);
        }
    }

    function updateDevice(index, updateValue){
        console.log("current: "+ devices[index].control.current);
        devices[index].control.current = updateValue;
    }

    /**
     * Send the list of previously added devices to the client
     * @param req The request
     * @param res The response
     */
    function getDevices(req, res) {
        res.status(200).json(Object.keys(devices).map(index => devices[index]));
    }

    /**
     * Add a new device
     * @param req The request
     * @param res The response
     */
    function addDevice(req, res) {
        if (devices[req.body.index]) {
            res.status(415).json({message: "Device already exists"});
        } else {
            devices[req.body.index] = {
                index: req.body.index,
                type: req.body.type,
                title: req.body.title,
                position: req.body.position,
                control: req.body.control,
                successors: req.body.successors || []
            };
            res.status(200).json({message: "Device added"});
        }
    }

    /**
     * Delete a previously added device
     * @param req The request
     * @param res The response
     */
    function deleteDevice(req, res) {
        if (!devices[req.params.index]) {
            res.status(404).json({message: "Device does not exist"});
        } else {
            delete devices[req.params.index];
            Object.entries(devices).forEach(([key, device]) => deleteArrayEntry(device.successors, +req.params.index));
            res.status(200).json({message: "Device deleted"});
        }
    }

    /**
     * Update a device's position
     * @param req The request
     * @param res The response
     */
    function moveDevice(req, res) {
        if (!devices[req.params.index]) {
            res.status(404).json({message: "Device does not exist"});
        } else {
            devices[req.params.index].position = req.body.position;
            res.status(200).json({message: "Device position updated"});
        }
    }

    /**
     * Add a connection between two devices
     * @param req The request
     * @param res The response
     */
    function addSuccessor(req, res) {
        if (!devices[req.params.index]) {
            res.status(404).json({message: "Start device does not exist"});
        } else if (!devices[req.body.index]) {
            res.status(400).json({message: "End does not exist"});
        } else {
            devices[req.params.index].successors.push(req.body.index);
            res.status(200).json({message: "Arrow added"});
        }
    }

    /**
     * Delete a connection between two devices
     * @param req The request
     * @param res The response
     */
    function deleteSuccessor(req, res) {
        const device = devices[req.params.predecessor];
        if (device) {
            deleteArrayEntry(device.successors, +req.params.successor);
        }
        res.status(200).json({message: "Arrow deleted"});
    }

    function deleteArrayEntry(array, entry) {
        const index = array.indexOf(entry);
        if (index >= 0) {
            array.splice(index, 1);
        }
    }

    /**
     * Verifies the JWT token which was 
     * sent in the http request header
     */
    function verifyJWT(token){
       
        console.log("jwt: "+token);

        if(token != 'null') //afte login; there is no token set by now, or new token needs to be requested
        {    
            let decodedToken = jwt.verify(token,'secret');
        }

    }

    /**
     * Authenticate the user specified in the request
     * @param req The request
     * @param res The response
     */
    function authenticate(req, res) {
    
        let authorizationHeader = req.get('Authorization'); //bearer --token--
        let token = authorizationHeader.split(" ")[1];
        verifyJWT(token);

        const username = req.body.username, password = req.body.password;
        let jwt;
        if (!user) {
            res.status(500).json({message: "User data not loaded"});
        } else if (!username || !password) {
            res.status(400).json({message: "Bad request"});
        } else if (username !== user.username || password !== user.password) {
            res.status(401).json({message: "Bad credentials", errors: {credentials: true}});
        } else {
            jwt = createJWT(username);
            console.log('Json Web Token: '+jwt);
            res.status(200).json({message: "Successfully logged in", token: jwt});
        }
    }

    function createJWT(username){
        return jwt.sign({data: username}, 'secret', { expiresIn: 60*10 });
    }

    /**
     * Change the users password and store it to the login config file
     * @param req The request
     * @param res The response
     */
    function changePassword(req, res) {
        const oldPassword = req.body.oldPassword, newPassword = req.body.newPassword;

        if (!user) {
            res.status(500).json({message: "User data not loaded"});
        } else if (!oldPassword || !newPassword) {
            res.status(400).json({message: "Bad request"});
        } else if (oldPassword !== user.password) {
            res.status(400).json({message: "Old password wrong", errors: {oldPassword: true}});
        } else {
            const data = `username: ${user.username}\npassword: ${newPassword}`;
            fs.writeFile("./resources/login.config", data, {}, function(err) {
                if (err) {
                    console.log("Error writing user config: ", err);
                    res.status(500).json({message: "Password could not be stored"});
                } else {
                    user.password = newPassword;
                    res.status(200).json({message: "Password successfully updated"});
                }
            });
        }
    }

    /**
     * Send the updated value to all connected WebSocket clients
     * @param {number} index The index of the updated device
     * @param value The new value for the device
     */
    function sendUpdatedValue(index, value) {
        // TODO Send the data to connected WebSocket clients
    }

    /**
     * Read the user data from the login config file, parse it and store it in 'user'
     */
    function readUser() {
        fs.readFile("./resources/login.config", "utf8", function(err, data) {
            if (err) {
                console.log("Error reading user config: ", err);
            } else {
                const lines = data.split(/\r?\n/),
                    userLine = lines[0],
                    passwordLine = lines[1],
                    username = userLine.substr(userLine.indexOf(":") + 2),
                    password = passwordLine.substr(passwordLine.indexOf(":") + 2);
                user = {
                    username: username,
                    password: password
                };
            }
        });
    }

    /**
     * Read the available devices data from the json file and store it in 'available'
     */
    function readAvailable() {
        fs.readFile("./resources/devices.json", "utf8", function(err, data) {
            if (err) {
                console.log("Error reading available devices: ", err);
            } else {
                available = JSON.parse(data).devices;
            }
        });
    }

    const server = app.listen(8081, function() {
        readUser();
        readAvailable();
        simulation.simulateSmartProduction(devices, sendUpdatedValue);

        const host = server.address().address;
        const port = server.address().port;
        console.log("Big Smart Production Server listening at http://%s:%s", host, port);
    });
})();
