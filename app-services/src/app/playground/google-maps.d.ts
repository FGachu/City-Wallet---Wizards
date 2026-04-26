declare namespace google.maps {
  class Map {
    constructor(el: HTMLElement, opts: Record<string, unknown>);
    panTo(latLng: { lat: number; lng: number }): void;
    addListener(event: string, handler: (e: MapMouseEvent) => void): unknown;
  }
  class Marker {
    constructor(opts: Record<string, unknown>);
    setMap(map: Map | null): void;
    setPosition(pos: { lat: number; lng: number }): void;
    addListener(event: string, handler: () => void): unknown;
  }
  class Circle {
    constructor(opts: Record<string, unknown>);
    setMap(map: Map | null): void;
    setCenter(pos: { lat: number; lng: number }): void;
    setRadius(meters: number): void;
  }
  class InfoWindow {
    setContent(html: string): void;
    open(opts: { anchor: Marker; map: Map }): void;
  }
  class Point {
    constructor(x: number, y: number);
  }
  type MapMouseEvent = {
    latLng: { lat: () => number; lng: () => number } | null;
  };
}
