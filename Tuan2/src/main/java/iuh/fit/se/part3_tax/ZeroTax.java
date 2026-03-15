package iuh.fit.se.part3_tax;

public class ZeroTax implements TaxStrategy {
    public double calculate(double price) { return 0; }
    public String getTaxName() { return "Miễn thuế"; }
}
