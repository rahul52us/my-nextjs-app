// conversionLogic.ts
export type ConversionCategory =
  | "Weight"
  | "Length"
  | "Temperature"
  | "Time"
  | "Currency"
  | "Speed"
  | "Energy"
  | "Area"
  | "Volume"
  | "Pressure"
  | "Data Storage";

export const unitConversionMap: Record<string, Record<string, Record<string, string>>> = {
  Weight: {
    Kilograms: { Pounds: "2.20462", Grams: "1000", Ounces: "35.274" },
    Pounds: { Kilograms: "0.453592", Grams: "453.592", Ounces: "16" },
    Grams: { Kilograms: "0.001", Pounds: "0.00220462", Ounces: "0.035274" },
  },
  Length: {
    Meters: { Kilometers: "0.001", Miles: "0.000621371", Feet: "3.28084" },
    Kilometers: { Meters: "1000", Miles: "0.621371", Feet: "3280.84" },
    Miles: { Meters: "1609.34", Kilometers: "1.60934", Feet: "5280" },
  },
  Temperature: {
    Celsius: { Fahrenheit: "1.8", Kelvin: "273.15" },
    Fahrenheit: { Celsius: "0.5555556", Kelvin: "255.372" },
    Kelvin: { Celsius: "-273.15", Fahrenheit: "-457.67" },
  },
  Time: {
    Seconds: { Minutes: "0.0166667", Hours: "0.000277778" },
    Minutes: { Seconds: "60", Hours: "0.0166667" },
    Hours: { Minutes: "60", Seconds: "3600" },
  },
  Currency: {
    USD: { EUR: "0.85", GBP: "0.75", INR: "83" },
    EUR: { USD: "1.1765", GBP: "0.88", INR: "98" },
    GBP: { USD: "1.3333", EUR: "1.14", INR: "130" },
    INR: { USD: "0.012048", EUR: "0.010204", GBP: "0.0076923" }
  },
  Speed: {
    KilometersPerHour: { MilesPerHour: "0.621371", MetersPerSecond: "0.277778" },
    MilesPerHour: { KilometersPerHour: "1.60934", MetersPerSecond: "0.44704" },
  },
  Area: {
    SquareMeters: { SquareFeet: "10.7639", Acres: "0.000247" },
    SquareFeet: { SquareMeters: "0.092903", Acres: "0.00002296" },
  },
  Volume: {
    Liters: { Gallons: "0.264172", Milliliters: "1000" },
    Gallons: { Liters: "3.78541", Milliliters: "3785.41" },
  },
  DataStorage: {
    Bytes: { Kilobytes: "0.001", Megabytes: "0.000001", Gigabytes: "0.000000001", Terabytes: "0.000000000001" },
    Kilobytes: { Bytes: "1000", Megabytes: "0.001", Gigabytes: "0.000001", Terabytes: "0.000000001" },
    Megabytes: { Bytes: "1000000", Kilobytes: "1000", Gigabytes: "0.001", Terabytes: "0.000001" },
    Gigabytes: { Bytes: "1000000000", Kilobytes: "1000000", Megabytes: "1000", Terabytes: "0.001" },
    Terabytes: { Bytes: "1000000000000", Kilobytes: "1000000000", Megabytes: "1000000", Gigabytes: "1000" },
  },
};

export const performConversion = (
  type: ConversionCategory,
  fromUnit: string,
  toUnit: string,
  value: number
) => {
  const conversionFactor = parseFloat(unitConversionMap[type]?.[fromUnit]?.[toUnit] || "1");
  return value * conversionFactor;
};
