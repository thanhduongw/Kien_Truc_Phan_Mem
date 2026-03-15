package iuh.fit.se.part3_tax;

public class BasicPriceCalculator implements PriceCalculator {
    public double getTotal(Product product) { return product.getFinalPrice(); }
}