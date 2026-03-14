package iuh.fit.se.part1_singleton_factory.factory;

import iuh.fit.se.part1_singleton_factory.singleton.AppConfig;

public class Main {
    public static void main(String[] args) {
        AppConfig appConfig = AppConfig.getInstance();
        System.out.println("App: "+ appConfig.getAppName());
        Notification n1 = NotificationFactory.create("email");
        n1.send("Hello");
        Notification n2 = NotificationFactory.create("sms");
        n2.send("Hi");
    }
}
