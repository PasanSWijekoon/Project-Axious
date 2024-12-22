/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import entity.Weights;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;
import javax.servlet.ServletException;
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
@WebServlet(name = "store_weight", urlPatterns = {"/store_weight"})
public class store_weight extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject responseJson = new JsonObject();
        responseJson.addProperty("Success", false); // Default response is failure
        String weightStr = req.getParameter("weight");

        Session session = HibernateUtil.getSessionFactory().openSession();

        Weights weights = new Weights();
        weights.setWeightValue(Float.parseFloat(weightStr));
        weights.setTimestamp(new Date());

        Transaction transaction = null;
        try {

            transaction = session.beginTransaction();
            session.save(weights);
            transaction.commit();
            responseJson.addProperty("Success", true);

        } catch (Exception e) {
            
            if (transaction != null) {
                transaction.rollback();  // Rollback if there is an error
            }
            
            responseJson.addProperty("Success", false);

        } finally {
            // Close the session
            session.close();
        }

        // Set response content type to JSON and return the response
        resp.setContentType("application/json");
        resp.getWriter().write(gson.toJson(responseJson)); // Send the response JSON

    }

}
