/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import entity.Weights;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Order;

/**
 *
 * @author pasan
 */
@WebServlet(name = "get_weight", urlPatterns = {"/get_weight"})
public class get_weight extends HttpServlet {

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

            // Create Criteria to query Weight class
            Criteria criteria = session.createCriteria(Weights.class);
            criteria.addOrder(Order.desc("timestamp"));  // Order by timestamp in descending order
            criteria.setMaxResults(1);  // Limit to the latest record

            // Execute the query and fetch the result
            List<Weights> weights = criteria.list();

            // Check if any weight was found
            if (!weights.isEmpty()) {
                Weights latestWeight = weights.get(0); // Get the first (latest) weight

                resp.setContentType("application/json");
                System.out.println("content type set");

                resp.getWriter().write(gson.toJson(latestWeight));
                System.out.println("response sent");

            }
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

