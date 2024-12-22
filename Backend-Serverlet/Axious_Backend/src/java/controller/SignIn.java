/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject; 
import entity.Supervisor;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.HibernateUtil;
import org.hibernate.Session;
import model.Validations;
import org.hibernate.Criteria;
import org.hibernate.criterion.Restrictions;

@WebServlet(name = "SignIn", urlPatterns = {"/SignIn"})
public class SignIn extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        // Adding CORS headers to allow cross-origin requests
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:8081"); // Allow localhost:8081
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Allow-Credentials", "true"); // Optional, if credentials like cookies are involved

        Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("success", false);

        JsonObject requestJson = gson.fromJson(request.getReader(), JsonObject.class);
        String mobile = requestJson.get("mobile").getAsString();
        String password = requestJson.get("password").getAsString();

        if (mobile.isEmpty()) {
            responseJson.addProperty("message", "Please Enter Your Mobile Number");
        } else if (!Validations.isMobileNumberValid(mobile)) {
            responseJson.addProperty("message", "Invalid Mobile");
        } else if (password.isEmpty()) {
            responseJson.addProperty("message", "Please Enter Your Password");
        } else if (!Validations.isPasswordValid(password)) {
            responseJson.addProperty("message", "Invalid Password");
        } else {

            Session session = HibernateUtil.getSessionFactory().openSession();

            Criteria criteria1 = session.createCriteria(Supervisor.class);
            criteria1.add(Restrictions.eq("mobile", mobile));
            criteria1.add(Restrictions.eq("password", password));

            if (!criteria1.list().isEmpty()) {

                Supervisor supervisor = (Supervisor) criteria1.uniqueResult();

                responseJson.add("user", gson.toJsonTree(supervisor));
                responseJson.addProperty("success", true);
                responseJson.addProperty("message", "Sign In Success");

            } else {
                responseJson.addProperty("message", "Invalid Details");
            }

            session.close();
        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseJson));
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
