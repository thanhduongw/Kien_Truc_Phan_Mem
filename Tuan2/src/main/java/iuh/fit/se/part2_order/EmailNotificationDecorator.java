package iuh.fit.se.part2_order;

public class EmailNotificationDecorator extends OrderDecorator {
    public EmailNotificationDecorator(OrderProcessor processor) {
        super(processor);
    }
    public void process(Order order) {
        super.process(order);
        System.out.println("[Email] Gửi thông báo trạng thái đơn #" + order.getId());
    }
}