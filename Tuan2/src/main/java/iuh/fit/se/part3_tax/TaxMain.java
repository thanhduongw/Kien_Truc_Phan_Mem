package iuh.fit.se.part3_tax;

public class TaxMain {
    public static void main(String[] args) {
        System.out.println("===== TÍNH THUẾ SẢN PHẨM =====\n");

        // Điện thoại xa xỉ
        Product phone = new Product("iPhone 16 Pro", 30_000_000,
                new LuxuryProductState(),
                new LuxuryTax());
        phone.displayInfo();

        PriceCalculator calc = new ImportFeeDecorator(
                new BasicPriceCalculator(), 0.05);
        System.out.printf("=> Tổng sau nhập khẩu: %,.0fđ%n%n", calc.getTotal(phone));

        // Rau củ thiết yếu
        Product vegetable = new Product("Rau cải", 20_000,
                new EssentialProductState(),
                new ZeroTax());
        vegetable.displayInfo();
        System.out.printf("=> Tổng: %,.0fđ%n%n", new BasicPriceCalculator().getTotal(vegetable));

        // Laptop thông thường với giảm giá
        Product laptop = new Product("Dell Inspiron", 15_000_000,
                new NormalProductState(),
                new VATTax());
        laptop.displayInfo();
        PriceCalculator calc2 = new DiscountDecorator(new BasicPriceCalculator(), 0.10);
        System.out.printf("=> Tổng sau giảm giá: %,.0fđ%n", calc2.getTotal(laptop));
    }
}
