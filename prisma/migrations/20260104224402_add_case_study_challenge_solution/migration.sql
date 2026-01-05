-- AlterTable
ALTER TABLE "CaseStudy" ADD COLUMN     "challenge" TEXT,
ADD COLUMN     "solution" TEXT;

-- AddForeignKey
ALTER TABLE "ConsultationRequest" ADD CONSTRAINT "ConsultationRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
