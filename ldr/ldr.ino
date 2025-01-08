#define LDR_PIN 14      // LDR connected to digital pin 13
#define LED_PIN 13      // LED or output device connected to digital pin 12

void setup() {
  pinMode(LDR_PIN, INPUT);  // Set LDR pin as input
  pinMode(LED_PIN, OUTPUT); // Set LED pin as output
  Serial.begin(9600);       // Initialize serial communication for debugging
}

void loop() {
  int ldrValue = digitalRead(LDR_PIN); // Read the digital value from the LDR
  Serial.print("LDR Value: ");
  Serial.println(ldrValue);

  // Control the LED based on the LDR value
  if (ldrValue == LOW) {
    // It's dark
    Serial.println("It's dark, LED ON");
    digitalWrite(LED_PIN, HIGH); // Turn on the LED
  } else {
    // It's bright
    Serial.println("It's bright, LED OFF");
    digitalWrite(LED_PIN, LOW);  // Turn off the LED
  }

  delay(500); // Add a small delay to stabilize the readings
}
