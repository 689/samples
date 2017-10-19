let chosenHeartRateService = null;

navigator.bluetooth.requestDevice({
  filters: [{
    services: ['0000ffe0-0000-1000-8000-00805f9b34fb'],
  }]
}).then(device => device.gatt.connect())
.then(server => server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb'))
.then(service => {
  chosenHeartRateService = service;
  return Promise.all([
    service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb')
      .then(handleHeartRateMeasurementCharacteristic),
  ]);
});



function handleHeartRateMeasurementCharacteristic(characteristic) {
  return characteristic.startNotifications()
  .then(char => {
    characteristic.addEventListener('characteristicvaluechanged',
                                    onHeartRateChanged);
  });
}

function onHeartRateChanged(event) {
  let characteristic = event.target;
  console.log(parseHeartRate(characteristic.value));
}
