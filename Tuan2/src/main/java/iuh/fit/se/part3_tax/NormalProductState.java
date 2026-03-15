package iuh.fit.se.part3_tax;

public class NormalProductState implements ProductState {
    public String getCategory() { return "Thông thường"; }
    public void display() { System.out.println("[State] Sản phẩm thông thường"); }
}