import React, { useState } from 'react';
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

  const [isActivated, setIsActivated] = useState(false); // To track the activation status

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

  const handleToggleChange = () => {
    setIsActivated(!isActivated);
  };

  async function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the default form submission

    try {
      const activationStatus = isActivated ? '1' : '0';
      const apn = document.getElementById('apnInput').value;
      const interval = document.getElementById('intervalSelect').value;
      const protocol = document.getElementById('protocolSelect').value;
      const url = document.getElementById('urlInput').value;
      const port = document.getElementById('portInput').value;
      const dataloggerType = document.getElementById('dataloggerTypeSelect').value;
      const antenna = document.getElementById('antennaSelect').value;
      const ntpserver = document.getElementById('ntpInput').value;

      // Combine the form values into a single string or binary format
      const combinedValue = `${activationStatus},${apn},${interval},${protocol},${url},${port},${dataloggerType},${antenna},${ntpserver}`;

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
      let decoder = new TextDecoder('utf-8');
      let result = decoder.decode(value);

      // Log or display the read value
      console.log('Read value:', result);
      createLogElement(result, 0, "P2Pserver READ");

      // Parse the result and populate the form
    const [
      activationStatus,
      apn,
      interval,
      protocol,
      url,
      port,
      dataloggerType,
      antenna,
      ntpserver,
    ] = result.split(',');

    // Set the form values
    //document.getElementById('activationToggle').checked = activationStatus === '1';
    //setIsActivated(activationStatus === '1'); // Update the activation state
    document.getElementById('apnInput').value = apn;
    document.getElementById('intervalSelect').value = interval;
    document.getElementById('protocolSelect').value = protocol;
    document.getElementById('urlInput').value = url;
    document.getElementById('portInput').value = port;
    document.getElementById('dataloggerTypeSelect').value = dataloggerType;
    document.getElementById('antennaSelect').value = antenna;
    document.getElementById('ntpInput').value = ntpserver;

    } catch (error) {
      console.log('Error: ' + error);
    }
  }

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

  return (
    <div className="container-fluid">
      <div className="container">
        <div className='row justify-content-center'>
          <div className='col-xs-12 col-sm-12 col-md-8 col-lg-6 m-2'>
            <form id="deviceConfigForm" onSubmit={handleFormSubmit}>

              <div className="mb-3 row align-items-center">
                <label htmlFor="activationToggle" className="col-sm-4 col-form-label text-start">Activation</label>
                <div className="col-sm-8">
                  <div className="form-check form-switch">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="activationToggle" 
                      checked={isActivated} 
                      onChange={handleToggleChange} 
                    />
                    <label className="form-check-label" htmlFor="activationToggle">
                      {isActivated ? 'Activate' : 'Deactivate'}
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-3 row align-items-center">
                <label htmlFor="apnInput" className="col-sm-4 col-form-label text-start">APN</label>
                <div className="col-sm-8">
                  <input type="text" className="form-control" id="apnInput" placeholder="Enter APN" required disabled={!isActivated} />
                </div>
              </div>

              <div className="mb-3 row align-items-center">
                <label htmlFor="intervalSelect" className="col-sm-4 col-form-label text-start">Interval</label>
                <div className="col-sm-8">
                  <select className="form-select" id="intervalSelect" required disabled={!isActivated}>
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
                  <select className="form-select" id="protocolSelect" required disabled={!isActivated}>
                    <option value="0">TCP</option>
                    <option value="1">UDP</option>
                    <option value="2">HTTP</option>
                    <option value="3">HTTPS</option>
                  </select>
                </div>
              </div>

              <div className="mb-3 row align-items-center">
                <label htmlFor="urlInput" className="col-sm-4 col-form-label text-start">URL</label>
                <div className="col-sm-8">
                  <input type="text" className="form-control" id="urlInput" placeholder="Enter URL" required disabled={!isActivated} />
                </div>
              </div>

              <div className="mb-3 row align-items-center">
                <label htmlFor="portInput" className="col-sm-4 col-form-label text-start">Port</label>
                <div className="col-sm-8">
                  <input type="number" className="form-control" id="portInput" placeholder="Enter Port" required disabled={!isActivated} />
                </div>
              </div>

              <div className="mb-3 row align-items-center">
                <label htmlFor="dataloggerTypeSelect" className="col-sm-4 col-form-label text-start">Datalogger Type</label>
                <div className="col-sm-8">
                  <select className="form-select" id="dataloggerTypeSelect" required disabled={!isActivated}>
                    <option value="0">NDC</option>
                    <option value="1">PULSE</option>
                  </select>
                </div>
              </div>

              <div className="mb-3 row align-items-center">
                <label htmlFor="antennaSelect" className="col-sm-4 col-form-label text-start">Antenna</label>
                <div className="col-sm-8">
                  <select className="form-select" id="antennaSelect" required disabled={!isActivated}>
                    <option value="0">Internal</option>
                    <option value="1">External</option>
                  </select>
                </div>
              </div>

              <div className="mb-3 row align-items-center">
                <label htmlFor="ntpInput" className="col-sm-4 col-form-label text-start">NTP Server</label>
                <div className="col-sm-8">
                  <input type="text" className="form-control" id="ntpInput" placeholder="Enter URL" required disabled={!isActivated} />
                </div>
              </div>

              <div className="row">
                <div className="col-sm-8 offset-sm-4 text-start">
                {/* <button type="button" className="btn btn-secondary me-2" onClick={onReadButtonClick}>Read</button> */}
                  <button type="submit" className="btn btn-primary">Write</button>
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