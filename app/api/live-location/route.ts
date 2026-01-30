import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LiveLocation from "@/models/LiveLocation";
import Agreement from "@/models/Agreement";

export async function POST(req: NextRequest) {
    try {
        console.log("API: Live location request received. Connecting to DB...");
        await connectDB();
        console.log("API: DB Connected successfully.");

        const body = await req.json();
        console.log("API: Received live location payload:", JSON.stringify(body, null, 2));

        const { agreementId, userId, latitude, longitude, locationContext, isEmergency } = body;

        if (!agreementId || latitude === undefined || longitude === undefined) {
            console.error("API: Missing required fields");
            return NextResponse.json(
                { error: "Missing required fields (agreementId, latitude, longitude)" },
                { status: 400 }
            );
        }

        // Optional: Determine role based on agreement
        let role = "unknown";
        if (userId) { // Only try to determine role if userId is provided
            try {
                const agreement = await Agreement.findById(agreementId);
                if (agreement) {
                    if (agreement.lenderId === userId) role = "lender";
                    else if (agreement.borrowerId === userId) role = "borrower";
                    else if (agreement.witnessEmail && agreement.witnessEmail === userId) role = "witness";
                }
            } catch (err) {
                console.warn("Could not determine role from agreement", err);
            }
        }

        const liveLocation = new LiveLocation({
            agreementId,
            userId: userId || "anonymous",
            role,
            latitude,
            longitude,
            locationContext: locationContext || {},
            isEmergency: !!isEmergency,
            timestamp: new Date(),
        });

        const savedLocation = await liveLocation.save();
        console.log("API: Location saved successfully:", savedLocation._id);

        return NextResponse.json({ success: true, data: savedLocation }, { status: 201 });
    } catch (error: any) {
        console.error("API: Error saving live location:", error);
        console.error("API: Error stack:", error.stack); // Added stack trace
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
