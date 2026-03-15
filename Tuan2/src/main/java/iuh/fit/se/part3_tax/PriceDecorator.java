package iuh.fit.se.part3_tax;

public abstract class PriceDecorator implements PriceCalculator {
    protected PriceCalculator calculator;
    public PriceDecorator(PriceCalculator c) { this.calculator = c; }
}
