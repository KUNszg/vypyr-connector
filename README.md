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
const Midi = require("vypyr-connector").Input;

const vypyr = new Midi();

// suitable port gets detected automatically
// if needed, provide a MIDI port in argument of the below method
// this is usually in range of 0 to 3
vypyr.connect();

vypyr.on('input', (timing, program, ctrlr, value) => {
    console.log(`\nprogram: ${program},\nctrlr: ${ctrlr},\nvalue: ${value}\ntiming: ${timing}`);
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
console.log(new Midi().send(176, 10, 0))
// to select the port manually use new Midi(YOUR_PORT).send(176, 10, 0)

// response:
// {
//   status: 200,
//   message: 'Message successfully sent to VYPYR USB Interface 1 on port id 1'
// }
```
## Web API

coming soon