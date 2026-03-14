package iuh.fit.se.part2_order;

public class Order {
    private String id;
    private OrderState state;
    private ShippingStrategy shippingStrategy;

    public Order(String id, ShippingStrategy strategy) {
        this.id = id;
        this.state = new NewOrderState();  // Bắt đầu ở trạng thái Mới
        this.shippingStrategy = strategy;
        System.out.println("Tạo đơn hàng #" + id + " | Trạng thái: " + state.getStateName());
    }

    public void nextStep() {
        state.handle(this);
    }

    public void cancel() {
        System.out.println("[Action] Hủy đơn hàng #" + id);
        state = new CancelledState();
        state.handle(this);
    }

    public void setState(OrderState state) { this.state = state; }
    public OrderState getState() { return state; }
    public String getId() { return id; }
    public ShippingStrategy getShippingStrategy() { return shippingStrategy; }
}

