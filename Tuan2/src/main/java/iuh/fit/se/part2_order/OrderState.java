package iuh.fit.se.part2_order;

public interface OrderState {
    void handle(Order order);
    String getStateName();
}
