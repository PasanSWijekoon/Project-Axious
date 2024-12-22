#include <WiFi.h>
#include <HTTPClient.h>
#include <HX711.h>
#include <LiquidCrystal_I2C.h>
 
// WiFi credentials
const char* ssid = "CIA Safe House";     // Replace with your WiFi SSID
const char* password = "*****";     // Replace with your WiFi password

// Server URL
const char* serverURL = "Locallhost/Axious_Backend/store_weight";  // Replace with your server's URL

// HX711 pins
#define LOADCELL_DOUT_PIN  5   // Data pin for HX711
#define LOADCELL_SCK_PIN   4   // Clock pin for HX711

// Button and LED pins
#define BUTTON_PIN 16          // Pin for the push button
#define LED_PIN 2              // Pin for the LED

// LCD setup
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Adjust I2C address if necessary

// HX711 setup
HX711 scale;
float calibration_factor = 72207.25;  // Adjust based on calibration

void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);

  // Initialize LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Initializing...");
  delay(2000);

  // Initialize HX711
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(calibration_factor);
  scale.tare();  // Reset the scale

  // Button and LED setup
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // Button with internal pull-up
  pinMode(LED_PIN, OUTPUT);          // LED as output
  digitalWrite(LED_PIN, LOW);        // Turn off LED initially

  // Connect to WiFi
  lcd.clear();
  lcd.print("Connecting WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
    lcd.setCursor(0, 1);
    lcd.print(".");
  }
  lcd.clear();
  lcd.print("WiFi Connected");
  Serial.println("Connected to WiFi");
  delay(2000);
}

void loop() {
  // Get weight reading
  float weight = scale.get_units(100);  // Get average of 10 readings

  // Display weight on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Weight: ");
   if (weight < 0)
  {
    weight = 0.00;
  }
  lcd.print(weight, 2);
  lcd.setCursor(0, 1);
  lcd.print("kg");

  // Check if the button is pressed (LOW due to pull-up)
  if (digitalRead(BUTTON_PIN) == LOW) {
    Serial.println("Button pressed!");

    // Send weight to the server
    sendWeightToServer(weight);

    // Blink the LED to indicate data sent
    digitalWrite(LED_PIN, HIGH);
    delay(1000);  // LED on for 1 second
    digitalWrite(LED_PIN, LOW);

  }

  //delay(1000);  // Adjust delay as needed
}

void sendWeightToServer(float weight) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Begin HTTP connection
    http.begin(serverURL);

    // Prepare payload
    String payload = "weight=" + String(weight, 2);

    // Set content-type header
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");

    // Send POST request
    int httpResponseCode = http.POST(payload);

    // Check server response
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Server Response: " + response);
    } else {
      Serial.print("Error in sending POST request: ");
      Serial.println(httpResponseCode);
    }

    // End HTTP connection
    http.end();
  } else {
    Serial.println("WiFi not connected");
  }
}
