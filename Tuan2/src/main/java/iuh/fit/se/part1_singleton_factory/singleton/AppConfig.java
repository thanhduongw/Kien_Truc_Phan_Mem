package iuh.fit.se.part1_singleton_factory.singleton;

public class AppConfig {
    private static AppConfig instance;
    private String appName;
    private String version;

    private AppConfig() {
        this.appName = "MyShop";
        this.version = "1.0.0";
    }

    public static AppConfig getInstance() {
        if (instance == null) {
            instance = new AppConfig();
        }
        return instance;
    }

    public String getAppName() { return appName; }
    public String getVersion() { return version; }
}
