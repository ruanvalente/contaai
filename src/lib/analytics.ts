import { useAuthStore } from "@/shared/storage/use-auth-store";

type AnalyticsEvent = {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
};

type PageViewEvent = {
  page: string;
  userType: "anonymous" | "authenticated";
  userId?: string;
};

type ReadingStartEvent = {
  bookId: string;
  bookTitle: string;
  userType: "anonymous" | "authenticated";
};

type AuthRedirectEvent = {
  destination: string;
  originalPage: string;
};

type LazyAuthConversionEvent = {
  action: "follow" | "rate" | "favorite";
  bookId?: string;
  authorName?: string;
};

type ReaderToAuthorEvent = {
  userId: string;
  previousRole: string;
  newRole: string;
};

function isConsoleEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";
}

function logEvent(event: AnalyticsEvent): void {
  if (!isConsoleEnabled()) return;

  console.log(`[Analytics] ${event.event}`, {
    timestamp: event.timestamp || Date.now(),
    ...event.properties,
  });
}

export function trackPageView(data: PageViewEvent): void {
  const eventName = data.userType === "anonymous" ? "page_view_anon" : "page_view";
  
  logEvent({
    event: eventName,
    properties: {
      page: data.page,
      userId: data.userId,
    },
  });

  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    sendToAnalyticsAPI({
      event: eventName,
      properties: data,
    });
  }
}

export function trackReadingStart(data: ReadingStartEvent): void {
  const eventName = data.userType === "anonymous" ? "reading_start_anon" : "reading_start";

  logEvent({
    event: eventName,
    properties: {
      bookId: data.bookId,
      bookTitle: data.bookTitle,
    },
  });

  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    sendToAnalyticsAPI({
      event: eventName,
      properties: data,
    });
  }
}

export function trackAuthRedirect(data: AuthRedirectEvent): void {
  logEvent({
    event: "auth_redirect_triggered",
    properties: data,
  });

  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    sendToAnalyticsAPI({
      event: "auth_redirect_triggered",
      properties: data,
    });
  }
}

export function trackLazyAuthConversion(data: LazyAuthConversionEvent): void {
  logEvent({
    event: "lazy_auth_converted",
    properties: data,
  });

  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    sendToAnalyticsAPI({
      event: "lazy_auth_converted",
      properties: data,
    });
  }
}

export function trackReaderToAuthor(data: ReaderToAuthorEvent): void {
  logEvent({
    event: "reader_to_author",
    properties: data,
  });

  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    sendToAnalyticsAPI({
      event: "reader_to_author",
      properties: data,
    });
  }
}

async function sendToAnalyticsAPI(data: AnalyticsEvent): Promise<void> {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      console.error("[Analytics] Failed to send event:", response.status);
    }
  } catch (error) {
    console.error("[Analytics] Error sending event:", error);
  }
}

export function useAnalytics() {
  const { user } = useAuthStore();

  return {
    trackPageView: (page: string) =>
      trackPageView({
        page,
        userType: user ? "authenticated" : "anonymous",
        userId: user?.id,
      }),

    trackReadingStart: (bookId: string, bookTitle: string) =>
      trackReadingStart({
        bookId,
        bookTitle,
        userType: user ? "authenticated" : "anonymous",
      }),

    trackAuthRedirect: (destination: string, originalPage: string) =>
      trackAuthRedirect({ destination, originalPage }),

    trackLazyAuthConversion: (action: "follow" | "rate" | "favorite", bookId?: string, authorName?: string) =>
      trackLazyAuthConversion({ action, bookId, authorName }),

    trackReaderToAuthor: (userId: string, previousRole: string, newRole: string) =>
      trackReaderToAuthor({ userId, previousRole, newRole }),
  };
}

export const analytics = {
  trackPageView,
  trackReadingStart,
  trackAuthRedirect,
  trackLazyAuthConversion,
  trackReaderToAuthor,
};