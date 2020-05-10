# homebridge-elgato-key-light

A [Homebridge](https://homebridge.io) platform for the
[Elgato](https://elgato.com) 
[Key Light](https://www.elgato.com/en/gaming/key-light) and
[Key Light Air](https://www.elgato.com/en/gaming/key-light-air) that
allow you to toggle on/off and control the brightness and color via
HomeKit.

## Installation
1. Install Homebridge using: `npm install -g homebridge`
1. Install homebridge-elgato-key-light using: `npm install -g homebridge-elgato-key-light`
1. Update your configuration file. See example `config.json` snippet below.

## Configuration
Configuration sample (edit `~/.homebridge/config.json`):
```
"platforms": [
	{
		"platform": "ElgatoKeyLight"
	}
]
```
