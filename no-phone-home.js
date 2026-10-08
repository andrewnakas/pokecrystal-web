// no-phone-home.js — runtime egress guard.
//
// Loaded BEFORE anything else on the page. Everything this site needs is served
// from its own origin (data/, data/cores/) or lives in memory as a blob. Nothing
// is ever sent anywhere. This file makes that a hard runtime rule instead of a
// promise: any attempt to reach a third-party origin is refused and logged.
//
// The <meta http-equiv="Content-Security-Policy"> in index.html enforces the
// same thing at the browser level (connect-src 'self' blob: data:). This guard
// is the second layer, and it is what the automated test inspects.
(function () {
  "use strict";

  var blocked = [];
  window.__egress = { blocked: blocked, bodies: [] };

  function sameOrigin(url) {
    if (url === undefined || url === null) return true;
    var s = String(url);
    if (s.startsWith("blob:") || s.startsWith("data:")) return true;
    try {
      return new URL(s, location.href).origin === location.origin;
    } catch (e) {
      return false;   // unparseable -> refuse
    }
  }

  function refuse(kind, url) {
    blocked.push({ kind: kind, url: String(url), t: Date.now() });
    console.warn("[no-phone-home] refused " + kind + " to " + url);
  }

  // Record anything handed an outbound body, same-origin or not. The test reads
  // this to confirm the ROM bytes never left the tab.
  function noteBody(kind, url, body) {
    if (body === undefined || body === null || body === "") return;
    var size = -1;
    try {
      if (typeof body === "string") size = body.length;
      else if (body.byteLength !== undefined) size = body.byteLength;
      else if (body.size !== undefined) size = body.size;
    } catch (e) { /* ignore */ }
    window.__egress.bodies.push({ kind: kind, url: String(url), size: size });
  }

  var realFetch = window.fetch;
  if (realFetch) {
    window.fetch = function (input, init) {
      var url = (input && typeof input === "object" && "url" in input) ? input.url : input;
      if (init && init.body) noteBody("fetch", url, init.body);
      if (!sameOrigin(url)) {
        refuse("fetch", url);
        return Promise.reject(new TypeError("blocked by no-phone-home: " + url));
      }
      return realFetch.apply(this, arguments);
    };
  }

  var XHR = window.XMLHttpRequest;
  if (XHR) {
    var realOpen = XHR.prototype.open;
    var realSend = XHR.prototype.send;
    XHR.prototype.open = function (method, url) {
      this.__url = url;
      this.__ok = sameOrigin(url);
      return realOpen.apply(this, arguments);
    };
    XHR.prototype.send = function (body) {
      if (body) noteBody("xhr", this.__url, body);
      if (!this.__ok) {
        refuse("xhr", this.__url);
        throw new Error("blocked by no-phone-home: " + this.__url);
      }
      return realSend.apply(this, arguments);
    };
  }

  if (navigator.sendBeacon) {
    var realBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      noteBody("beacon", url, data);
      refuse("beacon", url);   // this site has no reason to beacon anywhere, ever
      return false;
    };
  }

  var RealWS = window.WebSocket;
  if (RealWS) {
    window.WebSocket = function (url, protocols) {
      if (!sameOrigin(url)) {
        refuse("websocket", url);
        throw new Error("blocked by no-phone-home: " + url);
      }
      return protocols === undefined ? new RealWS(url) : new RealWS(url, protocols);
    };
    window.WebSocket.prototype = RealWS.prototype;
    ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function (k, i) {
      window.WebSocket[k] = i;
    });
  }

  if (window.RTCPeerConnection) {
    window.RTCPeerConnection = function () {
      refuse("rtcpeerconnection", "(webrtc)");
      throw new Error("blocked by no-phone-home: WebRTC");
    };
  }
})();
