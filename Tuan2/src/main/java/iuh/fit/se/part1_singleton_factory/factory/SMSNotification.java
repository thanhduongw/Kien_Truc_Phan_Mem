package iuh.fit.se.part1_singleton_factory.factory;

public class SMSNotification implements Notification{
    @Override
    public void send(String message) {
        System.out.println("[SMS] " + message);
    }
}
