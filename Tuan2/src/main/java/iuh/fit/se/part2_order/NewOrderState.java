package iuh.fit.se.part2_order;

public class NewOrderState implements OrderState{
    @Override
    public void handle(Order order) {
        System.out.println("[State] Kiểm tra thông tin đơn hàng #" + order.getId());
        order.setState(new ProcessingState());
    }

    @Override
    public String getStateName() {
        return "Mới tạo";
    }
}
