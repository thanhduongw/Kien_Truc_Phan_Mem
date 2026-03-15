package iuh.fit.se.part3_tax;

public class LuxuryTax implements TaxStrategy {
    public double calculate(double price) { return price * 0.20; }
    public String getTaxName() { return "Thuế xa xỉ 20%"; }
}
