package iuh.fit.se.part3_tax;

public class DiscountDecorator extends PriceDecorator {
    private double discountRate;
    public DiscountDecorator(PriceCalculator c, double rate) {
        super(c);
        this.discountRate = rate;
    }
    public double getTotal(Product product) {
        double base = calculator.getTotal(product);
        double discount = base * discountRate;
        System.out.printf("[Decorator] Giảm giá (%.0f%%): -%,.0fđ%n", discountRate*100, discount);
        return base - discount;
    }
}