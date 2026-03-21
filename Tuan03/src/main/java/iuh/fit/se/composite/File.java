package iuh.fit.se.composite;

public class File implements FileSystemComponent{
    private String name;

    public File(String name) {
        this.name = name;
    }

    @Override
    public void display(int indent) {
        System.out.println(" ".repeat(indent) + "📄 " + name);
    }
}
