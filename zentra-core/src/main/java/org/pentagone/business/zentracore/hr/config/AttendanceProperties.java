package org.pentagone.business.zentracore.hr.config;

import java.time.LocalTime;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "attendance")
public class AttendanceProperties {
    private LocalTime workdayStart = LocalTime.of(9, 0);
    private int workdayHours = 8;
    private int breakMinutes = 60;
    private int breakThresholdHours = 6;

    public LocalTime getWorkdayStart() { return workdayStart; }
    public void setWorkdayStart(LocalTime workdayStart) { this.workdayStart = workdayStart; }
    public int getWorkdayHours() { return workdayHours; }
    public void setWorkdayHours(int workdayHours) { this.workdayHours = workdayHours; }
    public int getBreakMinutes() { return breakMinutes; }
    public void setBreakMinutes(int breakMinutes) { this.breakMinutes = breakMinutes; }
    public int getBreakThresholdHours() { return breakThresholdHours; }
    public void setBreakThresholdHours(int breakThresholdHours) { this.breakThresholdHours = breakThresholdHours; }
}