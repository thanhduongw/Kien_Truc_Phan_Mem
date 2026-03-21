package iuh.fit.se.adapter;

public class Main {
    public static void main(String[] args) {
        XmlSystem legacySystem = new XmlSystem();
        JsonService adapter = new XmlToJsonAdapter(legacySystem);
        WebClient client = new WebClient(adapter);

        System.out.println("=== Fetch data ===");
        client.fetchAndPrint();

        System.out.println("\n=== Send data ===");
        client.sendData("{\"name\": \"Java\", \"version\": \"21\"}");
    }
}
