package iuh.fit.se.part2_order;

public class StandardShipping implements ShippingStrategy{
    @Override
    public void ship(Order order) {
        System.out.println("[Strategy] Giao hàng tiêu chuẩn (3-5 ngày)");
    }
}
