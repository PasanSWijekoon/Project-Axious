/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.Employees;
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
import model.Validations;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.Transaction;
import org.hibernate.criterion.Restrictions;

/**
 *
 * @author pasan
 */
@MultipartConfig
@WebServlet(name = "create_employee", urlPatterns = {"/create_employee"})
public class create_employee extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("Success", false); // Default response is failure

        JsonObject jsonobject1 = gson.fromJson(req.getReader(), JsonObject.class);

        String id = jsonobject1.get("supervisorId").getAsString();
        String f_name = jsonobject1.get("f_name").getAsString();
        String l_name = jsonobject1.get("l_name").getAsString();
        String mobile = jsonobject1.get("mobile").getAsString();
        String nic = jsonobject1.get("nic").getAsString();

        if (f_name.isEmpty()) {
            responseJson.addProperty("message", "Please Enter First Name");
        } else if (l_name.isEmpty()) {
            responseJson.addProperty("message", "Please Enter Last Name");
        } else if (mobile.isEmpty()) {
            responseJson.addProperty("message", "Please Enter Mobile No");
        } else if (!Validations.isMobileNumberValid(mobile)) {
            responseJson.addProperty("message", "Invalid Mobile");
        } else if (nic.isEmpty()) {
            responseJson.addProperty("message", "Please Enter Your NIC");
        } else if (!Validations.isNICValid(nic)) {
            responseJson.addProperty("message", "Invalid NIC");
        } else {

            // Start a new Hibernate session
            Session session = HibernateUtil.getSessionFactory().openSession();

            // Check if the mobile number is already registered
            Criteria criteria1 = session.createCriteria(Employees.class);
            criteria1.add(Restrictions.eq("mobile", mobile));

            if (!criteria1.list().isEmpty()) {
                // If mobile number is already used, return an error message
                responseJson.addProperty("message", "Mobile Number Already Used");
            } else {

                // Check if the NIC is already registered
                Criteria criteria2 = session.createCriteria(Employees.class);
                criteria2.add(Restrictions.eq("nic", nic));

                if (!criteria2.list().isEmpty()) {
                    // If mobile number is already used, return an error message
                    responseJson.addProperty("message", "NIC Already Used");
                } else {

                    Transaction transaction = null;

                    try {

                        transaction = session.beginTransaction();

                        Supervisor supervisor = (Supervisor) session.get(Supervisor.class, Integer.parseInt(id));

                        // Create a new User object and populate it with form data
                        Employees employees = new Employees();
                        employees.setFirstName(f_name);
                        employees.setLastName(l_name);
                        employees.setMobile(mobile);
                        employees.setNic(nic);
                        employees.setRegisteredDate(new Date()); // Set the registration date
                        employees.setSupervisor(supervisor);

                        session.save(employees);
                        transaction.commit();
                        responseJson.addProperty("Success", true);
                        responseJson.addProperty("message", "Employee created successfully");

                    } catch (Exception e) {

                        if (transaction != null) {
                            transaction.rollback();  // Rollback if there is an error
                        }

                        responseJson.addProperty("Success", false);

                    } finally {
                        // Close the session
                        session.close();
                    }

                }

            }

        }

        // Set response content type to JSON and return the response
        resp.setContentType("application/json");
        resp.getWriter().write(gson.toJson(responseJson)); // Send the response JSON

    }
}
