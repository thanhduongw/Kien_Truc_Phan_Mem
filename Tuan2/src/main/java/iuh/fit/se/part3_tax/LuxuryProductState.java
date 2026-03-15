package iuh.fit.se.part3_tax;

public class LuxuryProductState implements ProductState {
    public String getCategory() { return "Xa xỉ"; }
    public void display() { System.out.println("[State] Sản phẩm xa xỉ — áp dụng thuế đặc biệt"); }
}