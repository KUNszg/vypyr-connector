const data = require('./controls.json');
const midi = require('midi');

class Output {
    constructor (port) {
        // make sure provided port is a Number type
        if (!isNaN(Number(port))) {
            this.port = Number(port);
        }
    }

    send(program, ctrlr, value) {
        // Set up a new output.
        const output = new midi.Output();

        if (!output.getPortCount()) {
            return {
                "status": 404,
                "message": "no MIDI output devices were found."
            }
        }


        // if no port was specified, automatically detect the port from port pool
        if (!this.port && this.port != 0) {
            this.port = -1;

            for (let i = 0; i<output.getPortCount(); i++) {
                if (output.getPortName(i).startsWith("VYPYR")) {
                    this.port = i;
                    break;
                }
            }

            if (this.port === -1) {
                return {
                    "status": 404,
                    "message": "No VYPYR output ports were recognized on your device."
                }
            }
        }

        console.log(this.port, output.getPortCount())

        if (this.port >= output.getPortCount()) {
            return {
                "status": 400,
                "message": "Specified port does not exist"
            }
        }

        // check if selected port name is not from VYPYR
        if (output.getPortName(this.port).startsWith("VYPYR")) {
            // open the first available output port or the one specified in query url
            output.openPort(this.port);

            const response = () => {
                const programChange = [program, ctrlr, value];

                if (isNaN(program) || isNaN(ctrlr) || isNaN(value)) {
                    return {
                        "status": 400,
                        "message": "Provided program or value has to be a number."
                    }
                }

                const options = Object.assign([], ...Object.values(data));

                // check if provided values in query match the known controller values
                if (!Object.values(options).map(i => i[0]).filter(i => i === program).length) {
                    return {
                        "status": 400,
                        "message": 'Provided value for "program" parameter is invalid'
                    }
                }

                if (!Object.values(options).map(i => i[1]).filter(i => i === ctrlr).length) {
                    return {
                        "status": 400,
                        "message": 'Provided value for "ctrlr" parameter is invalid'
                    }
                }

                // check instrument value ranges for ctrlr
                if (program === 192) {
                    if (value != 112) {
                        return {
                            "status": 400,
                            "message": 'Provided value for "value" parameter is invalid (accepts only 112)'
                        }
                    }
                    if (ctrlr >= 0 && ctrlr <= 15) {
                        output.sendMessage(programChange);
                    }
                    else {
                        return {
                            "status": 400,
                            "message": 'Provided value for "ctrlr" parameter is out of range (accepts 0 to 15)'
                        }
                    }
                }

                // check tuner and tapTempo value ranges
                if ((program === 144 && ctrlr === 21) || (program === 176 && ctrlr === 56)) {
                    if (value === 127 || value === 0) {
                        output.sendMessage(programChange);
                    }
                    else {
                        return {
                            "status": 400,
                            "message": 'Provided value for "value" parameter is out of range (accepts either 0 or 127)'
                        }
                    }
                }

                if (program === 176) {
                    // check inst value ranges
                    if (ctrlr === 10) {
                        if (value >= 0 && value <= 22) {
                            output.sendMessage(programChange);
                        }
                        else {
                            return {
                                "status": 400,
                                "message": 'Provided value for "value" parameter is out of range (accepts 0 to 22)'
                            }
                        }
                    }

                    // check stomp value ranges
                    if (ctrlr === 21 || ctrlr === 23 || ctrlr === 31) {
                        if (value >= 0 && value <= 127) {
                            output.sendMessage(programChange);
                        }
                        else {
                            return {
                                "status": 400,
                                "message": 'Provided value for "value" parameter is out of range (accepts 0 to 127)'
                            }
                        }
                    }

                    // check amps value ranges
                    if (ctrlr === 8) {
                        if (value >= 1 && value <= 12) {
                            output.sendMessage(programChange);
                        }
                        else {
                            return {
                                "status": 400,
                                "message": 'Provided value for "value" parameter is out of range (accepts 1 to 12)'
                            }
                        }
                    }

                    // check ampsChannels value ranges
                    if (ctrlr === 12) {
                        if (value >= 0 && value <= 2) {
                            output.sendMessage(programChange);
                        }
                        else {
                            return {
                                "status": 400,
                                "message": 'Provided value for "value" parameter is out of range (accepts 0 to 2)'
                            }
                        }

                    }

                    // check value ranges of modifiers
                    if (ctrlr >= 16 && ctrlr <= 20) {
                        if (value >= 0 && value <= 127) {
                            output.sendMessage(programChange);
                        }
                        else {
                            return {
                                "status": 400,
                                "message": 'Provided value for "value" parameter is out of range (accepts 0 to 127)'
                            }
                        }
                    }
                }
                else {
                    return {
                        "status": 400,
                        "message": 'Specified program does not exist.'
                    }
                }

                return {
                    "status": 200,
                    "message": `Message successfully sent to ${output.getPortName(this.port)} on port id ${this.port}`
                }
            }

            const resp = response();

            // Close the port when done.
            output.closePort();

            return resp;
        }
        else {
            output.closePort();
            return { "status": 404, "message": "Specified port could not be recognized as VYPYR port" }
        }
    }
}

/* real time logging of changes in amp interface */
class Input extends Output {
    constructor(port) {
        super(port)
    }

    get debug() {
        const input = new midi.Input();

        if (!input.getPortCount()) {
            return "no MIDI input devices were found";
        }

        // if no port was specified, automatically detect the port from port pool
        if (!this.port) {
            this.port = -1;

            for (let i = 0; i<input.getPortCount(); i++) {
                if (input.getPortName(i).startsWith("VYPYR")) {
                    this.port = i;
                    break;
                }
            }

            if (this.port === -1) {
                return "No VYPYR input ports were recognized on your device."
            }
        }

        if (!input.getPortName(this.port).startsWith("VYPYR")) {
            return "Selected port is not a supported VYPYR port, try another one.";
        }

        // Configure a callback.
        input.on('message', (deltaTime, message) => {
            // The message is an array of numbers corresponding to the MIDI bytes:
            //   [status, data1, data2]
            // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
            // information interpreting the messages.
            const msg = message.split(" ");

            console.log(`##################\nprogram: ${msg[0]},\nctrlr: ${msg[1]},\nvalue: ${msg[2]}\ndelta time: ${deltaTime}`);
        });

        // open the connection
        input.openPort(this.port);

        return `Successfully connected to ${input.getPortName(this.port)}`;
    }
}

class Server extends Input {
    get startApi() {
        const app = require('express')();

        /* For controllers that deal with two-state parameters such as an on/off control,
         * the data value of 0x00 means OFF and the value of 0x7F means ON. For controllers
         * in which the data value range is not specified, the range can be assumed
         * to be 0x00 (minimum setting) to 0x7F (maximum setting).
         */
        app.get("/controller", (req, res) => {
            res.status(405);
            res.send("Please use a POST method.");
        });

        app.post("/controller", (req, res) => {
            let program, ctrlr, value, port;

            port = req.query?.port ?? req.header("port");

            if (!("program" in req.headers || "ctrlr" in req.headers || "value" in req.headers)) {
                if (!("program" in req.query || "ctrlr" in req.query || "value" in req.query)) {
                    res.status(400);
                    res.send("Bad Request")
                    console.log("No query parameters/headers provided, or " +
                        "the requests lacks one of the required ones. Check the documentation for help.");
                    return;
                }
                [program, ctrlr, value] = [Number(req.query.program), Number(req.query.ctrlr), Number(req.query.value)];
            }
            else {
                [program, ctrlr, value] = [Number(req.header("program")), Number(req.header("ctrlr")), Number(req.header("value"))];
            }

            const resp = new Output(port).send(program, ctrlr, value);

            res.status(resp.status);
            res.send(resp.message);
            console.log(resp.message);
        });
        const server = app.listen(process.env.PORT || 8080, '0.0.0.0', () => {
            console.log('Server is running on port:', server.address().port);
        });

        return "";
    }
}

module.exports = Server;