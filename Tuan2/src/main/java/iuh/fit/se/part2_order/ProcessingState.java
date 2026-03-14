package iuh.fit.se.part2_order;

public class ProcessingState implements OrderState{
    @Override
    public void handle(Order order) {
        System.out.println("[State] Đóng gói và vận chuyển đơn #" + order.getId());
        order.getShippingStrategy().ship(order);
        order.setState(new DeliveredState());
    }

    @Override
    public String getStateName() {
        return "Đang xử lý";
    }
}
