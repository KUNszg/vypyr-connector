[![npm version](https://badge.fury.io/js/vypyr-connector.svg)](https://badge.fury.io/js/vypyr-connector)

# VYPYR connector
With this module you can receive messages via events from your guitar amplifier (currently supports only Peavey VYPYR VIP series) and modify the current state of the amp by using built in classes.
## Installation
Installation uses node-gyp and requires Python 3.7 or higher.
```
npm i vypyr-connector
 ```
or
```sh
$ git clone https://github.com/KUNszg/vypyr-connector.git
$ cd vypyr-connector
$ npm i
```

## Usage
This library deals with MIDI messages as JS Arrays for both input and output.
Each element of array represents a state of current interface setup.
For example:
```javascript
[176, 10, 0]
// [program, ctrlr, value]
```

For full list of Peavey MIDI status codes see:
https://github.com/KUNszg/vypyr-connector/blob/main/controls.json

## Capturing input
```javascript
const Midi = require("vypyr-connector");

const vypyr = new Midi();

// suitable port gets detected automatically
// if needed, provide a MIDI port in argument of the below method
// this is usually in range of 0 to 3
vypyr.connect();

vypyr.on('input', (timing, program, ctrlr, value) => {
    console.log(`
        program: ${program},
        ctrlr: ${ctrlr},
        value: ${value}
        timing: ${timing}`);
});

// Example response:
//
// program: 176,
// ctrlr: 16,
// value: 116
// timing: 0.05000
//
// program: 176,
// ctrlr: 16,
// value: 121
// timing: 0.15000
// ...
```
## Sending output
```javascript
const Midi = require("vypyr-connector");

// to select the port manually:
// const vypyr = new Midi(<your_port>);
const vypyr = new Midi();

console.log(vypyr.send(176, 10, 0))

// {
//   status: 200,
//   message: 'Message successfully sent to VYPYR USB Interface 1 on port id 1'
// }
```
## Web API

````javascript
const Midi = require("vypyr-connector");

const vypyr = new Midi()

// port 8080 is selected automatically
// if you wish to select another port:
// vypyr.express(<your_port>)
vypyr.express();
// => Server is running on port: 8080

```

```sh
// send the request
curl -X POST -H "program: 176" -H "ctrlr: 10" -H "value: 0" "http://localhost:8080/controller"

// => Message successfully sent to VYPYR USB Interface 1 on port id 1
```