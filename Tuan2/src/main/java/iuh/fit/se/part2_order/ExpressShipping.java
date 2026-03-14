package iuh.fit.se.part2_order;

public class ExpressShipping implements ShippingStrategy {
    public void ship(Order order) {
        System.out.println("[Strategy] Giao hàng nhanh (1 ngày) - phí: 30,000đ");
    }
}
