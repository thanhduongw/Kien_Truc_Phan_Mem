package iuh.fit.se.adapter;

public class WebClient {
    private JsonService service;

    public WebClient(JsonService service) {
        this.service = service;
    }

    public void fetchAndPrint() {
        System.out.println("[Client] Got: " + service.getData());
    }

    public void sendData(String json) {
        service.setData(json);
    }
}
