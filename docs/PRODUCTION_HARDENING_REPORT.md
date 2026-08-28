# omni-flow — Production Hardening Report

เอกสารนี้สรุปงานตรวจสอบและ hardening ของ omni-flow บน branch `fix/production-hardening-20260827` และ PR [#18](https://github.com/banksaisuoy/omni-flow/pull/18) โดยคงฟังก์ชันเดิมและไม่แก้ `main`

## สถานะ source

| รายการ | ค่า |
|---|---|
| Remote head | `4a9c8480543df2d504fed6e1a15353746824b51c` |
| PR state | Open, mergeable, checks clean |
| Handoff bundle | [Google Drive รุ่น 2026-08-28.4](https://drive.google.com/drive/folders/10feI_U8qb_XixTdr6XUVqU-vYb_7vigI) |
| Master report | [FINAL_REPORT_TH.md ใน Drive](https://drive.google.com/drive/folders/10feI_U8qb_XixTdr6XUVqU-vYb_7vigI) |

## การแก้ไขด้าน security และ correctness

ปรับ order actions ให้ตรวจ NextAuth session, คำนวณราคาโดย server และตรวจ stock ก่อนทำรายการ ป้องกัน payment-slip access และเพิ่ม Prisma production URL guard เพื่อไม่ให้ configuration ผิดพลาดไปใช้ใน production กู้ test config/model service ที่เสียและ patch dependency/runtime ที่จำเป็น

ย้าย Gemini shopping assistant จาก browser ไป server action เพื่อไม่ให้ client bundle เห็น provider key หรือเรียก provider โดยตรง จำกัดความยาวคำถาม, context และ output เพิ่ม admin authorization และ input validation ใน product generation, product creation, flash-sale, pin, analyst และ user-management actions ลบ unused client-side `@google/generative-ai` dependency และแทน plaintext Render/Docker secrets ด้วย platform-managed runtime variables

## Verification และ GitHub checks

| Gate | ผลล่าสุด |
|---|---|
| Clean dependency install | `npm ci` ผ่าน |
| Prisma client generation | ผ่าน |
| Typecheck | ผ่าน |
| Lint | ผ่าน |
| Tests | 16 tests ผ่านจาก 3 suites |
| Production build | ผ่านด้วย build-only values |
| Production dependency audit | ไม่พบ vulnerabilities ระดับ high/critical |
| Runtime smoke | Local `/`, `/login`, and `/api/products` route checks completed; live Render `/` and `/login` rendered, while live `/products` showed an empty catalog/loading state |
| GitHub Build Test | ผ่าน |
| GitHub QA | ผ่าน |
| Review workflow | Skipped ตาม workflow configuration |

การทดสอบใช้ isolated/test configuration เท่านั้น ไม่ได้ยืนยัน database, NextAuth, AI provider หรือ deployment account จริง บน live Render ตรวจพบว่า `/api/products` ไม่ใช่ route ที่มีอยู่ใน source ปัจจุบันและตอบ 404 ตามปกติ แต่หน้า `/products` ยังคงแสดง `Thinking...` เมื่อ server action/database ไม่จบ จึงเพิ่ม timeout และ error state ใน commit `4a9c848` เพื่อไม่ให้ UI ค้างถาวร

## Production blockers และงานถัดไป

ต้องตั้งค่า database จริงพร้อม seed/published product catalog, migrations/backup/restore, auth secret, HTTPS/domain/CORS, storage และ monitoring/alerts ผ่าน platform secret manager ห้ามใช้ค่าใน `.env.example` เป็น secret จริง Credential ที่เคย commit หรืออยู่ใน old image layers ต้อง rotate/revoke ที่ provider เพราะการลบออกจาก current tree ไม่ได้ลบประวัติเดิม

ควรเพิ่ม integration tests ที่ใช้ Prisma transaction สำหรับ `placeOrder`, ทดสอบ unauthenticated/USER/ADMIN authorization, จำกัด product-image AI action และตรวจ static client bundle ว่าไม่มี Gemini key หรือ `GoogleGenerativeAI` import ฝั่ง browser ต้องกำหนด policy ว่า seller จะจัดการ product ได้หรือไม่ เพราะ guard ปัจจุบันตั้งใจให้ ADMIN เท่านั้น

ห้าม merge PR อัตโนมัติ ให้เจ้าของงานตรวจ database/auth/AI provider settings, secret rotation และ rollback plan ก่อนยืนยัน merge
