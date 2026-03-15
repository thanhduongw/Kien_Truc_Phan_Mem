package iuh.fit.se.part3_tax;

public class EssentialProductState implements ProductState {
    public String getCategory() { return "Thiết yếu"; }
    public void display() { System.out.println("[State] Sản phẩm thiết yếu — miễn/giảm thuế"); }
}
