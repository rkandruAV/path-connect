-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "calendar_event_id" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "google_calendar_email" TEXT,
ADD COLUMN     "google_refresh_token" TEXT;
