package iuh.fit.se.part1_singleton_factory.factory;

public class NotificationFactory {
    public static Notification create(String type){
        return switch (type.toLowerCase()) {
            case "email" -> new EmailNotification();
            case "sms" -> new SMSNotification();
            default -> null;
        };
    }
}
