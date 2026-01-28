import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Agreement from "@/models/Agreement";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userEmail = searchParams.get("email");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter" },
        { status: 400 }
      );
    }

    // Build query to find agreements where user is involved by ID or Email
    const queryConditions: any[] = [
      { lenderId: userId },
      { borrowerId: userId }
    ];

    if (userEmail) {
      queryConditions.push({ lenderEmail: userEmail });
      queryConditions.push({ borrowerEmail: userEmail });
    }

    const agreements = await Agreement.find({
      $or: queryConditions,
    })
      .sort({ createdAt: -1 })
      .select("lenderId lenderName lenderEmail borrowerId borrowerName borrowerEmail borrowerPhone -_id");

    // Deduplicate based on email
    const uniqueFriendsMap = new Map();

    agreements.forEach((agreement) => {
      // Determine who the friend is (the other party)
      let friend = null;

      // Check if user is the lender (by ID or Email)
      const isLender = agreement.lenderId === userId || (userEmail && agreement.lenderEmail === userEmail);

      // Check if user is the borrower (by ID or Email)
      // Note: A user can technically be both if they lend to themselves (edge case), but usually one or the other.
      // We prioritize "isLender" check first.

      if (isLender) {
        // User is lender, friend is borrower
        if (agreement.borrowerEmail) {
          friend = {
            borrowerName: agreement.borrowerName,
            borrowerEmail: agreement.borrowerEmail,
            borrowerPhone: agreement.borrowerPhone || "",
          };
        }
      } else {
        // User is borrower, friend is lender
        if (agreement.lenderEmail) {
          friend = {
            borrowerName: agreement.lenderName,
            borrowerEmail: agreement.lenderEmail,
            borrowerPhone: "", // Lender phone is not stored in Agreement schema usually
          };
        }
      }

      // Check against user's own email to prevent showing themselves as a friend
      // (in case of self-testing or data anomalies)
      if (friend && friend.borrowerEmail !== userEmail && !uniqueFriendsMap.has(friend.borrowerEmail)) {
        uniqueFriendsMap.set(friend.borrowerEmail, friend);
      }
    });

    const recentFriends = Array.from(uniqueFriendsMap.values());

    return NextResponse.json({ friends: recentFriends }, { status: 200 });
  } catch (error: any) {
    console.error("Get Recent Friends Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent friends", details: error.message },
      { status: 500 }
    );
  }
}
