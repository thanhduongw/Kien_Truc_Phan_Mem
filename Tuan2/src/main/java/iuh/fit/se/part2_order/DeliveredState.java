package iuh.fit.se.part2_order;

public class DeliveredState implements OrderState {
    public void handle(Order order) {
        System.out.println("[State] Đơn #" + order.getId() + " đã giao thành công!");
    }
    public String getStateName() { return "Đã giao"; }
}