package org.pentagone.business.zentracore.common.middleware;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

public class YearMonthDeserializerWithDay extends JsonDeserializer<YearMonth> {
    @Override
    public YearMonth deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value.length() == 10) { // yyyy-MM-dd
            value = value.substring(0, 7); // on garde "yyyy-MM"
        }
        return YearMonth.parse(value, DateTimeFormatter.ofPattern("yyyy-MM"));
    }
}
