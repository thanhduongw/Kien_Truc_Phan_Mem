package iuh.fit.se.composite;

public class Main {
    public static void main(String[] args) {
        Directory root = new Directory("root");
        Directory documents = new Directory("Documents");
        Directory pictures = new Directory("Pictures");

        documents.add(new File("resume.pdf"));
        documents.add(new File("report.docx"));

        pictures.add(new File("photo1.jpg"));
        pictures.add(new File("photo2.png"));

        root.add(documents);
        root.add(pictures);
        root.add(new File("readme.txt"));

        root.display(0);
    }
}
