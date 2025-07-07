"use client";
// file = Html5QrcodePlugin.jsx
import { Html5QrcodeResult, Html5QrcodeScanner } from "html5-qrcode";
import { Html5QrcodeError } from "html5-qrcode/esm/core";
import { useEffect } from "react";

const qrcodeRegionId = "html5qr-code-full-region";

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: any) => {
  let config: { [k: string]: any } = {};
  if (props.fps) {
    config.fps = props.fps;
  }
  if (props.qrbox) {
    config.qrbox = props.qrbox;
  }
  if (props.aspectRatio) {
    config.aspectRatio = props.aspectRatio;
  }
  if (props.disableFlip !== undefined) {
    config.disableFlip = props.disableFlip;
  }
  return config;
};


const Html5QrcodePlugin = (props?: any) => {
  useEffect(() => {
    // when component mounts
    const config = {
      fps: 10,
      qrbox: 250,
      disableFlip: false,
    };
    const qrCodeSuccessCallback = (decodedText: string, decodedResult: Html5QrcodeResult) => {
      console.log("🚀 ~ useEffect ~ decodedText:", decodedText);
      console.log("🚀 ~ useEffect ~ decodedResult:", decodedResult);
    };
    const qrCodeErrorCallback = (errorMessage: string, error: Html5QrcodeError) => {
      console.log("🚀 ~ useEffect ~ errorMessage:", errorMessage);
      console.log("🚀 ~ useEffect ~ error:", error);
    };
    // const verbose = props.verbose === true;
    // Suceess callback is required.
    // if (!qrCodeSuccessCallback) {
    //   throw "qrCodeSuccessCallback is required callback.";
    // }
    const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, true);
    html5QrcodeScanner.render(qrCodeSuccessCallback, qrCodeErrorCallback);

    // cleanup function when component will unmount
    return () => {
      html5QrcodeScanner.clear().catch((error) => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return <div id={qrcodeRegionId} />;
};

export default Html5QrcodePlugin;
