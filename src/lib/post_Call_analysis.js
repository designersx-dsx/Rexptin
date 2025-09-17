export  function getBusinessSpecificFields(businessType) {
    if (businessType === "Restaurant") {
        return [
            {
                type: "boolean",
                name: "order_booked",
                description: "Set to true ONLY after the customer explicitly confirms their food order. Do not set to true until the user says 'yes', 'confirm', 'place the order', or similar confirmation. Always ask for confirmation before booking the order.",
                examples: [true, false]
            },
            {
                type: "boolean",
                name: "reservation_table_booked",
                description: "Set to true ONLY after the customer explicitly confirms their table reservation. Do not set to true until the user says 'yes', 'confirm', 'book it', or similar confirmation. Always ask for confirmation before booking the table.",
                examples: [true, false]
            },
            {
                type: "string",
                name: "reservation_table_booking_details",
                description: "Extract complete table reservation information from the conversation. Include date, time, party size, customer name, phone number, email, table preferences, seating arrangements, occasion details, and any special requests. Format as JSON object with proper string formatting for all values.",
                examples: [
                    '{"date":"01-Sept-2025","time":"2:00 PM","party_size":"2","name":"Nitish","phone":"7876121490","email":"nitishpathania12@gmail.com","table_preference":"window seat","occasion":"anniversary","special_requests":"candlelit table"}',

                    '{"date":"15-Oct-2025","time":"7:30 PM","party_size":"4","name":"John Smith","phone":"9876543210","email":"john@email.com","table_preference":"quiet area","occasion":"business dinner","seating_arrangement":"round table"}',

                    '{"date":"22-Dec-2025","time":"12:00 PM","party_size":"6","name":"Sarah Johnson","phone":"8765432109","email":"sarah.j@gmail.com","occasion":"birthday","special_requests":"birthday celebration with cake","table_preference":"private dining"}',

                    '{"date":"14-Feb-2025","time":"8:00 PM","party_size":"2","name":"Michael Brown","phone":"9988776655","email":"michael.b@email.com","table_preference":"booth","occasion":"date night","special_requests":"surprise dessert"}',

                    '{"date":"10-Nov-2025","time":"6:30 PM","party_size":"8","name":"Lisa Davis","phone":"7766554433","email":"lisa.davis@company.com","table_preference":"private dining","occasion":"celebration","seating_arrangement":"long table","special_requests":"separate checks needed"}',

                    '{"date":"25-Dec-2025","time":"1:00 PM","party_size":"12","name":"Robert Wilson","phone":"6655443322","email":"robert.w@email.com","table_preference":"outdoor patio","occasion":"family gathering","seating_arrangement":"separate tables","special_requests":"high chairs needed for 2 children"}'
                ]
            },
            {
                type: "string",
                name: "order_details",
                description: "Extract complete food order information from the conversation. Include item name, quantity, size/variant if mentioned, price if discussed, and any special instructions or modifications. Format as JSON array with objects containing required 'item' and 'qty' fields, plus optional fields.",
                examples: [
                    '[{"item":"Paneer Butter Masala","qty":2},{"item":"Pizza Margherita","qty":1}]',
                    '[{"item":"Burger","qty":1},{"item":"Coke","qty":2}]'
                ],
            }
        ];
    }

    return [];
}
export  function appointmentBooking(businessType) {
    if (businessType === "Restaurant") {
        return [];
    }
    else {
        return [
            {
                "type": "boolean",
                "name": "appointment_booked",
                "description": "Determine if appointment was successfully booked during the call",
                "examples": [true, false]
            },
            {
                "type": "string",
                "name": "appointment_date",
                "description": "Extract the exact appointment date mentioned by customer. Format: YYYY-MM-DD",
                "examples": ["2025-01-15", "2025-02-20", "2025-03-10"]
            },
            {
                "type": "string",
                "name": "appointment_time",
                "description": "Extract the exact appointment time mentioned by customer. Format: HH:MM AM/PM",
                "examples": ["10:00 AM", "2:30 PM", "9:15 AM"]
            },
            {
                "type": "string",
                "name": "appointment_timezone",
                "description": "Extract timezone if mentioned, otherwise use default. Format: America/Los_Angeles style",
                "examples": ["America/Los_Angeles", "America/New_York", "UTC"]
            },
        ]
    }

}
