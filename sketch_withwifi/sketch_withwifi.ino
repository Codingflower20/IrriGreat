#include <ESP8266WiFi.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22
#define MOISTURE_PIN A0 
#define RELAY_PIN 5
#define Rpin 16
#define THRESHOLD 590 
#define TEMP_OFFSET 0.0 
int i;
#define WIFI_SSID "iQOOZ6"
#define WIFI_PASSWORD "!@#$%^&*()-w"
#define THINGSPEAK_API_KEY "9QDYEUK0UWJEEYGV"
#define THINGSPEAK_SERVER "api.thingspeak.com"

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(Rpin, OUTPUT);
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  digitalWrite(Rpin, LOW);
  dht.begin();
  float temperature = dht.readTemperature() + TEMP_OFFSET;
  digitalWrite(Rpin, HIGH);
  delay(500);
  digitalWrite(Rpin, LOW);
  float humidity = dht.readHumidity();
  digitalWrite(Rpin, HIGH);
  delay(500);
  digitalWrite(Rpin, LOW);
  int moistureValue = analogRead(MOISTURE_PIN);
  moistureValue = 1024-moistureValue;
  digitalWrite(Rpin, HIGH);
  delay(500);
  digitalWrite(Rpin, LOW);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");
  Serial.print("Humidity: ");
  Serial.println(humidity);
  digitalWrite(Rpin, HIGH);

  String url = String("/update?api_key=") + THINGSPEAK_API_KEY + "&field1=" + String(temperature) + "&field2=" + String(humidity) + "&field3=" + String(moistureValue);
  sendToThingSpeak(url);

  Serial.print("Moisture Value: ");
  Serial.println(moistureValue);

  if (moistureValue < THRESHOLD) {
   pumpLoop: Serial.println("Soil is dry, pump ON");
    digitalWrite(RELAY_PIN, HIGH);
    delay(5000);
    Serial.println("pump OFF");
    digitalWrite(RELAY_PIN, LOW);
    delay(3000);
     moistureValue = analogRead(MOISTURE_PIN);
     moistureValue = 1024-moistureValue;
    if (moistureValue < THRESHOLD)
    goto pumpLoop;
    else{
    Serial.println("Soil is wet, pump OFF");
    goto dfinal;
    }
  } else {
    Serial.println("Soil is wet, pump OFF");
    digitalWrite(RELAY_PIN, LOW);

  }
  
  dfinal: for(i=1;i<=36;i++){
    digitalWrite(Rpin, LOW);
    temperature = dht.readTemperature() + TEMP_OFFSET;
    humidity = dht.readHumidity();
    moistureValue = analogRead(MOISTURE_PIN);
    moistureValue = 1024-moistureValue;
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");
    Serial.print("Humidity: ");
    Serial.println(humidity);
    digitalWrite(Rpin, HIGH);
    Serial.print("Moisture Value: ");
    Serial.println(moistureValue);
    digitalWrite(Rpin, HIGH);
    String url = String("/update?api_key=") + THINGSPEAK_API_KEY + "&field1=" + String(temperature) + "&field2=" + String(humidity) + "&field3=" + String(moistureValue);
    sendToThingSpeak(url);
    delay(6000);
  }
  
   

}

void sendToThingSpeak(String url) {
  WiFiClient client;
  if (!client.connect(THINGSPEAK_SERVER, 80)) {
    Serial.println("Connection failed");
    return;
  }
  client.print(String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + THINGSPEAK_SERVER + "\r\n" +
               "Connection: close\r\n\r\n");
  delay(500);
  while (client.available()) {
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }
}
