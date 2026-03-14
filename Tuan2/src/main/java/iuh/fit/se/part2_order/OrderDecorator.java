package iuh.fit.se.part2_order;

public abstract class OrderDecorator implements OrderProcessor {
    protected OrderProcessor wrapped;
    public OrderDecorator(OrderProcessor processor) {
        this.wrapped = processor;
    }
    public void process(Order order) {
        wrapped.process(order);
    }
}
