# User Desk

เว็บ Backoffice สำหรับจัดการบัญชีผู้ใช้ กลุ่ม permissions เซสชัน และ audit log

โครงสร้าง `src` จัดตาม feature เหมือนโปรเจกต์อ้างอิง: `app/<feature>/pages` เก็บหน้า, `app/<feature>/components` เก็บส่วนประกอบของ feature, `components/` เก็บส่วนที่ใช้ร่วมกัน, `hooks/api` รวม query/mutation hooks และ `lib/api/service` กับ `lib/api/type` แยกการเรียก API ออกจากแบบข้อมูล

## เริ่มใช้งาน

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`VITE_API_BASE_URL` กำหนด API base URL ได้ ค่าเริ่มต้นคือ `http://localhost:3001/api` ส่วน Vite เปิดหน้าเว็บที่ `http://localhost:3000` เพื่อให้ตรงกับ `TRUSTED_ORIGINS` ค่าเริ่มต้นของ user-service ซึ่งอนุญาต origin นี้สำหรับ cookie/CORS

ถ้าเปลี่ยน host หรือ port ของหน้าเว็บ ต้องเพิ่ม origin ที่เปิดจริงลงใน `TRUSTED_ORIGINS` ของ user-service และ restart backend ด้วย เนื่องจาก Better Auth ใช้ค่าเดียวกันสำหรับตรวจ trusted origins

## ตรวจ build

```bash
npm run build
```

แอปใช้ Better Auth session cookie และส่ง `credentials: "include"` ทุกคำขอ ไม่เก็บ cookie หรือรหัสผ่านใน browser storage ไม่มีการเรียก internal API จาก browser

UI ไม่สร้าง permission catalog หรือข้อมูลผู้ใช้ตัวอย่าง และไม่คำนวณ effective permissions ของผู้ใช้ปัจจุบัน การตรวจสิทธิ์จริงอยู่ที่ backend; response 401/403 จะถูกจัดการตามสถานะเซสชันและสิทธิ์ของบัญชี

## Generate API paths จาก user-service

สคริปต์อ่าน OpenAPI จาก NestJS และ Better Auth ของ `user-service` แล้วสร้าง `src/lib/api/generated/paths.ts` เพื่อใช้ร่วมกับ `request` โดย path ที่ได้สัมพันธ์กับ `VITE_API_BASE_URL` (ไม่รวม `/api`) และ path parameter จะถูก URL-encode ให้อัตโนมัติ

```bash
# ติดตั้ง dependencies และ build user-service ก่อนทุกครั้งที่แก้ API
cd ../user-service
npm install
npm run build
cd ../user-desk
npm run generate:api
```

หาก service อยู่ที่อื่น กำหนด `USER_SERVICE_DIR=/path/to/user-service npm run generate:api` ได้ สคริปต์อ่าน configuration จาก `.env` ของ service จึงสร้าง Better Auth paths ตาม plugins ที่เปิดใช้งาน ไฟล์ที่ generate ห้ามแก้ด้วยมือ ตัวอย่างการใช้งาน:

```ts
import { servicePaths } from "@/lib/api/generated/paths";
import { request } from "@/lib/api/client";

const user = await request(servicePaths.BackofficeUserController_get({ id: "user-id" }));
```

สคริปต์ปัจจุบัน generate เฉพาะ paths ส่วน models ยังใช้ types ที่เขียนเองใน `src/lib/api/type` ต้องเปิด `ENABLE_API_DOCS=true` ใน configuration ของ service ขณะ generate เพราะ Better Auth OpenAPI plugin เปิดตามค่านี้

## สถานะการเชื่อมต่อ API

การสร้างกลุ่มและการค้นหา/แบ่งหน้ารายการกลุ่มยังต้องปรับให้ตรงกับ contract ของ user-service ก่อนใช้งานจริง และยังไม่มีการ generate TypeScript models จาก OpenAPI ให้ตรวจ contract ของ service และทดสอบการทำงานร่วมกันก่อน deploy
