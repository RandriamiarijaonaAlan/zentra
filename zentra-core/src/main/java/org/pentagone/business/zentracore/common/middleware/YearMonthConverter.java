package org.pentagone.business.zentracore.common.middleware;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Converter(autoApply = true)
public class YearMonthConverter implements AttributeConverter<YearMonth, String> {

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

    @Override
    public String convertToDatabaseColumn(YearMonth attribute) {
        return attribute != null ? attribute.format(formatter) : null;
    }

    @Override
    public YearMonth convertToEntityAttribute(String dbData) {
        if (dbData == null) return null;
        // yyyy-MM-dd
        if (dbData.length() == 10) dbData = dbData.substring(0, 7); // on garde "yyyy-MM"
        return YearMonth.parse(dbData, formatter);
    }
}
