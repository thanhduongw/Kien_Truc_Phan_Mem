package iuh.fit.se.part3_tax;

public interface TaxStrategy {
    double calculate(double price);
    String getTaxName();
}
