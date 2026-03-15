package iuh.fit.se.part3_tax;

public class ImportFeeDecorator extends PriceDecorator {
    private double feeRate;
    public ImportFeeDecorator(PriceCalculator c, double rate) {
        super(c);
        this.feeRate = rate;
    }
    public double getTotal(Product product) {
        double base = calculator.getTotal(product);
        double fee = base * feeRate;
        System.out.printf("[Decorator] Phí nhập khẩu (%.0f%%): %,.0fđ%n", feeRate*100, fee);
        return base + fee;
    }
}
