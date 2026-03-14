package iuh.fit.se.part2_order;

public class BasicOrderProcessor implements OrderProcessor {
    public void process(Order order) {
        order.nextStep();
    }
}
