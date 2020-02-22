"use strict";

const PLUGIN_NAME = "homebridge-elgato-key-light";
const PLATFORM_NAME = "ElgatoKeyLight";

const elgato = require("elgato-light-api");

var HAP, Service, Accessory;

module.exports = function(homebridge) {
  HAP = homebridge.hap;
  Service = homebridge.hap.Service;
  Accessory = homebridge.platformAccessory;

  homebridge.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, ElgatoKeyLight, true);
}

function ElgatoKeyLight(log, config, platform) {
  this.log = log;
  this.config = config;
  this.platform = platform;
  this.accessories = {};
        
  if (!this.platform) {
    return;
  }

  this.lightAPI = new elgato.ElgatoLightAPI();
  this.platform.on('didFinishLaunching', () => {
    this.lightAPI.on('newLight', (light) => this.registerAccessory(light, config));
  });
}

ElgatoKeyLight.prototype.configureAccessory = function(accessory) {
  this.accessories[accessory.UUID] = accessory;
}

ElgatoKeyLight.prototype.registerAccessory = function(light, config) {
  let uuid = HAP.uuid.generate(light.info.serialNumber);
  let accessory = this.accessories[uuid];
  if (!accessory) {
    accessory = new Accessory(light.name, uuid);
    this.accessories[uuid] = accessory;

    this.platform.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
  }

  this.registerServices(light, accessory, config);
  this.log(`Found ${light.name}`);
}

ElgatoKeyLight.prototype.registerServices = function(light, accessory, config) {
  accessory.getService(Service.AccessoryInformation)
    .setCharacteristic(HAP.Characteristic.Manufacturer, "Elgato")
    .setCharacteristic(HAP.Characteristic.Model, light.info.productName)
    .setCharacteristic(HAP.Characteristic.SerialNumber, light.info.serialNumber);

  let service = accessory.getService(Service.Lightbulb);
  if (!service) {
    accessory.addService(Service.LightBulb, light.name);
  }

  var status = light.options.lights[0];
  service.setCharacteristic(HAP.Characteristic.On, status.on);
  service.getCharacteristic(HAP.Characteristic.On)
         .on('set', (on, callback) => {
    this.log("Setting Characteristic.On to " + on);
    this.lightAPI.updateLightOptions(light, {
      numberOfLights: 1, lights: [ { on: on } ]
    });
    callback(null, on);
  });

  service.setCharacteristic(HAP.Characteristic.Brightness, status.brightness);
  service.getCharacteristic(HAP.Characteristic.Brightness)
         .on('set', (brightness, callback) => {
    this.log("Setting Characteristic.Brightness to " + brightness);
    this.lightAPI.updateLightOptions(light, {
      numberOfLights: 1, lights: [ { brightness: brightness } ]
    });
    callback(null, brightness);
  });

  service.setCharacteristic(HAP.Characteristic.ColorTemperature, status.temperature);
  service.getCharacteristic(HAP.Characteristic.ColorTemperature)
         .on('set', (temperature, callback) => {
    this.log("Setting Characteristic.ColorTemperature to " + temperature);
    this.lightAPI.updateLightOptions(light, {
      numberOfLights: 1, lights: [ { temperature: temperature } ]
    });
    callback(null, temperature);
  });
}

