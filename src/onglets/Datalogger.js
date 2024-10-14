import React, { useEffect, useState } from 'react';
import { createLogElement } from "../components/Header";

const Datalogger = (props) => {
  let notifyCharacteristic;
  let ReadWriteCharacteristic;
  let ReadCharacteristic;
  let ReadWriteCharacteristicLoggerData;
  let ReadCharacteristicLoggerLog;


  const [isActivated, setIsActivated] = useState(false); // To track the activation status

  const [dataloggerType, setDataloggerType] = useState('');
  const [accumulatedFlow, setAccumulatedFlow] = useState('');
  const [forwardFlow, setForwardFlow] = useState('');
  const [reverseFlow, setReverseFlow] = useState('');
  const [prescaler, setPrescaler] = useState('1');
  const [deviceInfo, setDeviceInfo] = useState({
    EUI: '',
    firmwareVersion: '',
    timestamp: '',
    Rssi: '',
    SNR: '',
    BatteryV: '',
    BankV: ''
  });

  const [logEntries, setLogEntries] = useState([]);

  const [lteLogOutput, setLteLogOutput] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 24;
  // Derived state for pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = logEntries.slice(indexOfFirstEntry, indexOfLastEntry);

  // Change page
  const paginate = pageNumber => setCurrentPage(pageNumber);

  // Calculate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(logEntries.length / entriesPerPage); i++) {
    pageNumbers.push(i);
  }



  const handleDataloggerTypeChange = (event) => {
    setDataloggerType(event.target.value);
  };

  props.allCharacteristics.map(element => {
    switch (element.characteristic.uuid) {
      case "0000ce11-8e22-4541-9d4c-21edae82ed19":
        ReadWriteCharacteristic = element;
        //onReadButtonClick();
        break;
      case "0000ce12-8e22-4541-9d4c-21edae82ed19":
        ReadCharacteristic = element;
        // ReadInfo();
        break;
      case "0000ce14-8e22-4541-9d4c-21edae82ed19":
        ReadWriteCharacteristicLoggerData = element;
        break;
      case "0000ce15-8e22-4541-9d4c-21edae82ed19":
        ReadCharacteristicLoggerLog = element;
        break;
      default:
        console.log("# No characteristics found..");
    }
  });

  document.getElementById("readmeInfo").style.display = "none";

  const handleToggleChange = () => {
    setIsActivated(!isActivated);
  };

  const limitDecimals = value => {
    const regex = /^\d*\.?\d{0,3}$/;
    return regex.test(value) ? value : parseFloat(value).toFixed(3);
  };

  const handleForwardFlowChange = e => {
    const newForwardFlow = limitDecimals(e.target.value);
    setForwardFlow(newForwardFlow);
    setAccumulatedFlow(Number(newForwardFlow) - Number(reverseFlow));
  };

  const handleReverseFlowChange = e => {
    const newReverseFlow = limitDecimals(e.target.value);
    setReverseFlow(newReverseFlow);
    setAccumulatedFlow(Number(forwardFlow) - Number(newReverseFlow));
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
      var prescaler = 1;
      var fwdflow = 0;
      var revflow = 0;

      if (dataloggerType === '1') {
        prescaler = document.getElementById('prescalerSelect').value;
        fwdflow = forwardFlow;
        revflow = reverseFlow;
      }

      // Combine the form values into a single string or binary format
      const combinedValue = `${activationStatus},${apn},${interval},${protocol},${url},${port},${dataloggerType},${antenna},${ntpserver},${prescaler},${fwdflow},${revflow}`;
      console.log(combinedValue)
      // Convert the combined string to a Uint8Array
      let encoder = new TextEncoder();
      let valueToWrite = encoder.encode(combinedValue);

      // Write the value to the characteristic
      await ReadWriteCharacteristic.characteristic.writeValue(valueToWrite);



      console.log('Configuration written successfully:', combinedValue);
      alert("Configuration written successfully");
    } catch (error) {
      console.log('Error writing configuration:', error);
    }
    //onReadButtonClick()
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // function parseAndPrintHex(hexString) {
  //   // Parsing the hex string into different parts
  //   const type = parseInt(hexString.substring(0, 2), 16);
  //   const timestamp = parseInt(hexString.substring(2, 10), 16);
  //   const timeSyncStatus = parseInt(hexString.substring(10, 12), 16);
  //   const accFlow = parseDoubleFromHex(hexString.substring(12, 28));
  //   const fwdFlow = parseDoubleFromHex(hexString.substring(28, 44));
  //   const revFlow = parseDoubleFromHex(hexString.substring(44, 60));
  //   const flowRate = parseFloatFromHex(hexString.substring(60, 68));
  //   const systemInfo = hexString.substring(68, 76).match(/.{1,2}/g).reverse().join('');
  //   const errorCode = hexString.substring(76, 78);
  //   const voltage1 = (parseInt(hexString.substring(78, 80), 16) + 200) / 100;
  //   const voltage2 = (parseInt(hexString.substring(80, 82), 16) + 200) / 100;

  //   // Printing parsed values
  //   console.log(`Type: ${type === 0 ? 'NDC' : 'PDC'}`);
  //   console.log(`Timestamp: ${new Date(timestamp * 1000).toISOString()}`);
  //   console.log(`Time Sync Status: ${timeSyncStatus === 0 ? 'Not Synced' : 'Synced'}`);
  //   console.log(`Accumulated Flow: ${accFlow}`);
  //   console.log(`Forward Flow: ${fwdFlow}`);
  //   console.log(`Reverse Flow: ${revFlow}`);
  //   console.log(`Flow Rate: ${flowRate}`);
  //   console.log(`System Info: ${systemInfo}`);
  //   console.log(`Error Code: ${errorCode}`);
  //   console.log(`Voltage 1: ${voltage1.toFixed(2)} V`);
  //   console.log(`Voltage 2: ${voltage2.toFixed(2)} V`);
  // }

  function parseDoubleFromHex(hex) {
    // Create a buffer for the double's hex value
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    hex.match(/../g).reverse().forEach((byte, index) => view.setUint8(index, parseInt(byte, 16)));
    return view.getFloat64(0, false); // false for big-endian
  }

  function parseFloatFromHex(hex) {
    // Create a buffer for the float's hex value
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    hex.match(/../g).reverse().forEach((byte, index) => view.setUint8(index, parseInt(byte, 16)));
    return view.getFloat32(0, false); // false for big-endian
  }

  function parseAndPrintHex(hexString) {
    const type = parseInt(hexString.substring(0, 2), 16);
    //const timestamp = parseInt(hexString.substring(2, 10), 16);
    const timestampHex = hexString.substring(2, 10);
    const timestamp = parseInt(
      timestampHex.substring(6, 8) +
      timestampHex.substring(4, 6) +
      timestampHex.substring(2, 4) +
      timestampHex.substring(0, 2),
      16
    );
    const timeSyncStatus = parseInt(hexString.substring(10, 12), 16);
    const accFlow = parseDoubleFromHex(hexString.substring(12, 28));
    const fwdFlow = parseDoubleFromHex(hexString.substring(28, 44));
    const revFlow = parseDoubleFromHex(hexString.substring(44, 60));
    const flowRate = parseFloatFromHex(hexString.substring(60, 68));
    const systemInfo = hexString.substring(68, 76).match(/.{1,2}/g).reverse().join('');
    const errorCode = hexString.substring(76, 78);
    const voltage1 = (parseInt(hexString.substring(78, 80), 16) + 200) / 100;
    const voltage2 = (parseInt(hexString.substring(80, 82), 16) + 200) / 100;

    return {
      type: type === 0 ? 'NDC' : 'PDC',
      timestamp: new Date(timestamp * 1000).toISOString(),
      timeSyncStatus: timeSyncStatus === 0 ? 'Not Synced' : 'Synced',
      accFlow: accFlow.toFixed(3),
      fwdFlow: fwdFlow.toFixed(3),
      revFlow: revFlow.toFixed(3),
      flowRate: flowRate.toFixed(3),
      systemInfo,
      errorCode,
      voltage1: voltage1.toFixed(2),
      voltage2: voltage2.toFixed(2)
    };
  }

  const addLogEntry = (hexString) => {
    const entry = parseAndPrintHex(hexString);
    if (entry.timeSyncStatus === "Synced") {
      setLogEntries(prevEntries => [...prevEntries, entry]);
    }
  };

  const WriteDataLoggerSize = async (z) => {
    try {
      // Create an ArrayBuffer for Uint16
      const buffer = new ArrayBuffer(2); // Uint16 takes 2 bytes
      const dataView = new DataView(buffer);

      // Set the value of z at the first position (index 0) in the buffer as Uint16
      dataView.setUint16(0, z, true); // 'true' for little-endian, 'false' for big-endian

      // Write the buffer to the characteristic
      await ReadWriteCharacteristicLoggerData.characteristic.writeValue(buffer);
      console.log('Write successful');
    } catch (error) {
      console.log('Error:', error);
    }
  }

  const ReadDataLoggerSize = async () => {
    try {
      let endByteReceived = false;
      // let i = 0;
      let z = 0;

      while (!endByteReceived) {
        // Create an ArrayBuffer and a DataView to handle the Uint16 data
        // Simulate delay (if necessary)

        // WriteDataLoggerSize(z++);
        // console.log("loop",z);
        // delay(1000);

        // Read the value from the characteristic
        const responseValue = await ReadWriteCharacteristicLoggerData.characteristic.readValue();
        const dataView = new DataView(responseValue.buffer);
        let hexString = '';
        endByteReceived = true; // Assume the end byte is received unless proven otherwise
        delay(100);
        for (let j = 0; j < responseValue.byteLength; j++) {
          const byteCheck = dataView.getUint8(0);
          const byte = dataView.getUint8(j);
          const hex = byte.toString(16).padStart(2, '0');
          hexString += hex;

          if (byteCheck === 0xFF) {
            endByteReceived = true;
            console.log("End byte received, stopping read.");
            break;
          } else {
            endByteReceived = false; // Continue reading if not 0xFF

          }
        }
        if (!endByteReceived) {
          console.log("Read response as hex:", hexString);
          addLogEntry(hexString);
        }

        //i++; // Increment to handle the next Uint16 data index
      }

    } catch (error) {
      console.log('Error:', error);
    }
  };


  const ReadDataLoggerLog = async () => {
    console.log('ReadDataLoggerLog');
    try {
      let logs = '';
      for (let i = 0; i <= 20; i++) {
        const value = await ReadCharacteristicLoggerLog.characteristic.readValue();
        const decoder = new TextDecoder('utf-8');
        const result = decoder.decode(value);
        console.log('ReadDataLoggerLog result', result);
        logs += result + '\n';
      }
      setLteLogOutput(logs); // Update the state with the accumulated log data
    } catch (error) {
      console.log('Error:', error);
    }
  };
  // const ReadDataLoggerSize = async () => {
  //   try {


  //     // Iterating through the data logger size
  //     for (let i = 0; i < 30; i++) {
  //       // Create an ArrayBuffer and a DataView to handle the Uint16 data
  //       const buffer = new ArrayBuffer(2); // Uint16 takes 2 bytes
  //       const view = new DataView(buffer);
  //       view.setUint16(0, i, true); // 'true' for little-endian


  //       delay(10);
  //       // After write, read the value from the characteristic
  //       const responseValue = await ReadWriteCharacteristicLoggerData.characteristic.readValue();

  //       const dataView = new DataView(responseValue.buffer);
  //       let hexString = '';

  //       for (let i = 0; i < responseValue.byteLength; i++) {
  //         const hex = dataView.getUint8(i).toString(16).padStart(2, '0');  // Get byte at position i, convert to hex, pad with zero if necessary
  //         hexString += hex;  // Append to string
  //       }

  //       console.log("Read response as hex:", hexString);


  //     }

  //   } catch (error) {
  //     console.log('Error:', error);
  //   }
  // };

  const ReadInfo = async () => {
    try {
      await ReadCharacteristic.characteristic.readValue();
      const value = await ReadCharacteristic.characteristic.readValue();
      const decoder = new TextDecoder('utf-8');
      const result = decoder.decode(value);

      const [EUI, firmwareVersion, epochTimeStampUTC, Rssi, SNR, BatteryV, BankV] = result.split(',');
      const date = new Date(parseInt(epochTimeStampUTC) * 1000); // Converting epoch to milliseconds
      const readableDate = date.toUTCString(); // Converts date to UTC string
      console.log('Read value:', result);
      setDeviceInfo({
        EUI,
        firmwareVersion,
        timestamp: readableDate + " (UTC)", // Adding " (UTC)" suffix
        Rssi,
        SNR,
        BatteryV,
        BankV
      });

    } catch (error) {
      console.log('Error: ' + error);
    }
  };


  async function onReadButtonClick() {
    try {
      // Read the value from the characteristic
      await ReadWriteCharacteristic.characteristic.readValue();
      var value = await ReadWriteCharacteristic.characteristic.readValue();
      let decoder = new TextDecoder('utf-8');
      let result = decoder.decode(value);

      // Log or display the read value
      console.log('Read value:', result);
      createLogElement(result, 0, "READ COnfig");

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
        pdcprescaler,
        fwdflow,
        revflow
      ] = result.split(',');

      // Set the form values

      //setIsActivated(activationStatus === '1'); // Update the activation state
      if (activationStatus === '1') {
        setIsActivated(true);
        document.getElementById('activationToggle').checked = true;
      } else {
        setIsActivated(false);
        document.getElementById('activationToggle').checked = false;
      }
      document.getElementById('apnInput').value = apn;
      document.getElementById('intervalSelect').value = interval;
      document.getElementById('protocolSelect').value = protocol;
      document.getElementById('urlInput').value = url;
      document.getElementById('portInput').value = port;
      document.getElementById('dataloggerTypeSelect').value = dataloggerType;
      setDataloggerType(dataloggerType);
      document.getElementById('antennaSelect').value = antenna;
      document.getElementById('ntpInput').value = ntpserver;

      document.getElementById('prescalerSelect').value = pdcprescaler;
      // document.getElementById('forwardFlowInput').value = fwdflow;
      // document.getElementById('reverseFlowInput').value = revflow;

      setForwardFlow(Number(fwdflow))
      setReverseFlow(Number(revflow))

      setAccumulatedFlow(Number(fwdflow) - Number(revflow));

    } catch (error) {
      console.log('Error: ' + error);
    }
  }
  const exportToCSV = () => {
    const headers = "Type,Timestamp,Time Sync Status,Accumulated Flow,Forward Flow,Reverse Flow,Flow Rate,System Info,Error Code,Datalogger Voltage\n";
    const rows = logEntries.map(entry =>
      `${entry.type},${entry.timestamp},${entry.timeSyncStatus},${entry.accFlow},${entry.fwdFlow},${entry.revFlow},${entry.flowRate},${entry.systemInfo},${entry.errorCode},${entry.voltage1} V`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'DataloggerData.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  useEffect(() => {
    //console.log(props);
    //onReadButtonClick();
    // ReadDataLoggerSize();
  }, []);

  return (
    <div className="container-fluid">
      <div className="container">
        <div className='row justify-content-center mt-4'>
          <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4 p-3 border mx-2 my-2">
            <form>
              <fieldset disabled>
                <legend>Datalogger Info</legend>
                <div className="mb-3 row">
                  <label htmlFor="euiInput" className="col-sm-4 col-form-label text-start">EUI</label>
                  <div className="col-sm-8">
                    <input type="text" id="euiInput" className="form-control text-end" value={deviceInfo.EUI} />
                  </div>
                </div>
                <div className="mb-3 row">
                  <label htmlFor="firmwareVersionInput" className="col-sm-4 col-form-label text-start">Firmware Version</label>
                  <div className="col-sm-8">
                    <input type="text" id="firmwareVersionInput" className="form-control text-end" value={deviceInfo.firmwareVersion} />
                  </div>
                </div>
                <div className="mb-3 row">
                  <label htmlFor="timestampInput" className="col-sm-4 col-form-label text-start">Timestamp</label>
                  <div className="col-sm-8">
                    <input type="text" id="timestampInput" className="form-control text-end" value={deviceInfo.timestamp} />
                  </div>
                </div>
                <div className="mb-3 row">
                  <label htmlFor="rssiInput" className="col-sm-4 col-form-label text-start">RSSI</label>
                  <div className="col-sm-8">
                    <input type="text" id="rssiInput" className="form-control text-end" value={deviceInfo.Rssi} />
                  </div>
                </div>
                <div className="mb-3 row">
                  <label htmlFor="snrInput" className="col-sm-4 col-form-label text-start">BER</label>
                  <div className="col-sm-8">
                    <input type="text" id="snrInput" className="form-control text-end" value={deviceInfo.SNR} />
                  </div>
                </div>
                <div className="mb-3 row">
                  <label htmlFor="batteryInput" className="col-sm-4 col-form-label text-start">Battery (V)</label>
                  <div className="col-sm-8">
                    <input type="text" id="batteryInput" className="form-control text-end" value={deviceInfo.BatteryV} />
                  </div>
                </div>
                <div className="mb-3 row">
                  <label htmlFor="backupInput" className="col-sm-4 col-form-label text-start">Backup </label>
                  <div className="col-sm-8">
                    <input type="text" id="backupInput" className="form-control text-end" value={deviceInfo.BankV} />
                  </div>
                </div>
              </fieldset>
              <div className="row">
                <div className="col-sm-8 offset-sm-4 text-start">
                  <button type="button" className="btn btn-primary me-2" onClick={ReadInfo}>Read</button>

                </div>
              </div>
            </form>
          </div>
          <div className="col-xs-12 col-sm-6 col-md-4 col-lg-4 p-3 border mx-2 my-2">
            <form id="deviceConfigForm" onSubmit={handleFormSubmit}>
              <legend>Datalogger Config</legend>
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
                    {/* <option value="6">6 Hours</option>
                    <option value="12">12 Hours</option> */}
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
                    {/* <option value="2">HTTP</option>
                    <option value="3">HTTPS</option> */}
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

              <div className="mb-3 row align-items-center">
                <label htmlFor="dataloggerTypeSelect" className="col-sm-4 col-form-label text-start">Datalogger Type</label>
                <div className="col-sm-8">
                  <select className="form-select" id="dataloggerTypeSelect" required disabled={!isActivated} onChange={handleDataloggerTypeChange}>
                    <option value="0">NDC</option>
                    <option value="1">PULSE</option>
                  </select>
                </div>
              </div>

              {dataloggerType === '1' && (
                <>
                  <div className="mb-3 row align-items-center">
                    <label htmlFor="accumulatedFlowInput" className="col-sm-4 col-form-label text-start">Accumulated Flow (m<sup>3</sup>)</label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="accumulatedFlowInput"
                        placeholder="Enter Accumulated Flow"
                        required
                        disabled
                        value={accumulatedFlow}
                      />
                    </div>
                  </div>

                  <div className="mb-3 row align-items-center">
                    <label htmlFor="forwardFlowInput" className="col-sm-4 col-form-label text-start">Forward Flow (m<sup>3</sup>)</label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="forwardFlowInput"
                        placeholder="Enter Forward Flow"
                        required
                        disabled={!isActivated}
                        value={forwardFlow}
                        onChange={handleForwardFlowChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3 row align-items-center">
                    <label htmlFor="reverseFlowInput" className="col-sm-4 col-form-label text-start">Reverse Flow (m<sup>3</sup>)</label>
                    <div className="col-sm-8">
                      <input
                        type="text"
                        className="form-control"
                        id="reverseFlowInput"
                        placeholder="Enter Reverse Flow"
                        required
                        disabled={!isActivated}
                        value={reverseFlow}
                        onChange={handleReverseFlowChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3 row align-items-center">
                    <label htmlFor="prescalerSelect" className="col-sm-4 col-form-label text-start">Pulse Prescaler</label>
                    <div className="col-sm-8">
                      <select className="form-select" id="prescalerSelect" required disabled={!isActivated} value={prescaler} onChange={e => setPrescaler(e.target.value)}>
                        <option value="1">1</option>
                        <option value="10">10</option>
                        <option value="100">100</option>
                        <option value="1000">1000</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="row">
                <div className="col-sm-8 offset-sm-4 text-start">
                  <button type="button" className="btn btn-secondary me-2" onClick={onReadButtonClick}>Read</button>
                  <button type="submit" className="btn btn-primary">Write</button>
                </div>
              </div>

            </form>
          </div>
        </div>
        <div className='row justify-content-center mt-4 border mx-2 my-2'>
          <div className="col-12 mb-3">
            <button type="button" className="btn btn-primary me-2" onClick={ReadDataLoggerSize}>Read Logged Data</button>
            <button type="button" className="btn btn-secondary" onClick={exportToCSV}>Export Data</button>

          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Timestamp</th>
                <th>Time Sync Status</th>
                <th>Accumulated Flow</th>
                <th>Forward Flow</th>
                <th>Reverse Flow</th>
                <th>Flow Rate</th>
                <th>System Info</th>
                <th>Error Code</th>
                <th>Voltage</th>

              </tr>
            </thead>
            <tbody>
              {currentEntries.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.type}</td>
                  <td>{entry.timestamp}</td>
                  <td>{entry.timeSyncStatus}</td>
                  <td>{entry.accFlow}</td>
                  <td>{entry.fwdFlow}</td>
                  <td>{entry.revFlow}</td>
                  <td>{entry.flowRate}</td>
                  <td>{entry.systemInfo}</td>
                  <td>{entry.errorCode}</td>
                  <td>{entry.voltage1} V</td>
                </tr>
              ))}
            </tbody>
          </table>
          <nav>
            <ul className='pagination'>
              {pageNumbers.map(number => (
                <li key={number} className='page-item'>
                  <a onClick={() => paginate(number)} className='page-link'>
                    {number}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className='row justify-content-center mt-4 border mx-2 my-2'>
          <div className="col-12 mb-3">
            <button type="button" className="btn btn-primary me-2" onClick={ReadDataLoggerLog}>LTE Log</button>
          </div>
          <div className="col-12">
            <textarea
              className="form-control"
              id="lteLogOutput"
              rows="10"
              value={lteLogOutput}
              readOnly
            ></textarea>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Datalogger;