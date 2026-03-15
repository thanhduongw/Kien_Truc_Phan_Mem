package iuh.fit.se.part3_tax;

public class ExciseTax implements TaxStrategy {
    public double calculate(double price) { return price * 0.05; }
    public String getTaxName() { return "Tiêu thụ đặc biệt 5%"; }
}