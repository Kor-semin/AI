import { NextResponse } from "next/server";

export const runtime = "nodejs";

function configured(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

function collectionName(key: string): string {
  return process.env[key]?.trim() || "betaSignups";
}

export async function GET(): Promise<NextResponse> {
  const publicFirebaseConfigured =
    configured("NEXT_PUBLIC_FIREBASE_API_KEY") &&
    configured("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN") &&
    configured("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
    configured("NEXT_PUBLIC_FIREBASE_APP_ID");
  const signupCollectionName = collectionName("NEXT_PUBLIC_BETA_SIGNUP_FIRESTORE_COLLECTION");
  const approvalCollectionName = collectionName("BETA_APPROVAL_FIRESTORE_COLLECTION");
  const adminEmailsConfigured = configured("BETA_APPROVAL_ADMIN_EMAILS");
  const serviceAccountConfigured = configured("FIREBASE_SERVICE_ACCOUNT_JSON");

  return NextResponse.json(
    {
      ok: true,
      status: {
        publicFirebaseConfigured,
        projectIdConfigured: configured("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
        signupCollectionConfigured: configured("NEXT_PUBLIC_BETA_SIGNUP_FIRESTORE_COLLECTION"),
        adminEmailsConfigured,
        serviceAccountConfigured,
        approvalCollectionConfigured: configured("BETA_APPROVAL_FIRESTORE_COLLECTION"),
        signupCollectionName,
        approvalCollectionName,
        collectionsMatch: signupCollectionName === approvalCollectionName,
        targetCollectionName: approvalCollectionName,
        adminVerificationAvailable:
          publicFirebaseConfigured &&
          adminEmailsConfigured &&
          configured("NEXT_PUBLIC_FIREBASE_API_KEY"),
        firestoreServerReadAvailable:
          serviceAccountConfigured &&
          configured("NEXT_PUBLIC_FIREBASE_PROJECT_ID") &&
          configured("BETA_APPROVAL_FIRESTORE_COLLECTION"),
      },
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
