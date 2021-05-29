# VYPYR connector
With this module you can simply connect to your guitar amplifier (currently supports only Peavey VYPYR VIP series) and modify the current state of it using HTTP requests over remote server or integrating it with your application.
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
means that on the amp we are selecting program `176` with ctrlr `10` and value that stands for the effect that we want to select which is `0`. This would change the inst/stomp effect on the amp to rmod.

For full list of Peavey MIDI status codes see https://github.com/KUNszg/vypyr-connector/blob/main/controls.json

## Capturing input
```javascript
const Midi = require("vypyr-connector");
console.log(new Midi().debug);
// to select the port manually use new Midi(YOUR_PORT).debug

// Example of action detected in amp interface
// #1
// program: 176,
// ctrlr: 16,
// value: 127
// delta time: 0
//
// #2
// program: 176,
// ctrlr: 16,
// value: 121
// delta time: 0.9
// ...
```
## Output (sending commands to amp)
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