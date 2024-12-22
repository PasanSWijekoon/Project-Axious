/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.Employees;
import entity.Supervisor;
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
@WebServlet(name = "get_employees", urlPatterns = {"/get_employees"})
public class get_employees extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        // Adding CORS headers to allow cross-origin requests
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:8081"); // Allow localhost:8081
        resp.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        resp.setHeader("Access-Control-Allow-Credentials", "true"); // Optional, if credentials like cookies are involved

        // Create Gson object for JSON conversion
        Gson gson = new Gson();
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("success", false);

        // Open Hibernate session for database interaction
        Session session = HibernateUtil.getSessionFactory().openSession();

        try {
            session.beginTransaction();

            // Create Criteria to query Weight class
            Criteria criteria = session.createCriteria(Employees.class);

            // Execute the query and fetch the result
            List<Employees> employees = criteria.list();

            // Check if employees were found
            if (!employees.isEmpty()) {

                // Iterate over the employees and modify the supervisor's data (remove password)
                for (Employees employee : employees) {
                    Supervisor supervisor = employee.getSupervisor();

                    if (supervisor != null) {
                        // Create a new Supervisor object with no password
                        Supervisor filteredSupervisor = new Supervisor();
                        filteredSupervisor.setId(supervisor.getId());
                        // Replace the original supervisor with the filtered one
                        employee.setSupervisor(filteredSupervisor);
                    }
                }
            }
            
            jsonObject.addProperty("success", true);
            
            jsonObject.add("employees", gson.toJsonTree(employees));

            resp.setContentType("application/json");
            System.out.println("content type set");

            resp.getWriter().write(gson.toJson(jsonObject));
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
