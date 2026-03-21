package iuh.fit.se.adapter;

public class XmlSystem {
    private String xmlData;

    public String getXmlData() {
        return xmlData != null ? xmlData : "<data><value>Hello</value></data>";
    }

    public void setXmlData(String xml) {
        this.xmlData = xml;
        System.out.println("[XmlSystem] Stored XML: " + xml);
    }
}
