/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import entity.Employees;
import entity.Save_weights;
import entity.Supervisor;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;

/**
 *
 * @author pasan
 */
@MultipartConfig
@WebServlet(name = "Save_weights_orders", urlPatterns = {"/Save_weights_orders"})
public class Save_weights_orders extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
   
    Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("Success", false); // Default response is failure

        JsonArray dataArray = gson.fromJson(req.getReader(), JsonArray.class);
        

        // Database connection for Hibernate
        Session session = HibernateUtil.getSessionFactory().openSession();
        Transaction transaction = null;

        boolean success = true;
        
        try {
            // Begin transaction
            transaction = session.beginTransaction();

            // Step 1: Generate the custom order ID (ORD + timestamp)
            String customOrderId = "ORD" + System.currentTimeMillis();

            // Step 2: Loop through the data array and insert into both `order` and `save_weights`
            for (int i = 0; i < dataArray.size(); i++) {
                
                JsonObject entry = dataArray.get(i).getAsJsonObject();
                int empid = Integer.parseInt(entry.get("empId").getAsString());   // Extract employee ID
                float weight = Float.parseFloat(entry.get("weight").getAsString()); // Extract weight
                int supervisorId = Integer.parseInt(entry.get("supervisorId").getAsString()); // Extract supervisor ID

                // Fetch employee using Hibernate
                Employees employee = (Employees) session.get(Employees.class, empid);

                if (employee == null) {
                    success = false;
                    break;  // Stop if employee is not found
                }

                // Fetch supervisor using supervisorId
                Supervisor supervisor = (Supervisor) session.get(Supervisor.class, supervisorId);
                if (supervisor == null) {
                    success = false;
                    break;  // Stop if supervisor is not found
                }

                // Step 3: Create an Order and Save Weights entities
               
             

                // Create SaveWeights entity
                Save_weights save_weights = new Save_weights();
                save_weights.setWeightValue(weight);
                save_weights.setTimestamp(new Date()); // Set the registration date
                save_weights.setEmployee(employee);
                save_weights.setOrderId(customOrderId);
                save_weights.setSupervisor(supervisor);

                

                // Step 4: Save entities using Hibernate Session
              
                session.save(save_weights);  // Save the weight

                // Check if any saving fails, break out of the loop
                if (save_weights.getId() == 0) {
                    success = false;
                    break;  // If save fails, stop further processing
                }
            }

            // Step 5: Commit or rollback the transaction
            if (success) {
                transaction.commit();  // Commit the transaction if successful
                responseJson.addProperty("Success", true);
                responseJson.addProperty("message", "Data saved successfully!");
            } else {
                transaction.rollback();  // Rollback the transaction if any insert failed
                responseJson.addProperty("Success", false);
                responseJson.addProperty("message", "Failed to save data");
            }
        } catch (Exception e) {
            try {
                if (session != null && session.getTransaction() != null) {
                    session.getTransaction().rollback();  // Rollback in case of an error
                }
            } catch (Exception rollbackException) {
                rollbackException.printStackTrace();
            }
            e.printStackTrace();
            responseJson.addProperty("success", false);
            responseJson.addProperty("message", "Error saving data");
        } finally {
            session.close();
        }
        
        
        
        
        // Set response content type to JSON and return the response
        resp.setContentType("application/json");
        resp.getWriter().write(gson.toJson(responseJson)); // Send the response JSON

    
    
    
    
    }
    

}
