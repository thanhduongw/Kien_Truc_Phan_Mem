package iuh.fit.se.part3_tax;

public class Product {
    private String name;
    private double price;
    private ProductState state;
    private TaxStrategy taxStrategy;

    public Product(String name, double price, ProductState state, TaxStrategy taxStrategy) {
        this.name = name;
        this.price = price;
        this.state = state;
        this.taxStrategy = taxStrategy;
    }

    public double getTax(){
        return taxStrategy.calculate(price);
    }

    public double getFinalPrice(){
        return price + getTax();
    }

    public void displayInfo(){
        state.display();
        System.out.printf("Sản phẩm: %-20s Giá gốc: %,10.0fđ%n", name, price);
        System.out.printf("%-29s %s: %,10.0fđ%n", "", taxStrategy.getTaxName(), getTax());
        System.out.printf("%-29s Thành tiền: %,10.0fđ%n", "", getFinalPrice());
    }

    public void setState(ProductState state) { this.state = state; }
    public void setTaxStrategy(TaxStrategy tax) { this.taxStrategy = tax; }

}
