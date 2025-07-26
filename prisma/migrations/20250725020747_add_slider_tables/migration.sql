-- CreateTable
CREATE TABLE "slider_clicks" (
    "id" TEXT NOT NULL,
    "sliderId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slider_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slider_views" (
    "id" TEXT NOT NULL,
    "sliderId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "viewDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slider_views_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "slider_clicks" ADD CONSTRAINT "slider_clicks_sliderId_fkey" FOREIGN KEY ("sliderId") REFERENCES "sliders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slider_clicks" ADD CONSTRAINT "slider_clicks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slider_views" ADD CONSTRAINT "slider_views_sliderId_fkey" FOREIGN KEY ("sliderId") REFERENCES "sliders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slider_views" ADD CONSTRAINT "slider_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
