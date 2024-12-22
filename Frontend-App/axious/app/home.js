import React, { useEffect, useState } from "react"; // Import React and useState for managing state
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
  Alert,
} from "react-native"; // Import React Native components
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for icons
import AsyncStorage from "@react-native-async-storage/async-storage";

const SCREEN_WIDTH = Dimensions.get("window").width; // Get screen width for responsive design

const TeaCollector = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userJson = await AsyncStorage.getItem("user");
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, []);

  // State to manage the sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // State to manage the currently active page
  const [activePage, setActivePage] = useState("Add Collections");

  // State for Weight input
  const [weight, setWeight] = useState("");

  // State to hold employee weight entries
  const [entries, setEntries] = useState([]);

  // State to manage the total weight
  const [totalWeight, setTotalWeight] = useState(0);

  // State for showing/hiding the employee selection modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  // State for the search query used in the modal
  const [searchQuery, setSearchQuery] = useState("");

  const [employees, setEmployees] = useState([]); // To store fetched employee
  const [filteredEmployees, setFilteredEmployees] = useState([]); // Filtered employees based on search query

  const [weightOrders, setWeightOrders] = useState([]);

  const fetchWeightOrders = async () => {
    try {
      const response = await fetch(
        process.env.EXPO_PUBLIC_API_URL + "/get_weight_orders"
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch weight orders");
      }
  
      const data = await response.json();
  
      if (Array.isArray(data)) {
        // Sort the data by date (newest first)
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setWeightOrders(sortedData); // Set the sorted data to state
      } else {
        Alert.alert("Error", "Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching weight orders:", error);
      Alert.alert("Error", "Unable to fetch weight orders. Please try again.");
    }
  };
  

  const fetchEmployeeDetails = async () => {
    try {
      // Replace this with your actual API endpoint
      const response = await fetch(
        process.env.EXPO_PUBLIC_API_URL + "/get_employees"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch employee details");
      }

      const data = await response.json(); // Parse the JSON response

      // Check for success and format the employee data
      if (data.success && Array.isArray(data.employees)) {
        const formattedEmployees = data.employees.map((employee) => ({
          id: employee.empid, // Use empid as the unique identifier
          name: `${employee.firstName} ${employee.lastName}`, // Combine first and last names
          mobile: employee.mobile,
          nic: employee.nic,
          registeredDate: employee.registeredDate,
          supervisorId: employee.supervisor?.id || null, // Optional chaining for supervisor ID
        }));

        setEmployees(formattedEmployees); // Update the state with formatted employees
        setFilteredEmployees(formattedEmployees);
      } else {
        Alert.alert("Error", "No employee data found in the response");
      }
    } catch (error) {
      console.error("Error fetching employee details:", error);
      Alert.alert(
        "Error",
        "Unable to fetch employee details. Please try again."
      );
    }
  };

  // State for Employee ID input
  const [empId, setEmpId] = useState("");

  // State for showing/hiding the Add New Employee modal
  const [isAddEmployeeModalVisible, setIsAddEmployeeModalVisible] =
    useState(false);

  // State for managing new employee details
  const [newEmployee, setNewEmployee] = useState({
    f_name: "",
    l_name: "",
    mobile: "",
    nic: "",
  });

  // Filter employees based on the search query
  useEffect(() => {
    const filteredList = employees.filter(
      (employee) =>
        `${employee.id} ${employee.name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) // Case-insensitive filtering
    );
    setFilteredEmployees(filteredList); // Update filtered list
  }, [searchQuery, employees]); // Re-run when searchQuery or employees change

  // Function to handle employee selection from the modal
  const selectEmployee = (id) => {
    setEmpId(id.toString()); // Update the Employee ID state

    setIsModalVisible(false); // Close the modal
    setSearchQuery("");
  };

  const fetchWeight = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch(
        process.env.EXPO_PUBLIC_API_URL + "/get_weight"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weight");
      }

      const data = await response.json(); // Parse the JSON response

      if (data && data.weightValue) {
        setWeight(data.weightValue.toString()); // Use weightValue from the response
      } else {
        Alert.alert("Error", "No weight data found in the response");
      }
    } catch (error) {
      console.error("Error fetching weight:", error);
      Alert.alert("Error", "Unable to fetch weight. Please try again.");
    }
  };

  // Function to add or update entry
  const addEntry = () => {
    if (empId && weight) {
      // Check if the Employee ID already exists
      const existingEntryIndex = entries.findIndex(
        (entry) => entry.empId === empId
      );

      if (existingEntryIndex !== -1) {
        // Update the existing entry by adding the new weight
        const updatedEntries = [...entries];
        updatedEntries[existingEntryIndex].weight =
          parseFloat(updatedEntries[existingEntryIndex].weight) +
          parseFloat(weight);

        setEntries(updatedEntries); // Update the entries state
        calculateTotalWeight(updatedEntries); // Recalculate the total weight
      } else {
        // Add a new entry if Employee ID does not exist
        const newEntry = { id: entries.length + 1, empId, weight };
        const updatedEntries = [...entries, newEntry];

        setEntries(updatedEntries); // Update the entries state
        calculateTotalWeight(updatedEntries); // Recalculate the total weight
      }

      // Reset the input fields
      setEmpId("");
      setWeight("");
    }
  };

  // Function to delete an entry
  const deleteEntry = (id) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id); // Remove the entry by ID
    setEntries(updatedEntries); // Update the entries state
    calculateTotalWeight(updatedEntries); // Recalculate the total weight
  };

  // Function to calculate the total weight
  const calculateTotalWeight = (entries) => {
    const total = entries.reduce(
      (sum, entry) => sum + parseFloat(entry.weight || 0), // Sum up all weights
      0
    );
    setTotalWeight(total); // Update total weight state
  };

  const createEmployee = async () => {
    try {
      const requestBody = {
        ...newEmployee, // Include the new employee details
        supervisorId: currentUser.id, // Add currentUser.id as the supervisor ID
      };

      // Replace with your actual API endpoint
      const response = await fetch(
        process.env.EXPO_PUBLIC_API_URL + "/create_employee",
        {
          method: "POST", // HTTP method
          headers: {
            "Content-Type": "application/json", // Specify JSON format
          },
          body: JSON.stringify(requestBody), // Send the combined object as the request body
        }
      );

      const data = await response.json(); // Parse the JSON response

      if (response.ok && data.Success) {
        Alert.alert(
          "Success",
          data.message || "Employee created successfully!"
        );

        // Clear the input fields by resetting the newEmployee state

        setNewEmployee({
          f_name: "",
          l_name: "",
          mobile: "",
          nic: "",
        });

        // Close the modal
        setIsAddEmployeeModalVisible(false);
      } else {
        Alert.alert("Error", data.message || "Failed to create employee.");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      Alert.alert("Error", "Unable to create employee. Please try again.");
    }
  };

  // Function to handle Final Save
  const finalSave = async () => {
    if (entries.length === 0) {
      Alert.alert("Error", "No entries to save.");
      return;
    }

    // Format data for the request (array of employee ID and weight)
    const data = entries.map((entry) => ({
      empId: entry.empId,
      weight: entry.weight,
      supervisorId: currentUser.id,
    }));

    try {
      // Sending the data to the backend
      const response = await fetch(
        process.env.EXPO_PUBLIC_API_URL + "/Save_weights_orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // Send as JSON
          },
          body: JSON.stringify(data), // Send the employee data
        }
      );

      const result = await response.json(); // Parse the JSON response

      if (response.ok && result.Success) {
        Alert.alert("Success", result.message || "Data saved successfully!");
        setEntries([]); // Clear the entries after successful save
        setTotalWeight(0); // Reset the total weight
      } else {
        Alert.alert("Error", result.message || "Failed to save data.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert(
        "Error",
        "An error occurred while saving the data. Please try again."
      );
    }
  };

  // Sidebar component
  const SidebarMenu = () => (
    <View style={styles.sidebar}>
      {/* Sidebar Header */}
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Axious</Text>
        <Text style={styles.usernameText}>
          {" "}
          {currentUser
            ? `${currentUser.first_name} ${currentUser.last_name}`
            : "User"}
        </Text>
      </View>
      {/* Navigation Buttons */}
      <TouchableOpacity
        style={[
          styles.sidebarItem,
          activePage === "Add Collections" && styles.activeMenuItem,
        ]}
        onPress={() => {
          setActivePage("Add Collections"); // Set active page to Collections
          setIsSidebarOpen(false); // Close sidebar
        }}
      >
        <Ionicons name="leaf" size={20} color="#2ecc71" />
        <Text style={styles.sidebarText}>Add Collections</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.sidebarItem,
          activePage === "View Collections" && styles.activeMenuItem,
        ]}
        onPress={() => {
          fetchWeightOrders();
          setActivePage("View Collections"); // Set active page to Collections
          setIsSidebarOpen(false); // Close sidebar
        }}
      >
        <Ionicons name="book" size={20} color="#2ecc71" />
        <Text style={styles.sidebarText}>View Collections</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.sidebarItem,
          activePage === "Add Employees" && styles.activeMenuItem,
        ]}
        onPress={() => {
          setActivePage("Add Employees"); // Set active page to Catalog
          setIsSidebarOpen(false); // Close sidebar
        }}
      >
        <Ionicons name="person-add" size={20} color="#2ecc71" />
        <Text style={styles.sidebarText}>Add Employees</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.sidebarItem,
          activePage === "View Employees" && styles.activeMenuItem,
        ]}
        onPress={() => {
          setActivePage("View Employees"); // Set active page to Catalog
          setIsSidebarOpen(false); // Close sidebar
        }}
      >
        <Ionicons name="person" size={20} color="#2ecc71" />
        <Text style={styles.sidebarText}>View Employees</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.sidebarItem,
          activePage === "Settings" && styles.activeMenuItem,
        ]}
        onPress={() => {
          setActivePage("Settings"); // Set active page to Settings
          setIsSidebarOpen(false); // Close sidebar
        }}
      >
        <Ionicons name="settings" size={20} color="#2ecc71" />
        <Text style={styles.sidebarText}>Settings</Text>
      </TouchableOpacity>

      {/* Copyright Section */}
      <View style={styles.copyrightContainer}>
        <Text style={styles.copyrightText}>
          © 2024 Axious Tea Collector. All Rights Reserved.
        </Text>
      </View>
    </View>
  );

  // Function to render content based on the active page
  const renderContent = () => {
    switch (activePage) {
      case "Add Collections":
        return (
          <View>
            {/* Form for Employee ID and Weight */}
            <View style={styles.form}>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Emp Id</Text>
                <TextInput
                  style={styles.input}
                  value={empId} // Bind the empId state to this field
                  placeholder="Enter Emp ID"
                  editable={false} // Make it read-only
                />

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => {
                    fetchEmployeeDetails(); // Fetch employee details before opening the modal
                    setIsModalVisible(true); // Open the modal
                  }}
                >
                  <Text style={styles.buttonText}>Select</Text>
                </TouchableOpacity>
              </View>
              {/* Weight Input */}
              <View style={styles.inputRow}>
                <Text style={styles.label}>Weight</Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  placeholder="Enter Weight"
                  editable={false}
                />
              </View>
              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={fetchWeight}
                >
                  <Text style={styles.buttonText}>Get Weight</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={addEntry} // Add entry to the table
                >
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEmpId("");
                    setWeight("");
                  }} // Close modal
                >
                  <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Employee Entries Table */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderText}>Employee ID</Text>
                <Text style={styles.tableHeaderText}>Weight</Text>
              </View>
              <FlatList
                data={entries} // Render all entries
                keyExtractor={(item) => item.id.toString()} // Unique key for each entry
                renderItem={({ item }) => (
                  <View style={styles.tableRow}>
                    {/* Employee ID */}
                    <Text style={styles.tableCell}>{item.empId}</Text>
                    {/* Weight */}
                    <Text style={styles.tableCell}>{item.weight}</Text>
                    {/* Delete Icon */}
                    <TouchableOpacity onPress={() => deleteEntry(item.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#e74c3c"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          </View>
        );

      case "View Collections":
        return (
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Date</Text>
              <Text style={styles.tableHeaderText}>Order ID</Text>
              <Text style={styles.tableHeaderText}>Total Weight (kg)</Text>
            </View>

            {/* Table Rows */}
            <FlatList
              data={weightOrders} // Data from the API
              keyExtractor={(item) => item.orderId} // Use orderId as the unique key
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.date}</Text>
                  <Text style={styles.tableCell}>{item.orderId}</Text>
                  <Text style={styles.tableCell}>{item.totalWeight.toFixed(2)}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.noResultsText}>No orders found</Text>
              }
            />
          </View>
        );

      case "Catalog":
        return (
          <View style={styles.pageContainer}>
            <Text style={styles.pageTitle}>Tea Catalog</Text>
          </View>
        );
      case "Settings":
        return (
          <View style={styles.pageContainer}>
            <Text style={styles.pageTitle}>App Settings</Text>
          </View>
        );
    }
  };

  // Function to handle the Top Navigation Button based on the activePage
  const handleTopNavButtonPress = () => {
    switch (activePage) {
      case "Add Collections":
        setIsAddEmployeeModalVisible(true); // Open Add Employee Modal
        break;
      case "Catalog":
        // Perform a different action if necessary, like opening a catalog modal or another action
        Alert.alert(
          "Catalog Page",
          "You clicked the button on the Catalog Page"
        );
        break;
      case "Settings":
        // For example, you can open a settings modal or other settings page action
        Alert.alert(
          "Settings Page",
          "You clicked the button on the Settings Page"
        );
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <TouchableOpacity
          style={styles.sidebarOverlay}
          onPress={() => setIsSidebarOpen(false)} // Close sidebar on overlay press
        />
      )}

      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navIcon}
          onPress={() => setIsSidebarOpen(!isSidebarOpen)} // Toggle sidebar
        >
          <Ionicons
            name={isSidebarOpen ? "close" : "menu"} // Change icon based on state
            size={24}
            color="#2c3e50"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activePage}</Text>
        <TouchableOpacity
          style={styles.navIcon}
          onPress={() => {
            handleTopNavButtonPress(); // Open Add Employee Modal
          }}
        >
          <Ionicons name="add" size={24} color="#2c3e50" />
        </TouchableOpacity>
      </View>

      {/* Sidebar */}
      {isSidebarOpen && <SidebarMenu />}

      {/* Main Content */}
      <View style={styles.mainContent}>{renderContent()}</View>

      {/* Fixed Total Weight Section at the Bottom */}
      {activePage === "Add Collections" && (
        <View style={styles.totalWeightFixedRow}>
          <View style={styles.totalWeightContainer}>
            <Text style={styles.totalWeightLabel}>Total Weight</Text>
            <TextInput
              style={styles.totalWeightInput}
              value={totalWeight.toString()} // Show total weight
              editable={false} // Input is not editable
            />
          </View>
          <TouchableOpacity
            style={styles.finalSaveButton}
            onPress={finalSave} // Call finalSave function
          >
            <Text style={styles.buttonText}>Final Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Employee Selection Modal */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Search Bar */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ID or Name"
              value={searchQuery}
              onChangeText={setSearchQuery} // Update search query
            />

            {/* Employee List */}
            <FlatList
              data={filteredEmployees} // Render filtered employees
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    selectEmployee(item.id); // Pass the employee ID to update empId
                  }}
                >
                  <Text
                    style={styles.modalText}
                  >{`${item.id} - ${item.name}`}</Text>
                  <Text style={styles.modalSubText}>
                    Mobile: {item.mobile} | NIC: {item.nic}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.noResultsText}>No employees found</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setIsModalVisible(false); // Close Search Modal
                      setSearchQuery("");
                      setIsAddEmployeeModalVisible(true); // Open Add Employee Modal
                    }}
                  >
                    <Text style={styles.buttonText}>Add New Employee</Text>
                  </TouchableOpacity>
                </View>
              }
            />

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsModalVisible(false);
                setSearchQuery("");
              }} // Close modal
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add New Employee Modal */}
      <Modal
        visible={isAddEmployeeModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Employee</Text>

            {/* Employee F_name */}
            <TextInput
              style={styles.inputField}
              value={newEmployee.f_name} // Auto-generated Employee ID
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, f_name: text })
              }
              placeholder="Employee First Name"
            />

            {/* Employee L_name */}
            <TextInput
              style={styles.inputField}
              value={newEmployee.l_name} // Employee Name
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, l_name: text })
              }
              placeholder="Employee Last Name"
            />

            {/* Mobile Number Field */}
            <TextInput
              style={styles.inputField}
              value={newEmployee.mobile} // Mobile Number
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, mobile: text })
              }
              keyboardType="phone-pad"
              placeholder="Mobile Number"
            />

            {/* NIC Field */}
            <TextInput
              style={styles.inputField}
              value={newEmployee.nic} // NIC
              onChangeText={(text) =>
                setNewEmployee({ ...newEmployee, nic: text })
              }
              placeholder="NIC"
            />

            {/* Add Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                createEmployee();
              }}
            >
              <Text style={styles.buttonText}>Add Employee</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setIsAddEmployeeModalVisible(false);
                // setSearchQuery("");

                setNewEmployee({
                  f_name: "",
                  l_name: "",
                  mobile: "",
                  nic: "",
                });
              }} // Close modal
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  usernameText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 5,
    textAlign: "center",
  },

  container: { flex: 1, backgroundColor: "#e6f9e6" },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#2ecc71",
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white" },
  navIcon: { padding: 10 },
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH * 0.7,
    backgroundColor: "white",
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  sidebarHeader: {
    backgroundColor: "#2ecc71",
    padding: 15,
    alignItems: "center",
  },
  sidebarTitle: { color: "white", fontSize: 22, fontWeight: "bold" },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activeMenuItem: { backgroundColor: "#e8f5e9" },
  sidebarText: { marginLeft: 15, fontSize: 16, color: "#2c3e50" },
  sidebarOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 5,
  },
  mainContent: {
    flexGrow: 1, // This makes sure the content above takes the available space
    padding: 15,
  },
  form: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  label: { fontSize: 16, color: "#2c6e49", fontWeight: "bold", width: 70 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    backgroundColor: "white",
  },
  selectButton: {
    backgroundColor: "#2ecc71",
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButton: {
    backgroundColor: "#2ecc71",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  buttonText: { color: "white", fontWeight: "bold" },
  table: {
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#d4f8d4",
    padding: 10,
    borderRadius: 5,
  },
  tableHeaderText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2c6e49",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Align text and icons
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },

  totalWeightsectionstyle: {
    flex: 1,
    justifyContent: "flex-end",
  },

  totalWeightFixedRow: {
    flexDirection: "row", // Arrange the label and button horizontally
    justifyContent: "space-between", // Space out the content evenly
    alignItems: "center", // Center the items vertically
    padding: 15,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  totalWeightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalWeightLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginRight: 10,
  },
  totalWeightInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    width: 100,
    backgroundColor: "white",
    textAlign: "center",
  },
  finalSaveButton: {
    backgroundColor: "#2ecc71",
    padding: 10,
    borderRadius: 5,
  },
  pageContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  pageTitle: { fontSize: 22, color: "#2c3e50" },
  copyrightContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  copyrightText: { fontSize: 12, color: "#7f8c8d" },

  modalTitle: {
    fontSize: 20, // Larger font size for emphasis
    fontWeight: "bold", // Bold for a strong title
    color: "#2c3e50", // Dark color for readability
    marginBottom: 15, // Space below the title
    textAlign: "center", // Center alignment for a polished look
  },

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  addButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  saveButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Modern semi-transparent overlay
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius: 5,
    backgroundColor: "#f7f7f7",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  noResultsText: {
    fontSize: 16,
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TeaCollector;
