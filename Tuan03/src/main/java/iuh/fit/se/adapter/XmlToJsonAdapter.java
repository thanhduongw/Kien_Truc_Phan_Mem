package iuh.fit.se.adapter;

public class XmlToJsonAdapter implements JsonService{
    private XmlSystem xmlSystem;

    public XmlToJsonAdapter(XmlSystem xmlSystem) {
        this.xmlSystem = xmlSystem;
    }

    @Override
    public String getData() {
        String xml = xmlSystem.getXmlData();
        String json = xmlToJson(xml);
        System.out.println("[Adapter] Converted XML → JSON: " + json);
        return json;
    }

    @Override
    public void setData(String json) {
        String xml = jsonToXml(json);
        System.out.println("[Adapter] Converted JSON → XML: " + xml);
        xmlSystem.setXmlData(xml);
    }

    private String xmlToJson(String xml) {
        // Đơn giản hóa: thay tag thành JSON key-value
        return xml.replaceAll("<(\\w+)>", "\"$1\": \"")
                .replaceAll("</(\\w+)>", "\",")
                .replaceAll(",\\s*}", "}");
    }

    private String jsonToXml(String json) {
        // Đơn giản hóa cho demo
        return "<data>" + json.replace("{", "").replace("}", "")
                .replaceAll("\"(\\w+)\":\\s*\"([^\"]+)\"", "<$1>$2</$1>")
                + "</data>";
    }
}
