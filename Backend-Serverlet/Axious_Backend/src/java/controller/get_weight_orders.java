/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import entity.Save_weights;
import entity.Weights;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Projections;

/**
 *
 * @author pasan
 */
@WebServlet(name = "get_weight_orders", urlPatterns = {"/get_weight_orders"})
public class get_weight_orders extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // Adding CORS headers to allow cross-origin requests
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:8081"); // Allow localhost:8081
        resp.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        resp.setHeader("Access-Control-Allow-Credentials", "true"); // Optional, if credentials like cookies are involved

        // Create Gson object for JSON conversion
        Gson gson = new Gson();

        // Open Hibernate session for database interaction
        Session session = HibernateUtil.getSessionFactory().openSession();

        try {
            session.beginTransaction();

            // Create Criteria to query and aggregate the Save_weights table
            Criteria criteria = session.createCriteria(Save_weights.class);
            criteria.addOrder(Order.desc("timestamp")); // Order by timestamp descending

            // Fetch the list of Save_weights
            List<Save_weights> saveWeightsList = criteria.list();

            // Map to aggregate data by order ID
            Map<String, Map<String, Object>> aggregatedData = new HashMap<>();

            for (Save_weights saveWeight : saveWeightsList) {
                String orderId = saveWeight.getOrderId(); // Order ID as the key
                String date = saveWeight.getTimestamp().toString().split(" ")[0]; // Extract the date part

                // Create a DecimalFormat instance to format numbers to 2 decimal points
                DecimalFormat decimalFormat = new DecimalFormat("#.##");

                if (!aggregatedData.containsKey(orderId)) {
                    // Initialize a new entry for this order
                    Map<String, Object> orderData = new HashMap<>();
                    orderData.put("orderId", orderId);
                    orderData.put("date", date);

                    // Format the weight value to 2 decimal points
                    double formattedWeight = Double.parseDouble(decimalFormat.format(saveWeight.getWeightValue()));
                    orderData.put("totalWeight", formattedWeight);

                    aggregatedData.put(orderId, orderData);
                } else {
                    // Update the total weight for the existing order
                    Map<String, Object> orderData = aggregatedData.get(orderId);

                    // Get the current total weight and format the sum to 2 decimal points
                    Number currentTotalWeight = (Number) orderData.get("totalWeight");
                    double updatedWeight = currentTotalWeight.doubleValue() + saveWeight.getWeightValue();
                    double formattedWeight = Double.parseDouble(decimalFormat.format(updatedWeight));
                    orderData.put("totalWeight", formattedWeight);
                }
            }

            // Convert the aggregated data into a list
            List<Map<String, Object>> orders = new ArrayList<>(aggregatedData.values());

            // Convert the list to JSON
            // String jsonResponse = gson.toJson(Map.of("orders", orders));
            // Write the JSON response
            //resp.getWriter().write(jsonResponse);
            resp.setContentType("application/json");
            System.out.println("content type set");

            resp.getWriter().write(gson.toJson(orders));
            System.out.println("response sent");

        } catch (Exception e) {
            // Handle any errors during the database query
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        } finally {
            // Close the session
            session.close();
        }

    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // CORS preflight request handling (for HTTP OPTIONS method)
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:8081");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK); // Respond with OK for OPTIONS request
    }
}
