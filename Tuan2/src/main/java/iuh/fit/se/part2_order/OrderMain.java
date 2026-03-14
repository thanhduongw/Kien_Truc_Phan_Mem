package iuh.fit.se.part2_order;

public class OrderMain {
    public static void main(String[] args) {
        System.out.println("===== DEMO ĐƠN HÀNG =====\n");

        // Tạo đơn với giao hàng nhanh
        Order order1 = new Order("DH001", new ExpressShipping());

        // Bọc processor bằng Decorator
        OrderProcessor processor = new EmailNotificationDecorator(
                new LoggingDecorator(
                        new BasicOrderProcessor()));

        processor.process(order1); // Mới → Đang xử lý
        System.out.println();
        processor.process(order1); // Đang xử lý → Đã giao
        System.out.println();

        // Test hủy đơn
        Order order2 = new Order("DH002", new StandardShipping());
        order2.cancel();
    }
}