#define MOISTURE_PIN A0 
void setup() {
   Serial.begin(9600);
}
void loop() {
  int moistureValue = analogRead(MOISTURE_PIN);

  Serial.println(moistureValue);
  delay(300);
}
 