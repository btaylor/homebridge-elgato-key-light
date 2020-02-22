"use strict";

const elgato = require("elgato-light-api");

var Service, Characteristic, HomebridgeAPI;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-elgato-key-light", "ElgatoKeyLight", ElgatoKeyLight);
}

function ElgatoKeyLight(log, config) {
  this.log = log;
  this.disabled = config.disabled || false;

  if (this.disabled) {
    return;
  }

  this.lightAPI = new elgato.ElgatoLightAPI();
  this.lightAPI.on('newLight', function (newLight) {
    log(newLight.name + " detected");
  });
}

ElgatoKeyLight.prototype.getServices = function() {
  if (this.disabled) {
    return [];
  }

  var services = [];
  for (var i in this.lightAPI.keyLights) {
    var light = this.lightAPI.keyLights[i];

    // NOTE: I've never seen more than 1 sub-light in the wild
    var status = light.options.lights[0];

    var service = new Service.Lightbulb(name);
    service.getCharacteristic(Characteristic.On)
           .on('set', function (on, callback) {
      this.lightAPI.updateLightOptions(light, {
        numberOfLights: 1, lights: [ { on: on } ]
      });

      callback();
    });

    service.setCharacteristic(Characteristic.On, status.on);
    service.setCharacteristic(Characteristic.Brightness, status.brightness);
    service.setCharacteristic(Characteristic.ColorTemperature, status.temperature);
    services.push(service);
  }

  return services;
}
