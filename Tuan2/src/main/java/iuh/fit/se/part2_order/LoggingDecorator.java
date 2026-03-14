package iuh.fit.se.part2_order;

public class LoggingDecorator extends OrderDecorator {
    public LoggingDecorator(OrderProcessor processor) {
        super(processor);
    }
    public void process(Order order) {
        System.out.println("[Log] Bắt đầu xử lý đơn #" + order.getId()
                + " - Trạng thái: " + order.getState().getStateName());
        super.process(order);
        System.out.println("[Log] Hoàn tất - Trạng thái: " + order.getState().getStateName());
    }
}