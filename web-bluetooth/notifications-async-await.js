var myCharacteristic;

async function onStartButtonClick() {
  let serviceUuid = document.querySelector('#service').value;
  if (serviceUuid.startsWith('0x')) {
    serviceUuid = parseInt(serviceUuid);
  }

  let characteristicUuid = document.querySelector('#characteristic').value;
  if (characteristicUuid.startsWith('0x')) {
    characteristicUuid = parseInt(characteristicUuid);
  }

  serviceUuid = '0000ffe0-0000-1000-8000-00805f9b34fb';
  characteristicUuid = '0000ffe1-0000-1000-8000-00805f9b34fb';
  
  
  try {
    log('Requesting Bluetooth Device...');
    const device = await navigator.bluetooth.requestDevice({
        filters: [{services: [serviceUuid]}]});

    log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    log('Getting Service...');
    const service = await server.getPrimaryService(serviceUuid);

    log('Getting Characteristic...');
    myCharacteristic = await service.getCharacteristic(characteristicUuid);

    await myCharacteristic.startNotifications();

    log('> Notifications started');
    myCharacteristic.addEventListener('characteristicvaluechanged',
        handleNotifications);
  } catch(error) {
    log('Argh! ' + error);
  }
}

async function onStopButtonClick() {
  if (myCharacteristic) {
    try {
      await myCharacteristic.stopNotifications();
      log('> Notifications stopped');
      myCharacteristic.removeEventListener('characteristicvaluechanged',
          handleNotifications);
    } catch(error) {
      log('Argh! ' + error);
    }
  }
}

function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  // Convert raw data bytes to hex values just for the sake of showing something.
  // In the "real" world, you'd use data.getUint8, data.getUint16 or even
  // TextDecoder to process raw data bytes.
  for (let i = 0; i < value.byteLength; i++) {
    a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
  }
  log('> ' + a.join(' '));
  
  
   var result = '';
  var v;

  for (var i = 0; i < value.byteLength; i++) {
    v = value.getUint8(i).toString(16);
    if (v.length === 1) result += '0';
    result += v;
  }

var characteristic = myCharacteristic;

  if (result == "f8") {
      let array = new Uint8Array([0xfa,0xf8,0xae,0x15,0x26,0x21]);
      return characteristic.writeValue(array).then(() => {
            log('< faf8ae152621');});
  } else if (result == "fbf8") {
      let array = new Uint8Array([0xa1,0x5a]);
      return characteristic.writeValue(array).then(() => {
            log('< a15a');});
  } else if (result.substring(0,2) == "d2") {
      let array = new Uint8Array([0xc0,0x09,0x82,0x29,0x01]);
      return characteristic.writeValue(array).then(() => {
            log('< c009822901');});
  } else if (result.substring(0,6) == "d00201") {
      let array = new Uint8Array([0xfa,0xd0,0x02,0x01]);
      return characteristic.writeValue(array).then(() => {
            log('< fad00201');});
  } else if (result.substring(0,6) == "d00202") {
            let array = new Uint8Array([0xfa,0xd0,0x02,0x02]);
            return characteristic.writeValue(array).then(() => {
                  log('< fad00202');});
   }          
}
