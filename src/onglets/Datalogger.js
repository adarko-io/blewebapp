// ******************************************************************************
// * @file    P2Pserver.js
// * @author  MCD Application Team
// *
//  ******************************************************************************
//  * @attention
//  *
//  * Copyright (c) 2022-2023 STMicroelectronics.
//  * All rights reserved.
//  *
//  * This software is licensed under terms that can be found in the LICENSE file
//  * in the root directory of this software component.
//  * If no LICENSE file comes with this software, it is provided AS-IS.
//  *
//  ******************************************************************************
import React, { useEffect, useState } from 'react';
import imagelightOffBlue from '../images/lightOffBlue.svg';
import imagelightOnBlue from '../images/lightOnBlue.svg';
import imagelightOffPink from '../images/lightOffPink.svg';
import imagelightOnPink from '../images/lightOnPink.svg';
import iconInfo from '../images/iconInfo.svg';
import { createLogElement } from "../components/Header";
import { OverlayTrigger, Popover } from 'react-bootstrap';

const Datalogger = (props) => {
  let notifyCharacteristic;
  let ReadWriteCharacteristic;
  let rebootCharacteristic;

  // Filtering the different datathroughput characteristics
  props.allCharacteristics.map(element => {
    switch (element.characteristic.uuid) {
      case "0000fe42-8e22-4541-9d4c-21edae82ed19":
        notifyCharacteristic = element;
        notifyCharacteristic.characteristic.stopNotifications();
        break;
      case "0000ce11-8e22-4541-9d4c-21edae82ed19":
        ReadWriteCharacteristic = element;
        onReadButtonClick();
        break;
      case "0000fe11-8e22-4541-9d4c-21edae82ed19":
        rebootCharacteristic = element;
        break;
      default:
        console.log("# No characteristics found..");
    }
  });

  document.getElementById("readmeInfo").style.display = "none";

  // Write button handler
  async function onWriteButtonClick() {
    // let myInput = document.getElementById('writeInput').value;
    // let myWord = new Uint8Array(2);
    // myWord[0] = myInput.slice(0, 2);
    // myWord[1] = myInput.slice(2, 4);
    // try {
    //   await ReadWriteCharacteristic.characteristic.writeValue(myWord);
    //   createLogElement(myWord, 1, "P2Pserver WRITE");
    // }
    // catch (error) {
    //   console.log('2 : Argh! ' + error);
    // }
    let myInput = document.getElementById('writeInput').value;

    // Create a Uint8Array with an additional byte for the null terminator
    let myWord = new Uint8Array(myInput.length + 1);

    // Populate the array with the character codes
    for (let i = 0; i < myInput.length; i++) {
      myWord[i] = myInput.charCodeAt(i);
    }

    // Add the null terminator at the end
    myWord[myInput.length] = 0;

    try {
      await ReadWriteCharacteristic.characteristic.writeValue(myWord);
      createLogElement(myWord, 1, "P2Pserver WRITE");
    } catch (error) {
      console.log('Error: ' + error);
    }
  }
  // Read button handler
  // async function onReadButtonClick() {
  //   var value = await ReadWriteCharacteristic.characteristic.readValue();
  //   let statusWord = new Uint8Array(value.buffer);
  //   console.log(statusWord);
  //   document.getElementById('readLabel').innerHTML = "0x" + statusWord.toString();
  //   createLogElement(statusWord, 1, "P2Pserver READ");
  // }

  // Enable Light image handler
  async function onEnableLightClick() {
    let imgStatus = document.getElementById('imageLightPink').getAttribute('src')
    let myWord;
    try {
      if (imgStatus === imagelightOffBlue) {
        myWord = new Uint8Array(2);
        myWord[0] = parseInt('01', 8);
        myWord[1] = parseInt('01', 8);
        await ReadWriteCharacteristic.characteristic.writeValue(myWord);
        createLogElement(myWord, 1, "P2Pserver WRITE");
        document.getElementById('enableLightButton').innerHTML = "Light ON";
        document.getElementById('imageLightPink').src = imagelightOnBlue;
      } else {
        myWord = new Uint8Array(2);
        myWord[0] = parseInt('01', 8);
        myWord[1] = parseInt('00', 8);
        await ReadWriteCharacteristic.characteristic.writeValue(myWord);
        createLogElement(myWord, 1, "P2Pserver WRITE");
        document.getElementById('enableLightButton').innerHTML = "Light OFF";
        document.getElementById('imageLightPink').src = imagelightOffBlue;
      }
    }
    catch (error) {
      console.log('2 : Argh! ' + error);
    }
  }

  async function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    try {
      const apn = document.getElementById('apnInput').value;
      const interval = document.getElementById('intervalSelect').value;
      const protocol = document.getElementById('protocolSelect').value;
      const url = document.getElementById('urlInput').value;
      const port = document.getElementById('portInput').value;
      const dataloggerType = document.getElementById('dataloggerTypeSelect').value;
      const antenna = document.getElementById('antennaSelect').value;

      // Combine the form values into a single string or binary format
      const combinedValue = `${apn},${interval},${protocol},${url},${port},${dataloggerType},${antenna}`;

      // Convert the combined string to a Uint8Array
      let encoder = new TextEncoder();
      let valueToWrite = encoder.encode(combinedValue);

      // Write the value to the characteristic
      await ReadWriteCharacteristic.characteristic.writeValue(valueToWrite);

      console.log('Configuration written successfully:', combinedValue);
    } catch (error) {
      console.log('Error writing configuration:', error);
    }
    //onReadButtonClick()
  }

  async function onReadButtonClick() {
    try {
      // Read the value from the characteristic
      var value = await ReadWriteCharacteristic.characteristic.readValue();
      //var value = await ReadCharacteristic.characteristic.readValue();

      // Convert the DataView to a string or process it as needed
      let decoder = new TextDecoder('utf-8');
      let result = decoder.decode(value);

      // Log or display the read value
      console.log('Read value:', value);
      createLogElement(result, 0, "P2Pserver READ");
    } catch (error) {
      console.log('Error: ' + error);
    }
  }

  // Notify button click handler
  async function onNotifyButtonClick() {
    let notifStatus = document.getElementById('notifyButton').innerHTML;
    if (notifStatus === "Notify OFF") {
      console.log('Notification ON');
      notifyCharacteristic.characteristic.startNotifications();
      notifyCharacteristic.characteristic.oncharacteristicvaluechanged = notifHandler;
      document.getElementById('notifyButton').innerHTML = "Notify ON"
      createLogElement(notifyCharacteristic, 3, "P2Pserver ENABLE NOTIFICATION ");
    } else {
      notifyCharacteristic.characteristic.stopNotifications();
      console.log('Notification OFF');
      document.getElementById('notifyButton').innerHTML = "Notify OFF"
      createLogElement(notifyCharacteristic, 3, "P2Pserver DISABLE NOTIFICATION ");
    }
  }

  // notification handler
  function notifHandler(event) {
    console.log("Notification received");
    var buf = new Uint8Array(event.target.value.buffer);
    console.log(buf);
    createLogElement(buf, 1, "P2Pserver NOTIFICATION RECEIVED");
    if (buf[1].toString() === "1") {
      document.getElementById('imageLightBlue').src = imagelightOnPink;
    } else {
      document.getElementById('imageLightBlue').src = imagelightOffPink;
    }
  }

  // Tooltips

  const popoverNotifyButton = (
    <Popover id="popover-trigger-hover-focus" title="Popover bottom">
      <strong>Info :</strong> Enable the reception of notifications from the connected device. <br />
      Example : <br />
      Enable the notifications then push SW1.
    </Popover>
  );

  const popoverEnableLightButton = (
    <Popover id="popover-trigger-hover-focus" title="Popover bottom">
      <strong>Info :</strong> Turn on/off the led on the device. <br />
      <strong>Tip :</strong> You can also click on the pink led
    </Popover>
  );

  const popoverWriteButton = (
    <Popover id="popover-trigger-hover-focus" title="Popover bottom">
      <strong>Info :</strong> Send a value to the connected device. <br />
      Example : <br />
      0x 0101 to turn ON the led<br />
      0x 0100 to turn OFF the led
    </Popover>
  );

  const popoverReadButton = (
    <Popover id="popover-trigger-hover-focus" title="Popover bottom">
      <strong>Info :</strong> Read value written on the connected device. <br />
      Example : <br />
      0x 1,1 : led is on<br />
      0x 1,0 : led is off
    </Popover>
  );

  // useEffect(() => {
  //   onReadButtonClick();
  // });

  return (
    <div className="container-fluid">
      <div className="container">
      <div className='row justify-content-center'>
  <div className='col-xs-12 col-sm-12 col-md-8 col-lg-6 m-2'>
    <form id="deviceConfigForm" onSubmit={handleFormSubmit}>

      <div className="mb-3 row align-items-center">
        <label htmlFor="apnInput" className="col-sm-4 col-form-label text-start">APN</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" id="apnInput" placeholder="Enter APN" required />
        </div>
      </div>

      <div className="mb-3 row align-items-center">
        <label htmlFor="intervalSelect" className="col-sm-4 col-form-label text-start">Interval</label>
        <div className="col-sm-8">
          <select className="form-select" id="intervalSelect" required>
            <option value="6">6 Hours</option>
            <option value="12">12 Hours</option>
            <option value="24">24 Hours</option>
            <option value="48">48 Hours</option>
            <option value="168">1 Week</option>
            <option value="720">1 Month</option>
          </select>
        </div>
      </div>

      <div className="mb-3 row align-items-center">
        <label htmlFor="protocolSelect" className="col-sm-4 col-form-label text-start">Protocol</label>
        <div className="col-sm-8">
          <select className="form-select" id="protocolSelect" required>
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="HTTP">HTTP</option>
            <option value="HTTPS">HTTPS</option>
          </select>
        </div>
      </div>

      <div className="mb-3 row align-items-center">
        <label htmlFor="urlInput" className="col-sm-4 col-form-label text-start">URL</label>
        <div className="col-sm-8">
          <input type="text" className="form-control" id="urlInput" placeholder="Enter URL" required />
        </div>
      </div>

      <div className="mb-3 row align-items-center">
        <label htmlFor="portInput" className="col-sm-4 col-form-label text-start">Port</label>
        <div className="col-sm-8">
          <input type="number" className="form-control" id="portInput" placeholder="Enter Port" required />
        </div>
      </div>

      <div className="mb-3 row align-items-center">
        <label htmlFor="dataloggerTypeSelect" className="col-sm-4 col-form-label text-start">Datalogger Type</label>
        <div className="col-sm-8">
          <select className="form-select" id="dataloggerTypeSelect" required>
            <option value="0">NDC</option>
            <option value="1">PULSE</option>
          </select>
        </div>
      </div>

      <div className="mb-3 row align-items-center">
        <label htmlFor="antennaSelect" className="col-sm-4 col-form-label text-start">Antenna</label>
        <div className="col-sm-8">
          <select className="form-select" id="antennaSelect" required>
            <option value="0">Internal</option>
            <option value="1">External</option>
          </select>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-8 offset-sm-4 text-start">
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </div>
      
    </form>
  </div>
</div>
        
      </div>
    </div>

  );
};

export default Datalogger;