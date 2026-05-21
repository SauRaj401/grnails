import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type BookingItem = {
  id: string;
  name: string;
  qty: number;
  price: number;
};

export type BookingRecord = {
  reference: string;
  name: string;
  phone: string;
  email?: string;
  date?: string | null;
  time?: string;
  services: BookingItem[];
  total: number;
  paymentRef?: string;
  screenshotName?: string | null;
  screenshotUrl?: string | null;
  screenshotPath?: string | null;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
};

export type BookingFormData = {
  reference: string;
  name: string;
  phone: string;
  email?: string;
  date?: string | null;
  time?: string;
  services: BookingItem[];
  total: number;
  paymentRef?: string;
  screenshot?: File | null;
  screenshotName?: string | null;
  screenshotUrl?: string | null;
  screenshotPath?: string | null;
  notes?: string;
};

export type BookingScreenshotUploadResult = {
  imageUrl: string;
  imagePath: string;
  fileName: string;
  absoluteUrl?: string;
};

type BookingScreenshotUploadResponse = BookingScreenshotUploadResult & {
  success?: boolean;
  error?: string;
};

const BOOKINGS_COLLECTION = "bookings";
const PAYMENT_SCREENSHOT_UPLOAD_URL =
  import.meta.env.VITE_PAYMENT_SCREENSHOT_UPLOAD_URL || "/api/upload_payment_screenshot.php";

export function listenToBookings(
  onChange: (bookings: Array<BookingRecord & { id: string }>) => void,
) {
  const bookingQuery = query(
    collection(firestoreDb, BOOKINGS_COLLECTION),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(bookingQuery, (snapshot) => {
    onChange(snapshot.docs.map((entry) => ({ id: entry.id, ...(entry.data() as BookingRecord) })));
  });
}

export async function uploadPaymentScreenshot(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(PAYMENT_SCREENSHOT_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const responseText = await response.text();
  let result: Partial<BookingScreenshotUploadResponse> = {};

  try {
    result = JSON.parse(responseText) as Partial<BookingScreenshotUploadResponse>;
  } catch {
    const preview = responseText.slice(0, 180).replace(/\s+/g, " ");
    throw new Error(
      `Upload endpoint returned a non-JSON response from ${PAYMENT_SCREENSHOT_UPLOAD_URL}. ` +
        `This usually means the request is hitting the Vite server instead of your PHP backend. ` +
        `Response preview: ${preview || "<empty>"}`,
    );
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.error || `Screenshot upload failed with status ${response.status}.`);
  }

  if (!result.imageUrl) {
    throw new Error("Upload endpoint did not return an image URL.");
  }

  return {
    imageUrl: result.imageUrl,
    imagePath: result.imagePath || result.imageUrl,
    fileName: result.fileName || file.name,
    absoluteUrl: result.absoluteUrl,
  } satisfies BookingScreenshotUploadResult;
}

export async function createBooking(data: BookingFormData) {
  // Validation
  if (!data.reference || !data.name || !data.phone || !data.services?.length) {
    throw new Error("Missing required booking fields: reference, name, phone, or services.");
  }
  if (data.total <= 0) {
    throw new Error("Booking total must be greater than zero.");
  }
  if (data.screenshot && !data.screenshotUrl) {
    throw new Error("Screenshot upload is required before saving the booking.");
  }

  const createdAt = new Date().toISOString();
  const screenshotUrl = data.screenshotUrl ?? null;
  const screenshotPath = data.screenshotPath ?? null;
  const screenshotName = data.screenshotName ?? data.screenshot?.name ?? null;

  console.log(`[Booking] Starting creation for ref: ${data.reference}`);
  if (screenshotUrl) {
    console.log(`[Booking] Screenshot linked: ${screenshotUrl}`);
  }

  const payload: BookingRecord = {
    reference: data.reference,
    name: data.name,
    phone: data.phone,
    email: data.email || "",
    date: data.date ?? null,
    time: data.time || "",
    services: data.services,
    total: data.total,
    paymentRef: data.paymentRef || "",
    screenshotName,
    screenshotUrl,
    screenshotPath,
    notes: data.notes || "",
    status: "pending",
    createdAt,
    updatedAt: createdAt,
  };

  try {
    console.log(`[Booking] Writing to Firestore:`, payload);
    const docRef = await addDoc(collection(firestoreDb, BOOKINGS_COLLECTION), payload);
    console.log(`[Booking] Successfully saved to Firestore with ID: ${docRef.id}`);
    return { id: docRef.id, ...payload };
  } catch (firestoreError) {
    console.error(`[Booking] Firestore write failed:`, firestoreError);
    throw new Error(
      `Failed to save booking: ${firestoreError instanceof Error ? firestoreError.message : "Unknown error"}`,
    );
  }
}

export async function updateBooking(id: string, patch: Partial<BookingRecord>) {
  await updateDoc(doc(firestoreDb, BOOKINGS_COLLECTION, id), {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function removeBooking(id: string) {
  await deleteDoc(doc(firestoreDb, BOOKINGS_COLLECTION, id));
}

export function isBookingStatus(value: string): value is BookingStatus {
  return (
    value === "pending" || value === "confirmed" || value === "completed" || value === "cancelled"
  );
}

export function formatBookingCount(count: number) {
  return `${count} ${count === 1 ? "booking" : "bookings"}`;
}

export { type Unsubscribe } from "firebase/firestore";
