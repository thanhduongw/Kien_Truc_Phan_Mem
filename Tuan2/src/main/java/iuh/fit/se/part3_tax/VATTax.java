package iuh.fit.se.part3_tax;

public class VATTax implements TaxStrategy {
    public double calculate(double price) { return price * 0.10; }
    public String getTaxName() { return "VAT 10%"; }
}

