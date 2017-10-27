var myCharacteristic;
    var d2=0;

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

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function userInfo() {

    var u = {
    "users": [
        { "name":"Tony", "userid":0, "height":160, "sex":1, "bod":"1948/12/01"  },
         { "name":"Y", "userid":1, "height":165, "sex":1, "bod":"1975/08/01"   },
         { "name":"Amy", "userid":2, "height":150, "sex":0, "bod":"1948/04/01"   }
    ]
    };

    let userId = document.querySelector('#userId').value;

    if (userId == 4) {

        let height = document.querySelector('#height').value;
        let age = document.querySelector('#age').value;
        let sex = document.querySelector('#sex').value;

    } else {

        var age = getAge(u.users[userId].bod);
        var height = u.users[userId].height;
        var sex = u.users[userId].sex;


    }

    return [0xc0,0x09,height,age,sex];

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

  try {
  var result = '';
  var v;

  for (var i = 0; i < value.byteLength; i++) {
    v = value.getUint8(i).toString(16);
    if (v.length === 1) result += '0';
    result += v;
  }

var characteristic = myCharacteristic;

  if (result == "f8") {

      var d = ( Date.now() / 1000) - 946656000;
      var b = new ArrayBuffer(4);
      var dv = new DataView(b);
      dv.setUint32(0, d);
      let array = new Uint8Array([0xfa,0xf8,dv.getUint8(3),dv.getUint8(2),dv.getUint8(1),dv.getUint8(0)]);
    //  let array = new Uint8Array([0xfa,0xf8,0xae,0x15,0x26,0x21]);
      return characteristic.writeValue(array).then(() => {
            log('< faf8ae152621');});
  } else if (result == "fbf8") {
      let array = new Uint8Array([0xa1,0x5a]);
      return characteristic.writeValue(array).then(() => {
            log('< a15a');});
  } else if (result.substring(0,2) == "d2" && !d2) {
      d2++;
      //let array = new Unit8Array(userInfo());
      let array = new Uint8Array([0xc0,0x09,0x82,0x29,0x01]);
      return characteristic.writeValue(array).then(() => {
            log('< c009822901');});
  } else if (result.substring(0,6) == "d00201") {
      var d         = new Date((value.getUint32(4,1) + 946656000)*1000);
      var weight    = value.getUint16(8) / 10.0;
      var fat       = value.getUint16(10) / 10.0;
      var water     = value.getUint16(12) / 10.0;
      log("checkdate:"+d.toString());
      log("checkdate:"+d.toISOString());
      log("checkdate:"+d.valueOf());
      log("weight:"+weight);
      log("fat:"+fat);
      log("water:"+water);
      let array = new Uint8Array([0xfa,0xd0,0x02,0x01]);
      return characteristic.writeValue(array).then(() => {
            log('< fad00201');});
  } else if (result.substring(0,6) == "d00202") {
      var muscle    = value.getUint16(4) / 10.0;
      var bone      = value.getUint16(6) / 10.0;
      var metabolism= value.getUint16(8);
      var skinfat   = value.getUint16(10) / 10.0;
      var offalfat  = value.getUint8(12) / 10.0;
      var bodyage   = value.getUint8(13) / 10.0;
      log("muscle:"+muscle);
      log("bone:"+bone);
      log("metabolism:"+metabolism);
      log("skinfat:"+skinfat);
      log("offalfat:"+offalfat);
      log("bodyage:"+bodyage);
            let array = new Uint8Array([0xfa,0xd0,0x02,0x02]);
            return characteristic.writeValue(array).then(() => {
                  log('< fad00202');});
   }
  } catch (error) {
      log('Argh! ' + error);
    }

}
