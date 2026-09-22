import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

/**
 * On Android, the hardware back button exits the app by default once a
 * listener is registered here — so we take over: step back through the
 * in-app history everywhere except on the home screen, where the default
 * (exit) behavior applies.
 */
export function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = App.addListener("backButton", () => {
      if (locationRef.current.pathname === "/") {
        App.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      listenerPromise.then((handle) => handle.remove());
    };
  }, [navigate]);
}
