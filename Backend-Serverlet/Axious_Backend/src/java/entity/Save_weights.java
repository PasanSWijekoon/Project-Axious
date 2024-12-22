/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package entity;

import java.io.Serializable;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

/**
 *
 * @author pasan
 */


@Entity
@Table(name = "save_weights")
public class Save_weights implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Column(name = "weight_value", nullable = false)
    private float weightValue;

    @Column(name = "timestamp", nullable = false)
    private Date timestamp;

    @ManyToOne
    @JoinColumn(name = "employees_empid", nullable = false)
    private Employees employees;
    
    @Column(name = "order_id", length = 45, nullable = false)
    private String orderId;
    
    @ManyToOne
    @JoinColumn(name = "Supervisor_id", nullable = false)
    private Supervisor supervisor;

    public Save_weights() {
    }
    
    

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public float getWeightValue() {
        return weightValue;
    }

    public void setWeightValue(float weightValue) {
        this.weightValue = weightValue;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public Employees getEmployee() {
        return employees;
    }

    public void setEmployee(Employees employees) {
        this.employees = employees;
    }

    /**
     * @return the orderId
     */
    public String getOrderId() {
        return orderId;
    }

    /**
     * @param orderId the orderId to set
     */
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    /**
     * @return the supervisor
     */
    public Supervisor getSupervisor() {
        return supervisor;
    }

    /**
     * @param supervisor the supervisor to set
     */
    public void setSupervisor(Supervisor supervisor) {
        this.supervisor = supervisor;
    }
}
