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
import emailjs from "@emailjs/browser";
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
const PAYMENT_SCREENSHOT_UPLOAD_URL = "/api/upload_payment_screenshot.php";
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_5qwr82j";
const EMAILJS_ADMIN_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_ADMIN_TEMPLATE_ID || "template_apzhnhq";
const EMAILJS_CUSTOMER_TEMPLATE_ID =
  import.meta.env.VITE_EMAILJS_CUSTOMER_TEMPLATE_ID || "template_4uohncs";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "ksEdGRigK813l7bs7";

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
    const booking = { id: docRef.id, ...payload };

    console.log(`[Booking] Successfully saved to Firestore with ID: ${docRef.id}`);
    await sendBookingConfirmationEmails(booking);

    return booking;
  } catch (firestoreError) {
    console.error(`[Booking] Firestore write failed:`, firestoreError);
    throw new Error(
      `Failed to save booking: ${firestoreError instanceof Error ? firestoreError.message : "Unknown error"}`,
    );
  }
}

async function sendBookingConfirmationEmails(booking: BookingRecord & { id: string }) {
  if (!EMAILJS_PUBLIC_KEY) {
    console.warn("[Booking] EmailJS public key is missing; skipping confirmation emails.");
    return;
  }

  const commonParams = buildBookingEmailParams(booking);
  const failures: unknown[] = [];

  try {
    await sendAdminConfirmationEmail(commonParams);
  } catch (error) {
    failures.push(error);
  }

  if (booking.email) {
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_CUSTOMER_TEMPLATE_ID,
        {
          ...commonParams,
          email: booking.email,
          customer_email: booking.email,
          to_email: booking.email,
        },
        EMAILJS_PUBLIC_KEY,
      );
      console.log("[Booking] Customer confirmation email sent successfully.");
    } catch (error) {
      failures.push(error);
    }
  }

  if (failures.length > 0) {
    console.warn("[Booking] One or more confirmation emails failed to send.", failures);
  } else {
    console.log("[Booking] Confirmation emails sent successfully.");
  }
}

async function sendAdminConfirmationEmail(
  commonParams: ReturnType<typeof buildBookingEmailParams>,
) {
  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_ADMIN_TEMPLATE_ID,
    commonParams,
    EMAILJS_PUBLIC_KEY,
  );
  console.log("[Booking] Admin confirmation email sent successfully.");
}

function buildBookingEmailParams(booking: BookingRecord & { id: string }) {
  const serviceLines = booking.services
    .map(
      (service) => `${service.name} x${service.qty} = $${(service.price * service.qty).toFixed(2)}`,
    )
    .join("\n");

  return {
    booking_id: booking.id,
    booking_reference: booking.reference,
    reference: booking.reference,
    customer_name: booking.name,
    name: booking.name,
    customer_email: booking.email,
    email: booking.email,
    customer_phone: booking.phone,
    phone: booking.phone,
    booking_date: booking.date || "",
    booking_time: booking.time || "",
    services_summary: serviceLines,
    services_json: JSON.stringify(booking.services),
    service_count: String(booking.services.length),
    total: booking.total.toFixed(2),
    payment_reference: booking.paymentRef || "",
    notes: booking.notes || "",
    screenshot_name: booking.screenshotName || "",
    screenshot_url: booking.screenshotUrl || "",
    screenshot_path: booking.screenshotPath || "",
    status: booking.status,
    created_at: booking.createdAt,
    updated_at: booking.updatedAt,
  };
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
