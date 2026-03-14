package iuh.fit.se.part2_order;

public class CancelledState implements OrderState {
    public void handle(Order order) {
        System.out.println("[State] Hủy đơn #" + order.getId() + " và hoàn tiền!");
    }
    public String getStateName() { return "Đã hủy"; }
}
