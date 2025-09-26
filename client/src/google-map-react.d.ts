declare module 'google-map-react' {
  import * as React from 'react';

  interface BootstrapURLKeys {
    key: string;
    language?: string;
    region?: string;
    [key: string]: string | undefined;
  }

  interface MapOptions {
    styles?: any[];
    [key: string]: any;
  }

  interface Props {
    bootstrapURLKeys?: BootstrapURLKeys;
    defaultCenter?: { lat: number; lng: number };
    center?: { lat: number; lng: number };
    defaultZoom?: number;
    zoom?: number;
    onBoundsChange?: (
      center: { lat: number; lng: number },
      zoom: number,
      bounds: any,
      marginBounds: any
    ) => void;
    onChange?: (
      center: { lat: number; lng: number },
      zoom: number,
      bounds: any,
      marginBounds: any
    ) => void;
    onClick?: (event: any) => void;
    onChildClick?: (key: string, childProps: any) => void;
    onChildMouseDown?: (key: string, childProps: any, mouse: any) => void;
    onChildMouseUp?: (key: string, childProps: any, mouse: any) => void;
    onChildMouseMove?: (key: string, childProps: any, mouse: any) => void;
    onChildMouseEnter?: (key: string, childProps: any) => void;
    onChildMouseLeave?: (key: string, childProps: any) => void;
    onZoomAnimationStart?: (args: any) => void;
    onZoomAnimationEnd?: (args: any) => void;
    onDrag?: (map: any) => void;
    onDragEnd?: (map: any) => void;
    onMapTypeIdChange?: (args: any) => void;
    options?: MapOptions;
    margin?: any[];
    debounced?: boolean;
    heatmapLibrary?: boolean;
    heatmap?: any;
    distanceToMouse?: (
      pointX: number,
      pointY: number,
      markerX: number,
      markerY: number
    ) => number;
    googleMapLoader?: (bootstrapURLKeys: any) => Promise<any>;
    onGoogleApiLoaded?: (maps: { map: any; maps: any; ref: Element | null }) => void;
    yesIWantToUseGoogleMapApiInternals?: boolean;
    draggable?: boolean;
    style?: React.CSSProperties;
    resetBoundsOnResize?: boolean;
    layerTypes?: string[];
    shouldUnregisterMapOnUnmount?: boolean;
  }

  type GoogleMapReact = React.ComponentClass<Props>;

  const GoogleMapReact: GoogleMapReact;
  export default GoogleMapReact;
}