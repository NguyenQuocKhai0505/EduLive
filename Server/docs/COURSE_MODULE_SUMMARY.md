# 📚 TÓM TẮT MODULE COURSE - SECTIONS - LESSONS

## 🎯 TỔNG QUAN THAY ĐỔI

### **1. Cấu trúc mới: Nested Routes (Routes lồng nhau)**

**TRƯỚC ĐÂY:**
```
/sections (standalone)
/lessons (standalone)
```

**BÂY GIỜ:**
```
/courses/:courseId/sections (nested trong course)
/courses/:courseId/sections/:sectionId/lessons (nested trong section)
```

---

## 📋 NHỮNG THAY ĐỔI CHÍNH

### **1. Tạo Module Sections & Lessons**

#### **Files mới được tạo:**

1. **DTOs (Data Transfer Objects):**
   - `create-section.dto.ts` - Validate dữ liệu khi tạo section
   - `update-section.dto.ts` - Validate dữ liệu khi cập nhật section
   - `create-lesson.dto.ts` - Validate dữ liệu khi tạo lesson
   - `update-lesson.dto.ts` - Validate dữ liệu khi cập nhật lesson

2. **Services:**
   - `sections.service.ts` - Business logic cho sections
   - `lessons.service.ts` - Business logic cho lessons

3. **Controllers:**
   - `sections.controller.ts` - HTTP endpoints cho sections (standalone)
   - `lessons.controller.ts` - HTTP endpoints cho lessons (standalone)

4. **Nested Routes trong CoursesController:**
   - Thêm endpoints để quản lý sections và lessons trực tiếp từ course

---

## 🔍 GIẢI THÍCH CODE CHI TIẾT

### **1. CoursesController - Nested Routes**

```typescript
@Controller("courses")
export class CoursesController {
    constructor(
        private readonly coursesService: CoursesService,
        private readonly sectionsService: SectionsService,  // ⚠️ MỚI
        private readonly lessonsService: LessonsService     // ⚠️ MỚI
    ) {}
```

**Giải thích:**
- **Dependency Injection**: Inject `SectionsService` và `LessonsService` vào `CoursesController`
- **Lý do**: Để có thể xử lý sections và lessons trực tiếp từ course controller

---

### **2. Tạo Section trong Course (Nested)**

```typescript
@Post(":courseId/sections")
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
async createSection(
    @Param("courseId", ParseIntPipe) courseId: number,
    @Body() createSectionDto: Omit<CreateSectionDto, 'courseId'>,
    @Req() req: any
) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    // Tự động set courseId từ URL param
    return await this.sectionsService.create(
        { ...createSectionDto, courseId },
        userId,
        userRole
    );
}
```

**Giải thích từng phần:**

1. **`@Post(":courseId/sections")`**
   - Route: `POST /courses/1/sections`
   - `:courseId` là dynamic parameter từ URL

2. **`@UseGuards(AuthGuard, RolesGuard)`**
   - `AuthGuard`: Kiểm tra user đã đăng nhập chưa (verify JWT token)
   - `RolesGuard`: Kiểm tra role của user

3. **`@Roles(UserRole.TEACHER, UserRole.ADMIN)`**
   - Chỉ TEACHER và ADMIN mới được tạo section

4. **`@Param("courseId", ParseIntPipe)`**
   - Lấy `courseId` từ URL và convert sang number
   - Ví dụ: `/courses/1/sections` → `courseId = 1`

5. **`@Body() createSectionDto: Omit<CreateSectionDto, 'courseId'>`**
   - `Omit<CreateSectionDto, 'courseId'>`: Loại bỏ field `courseId` khỏi DTO
   - **Lý do**: `courseId` đã có trong URL, không cần gửi trong body

6. **`req.user.sub` và `req.user.role`**
   - `req.user` được set bởi `AuthGuard` sau khi verify JWT
   - `sub`: User ID
   - `role`: User role (TEACHER, ADMIN, STUDENT)

7. **`{ ...createSectionDto, courseId }`**
   - Spread operator: Merge `createSectionDto` với `courseId` từ URL
   - Tạo object đầy đủ để gửi vào service

---

### **3. Lấy Sections của Course**

```typescript
@Get(":courseId/sections")
async getSectionsByCourse(@Param("courseId", ParseIntPipe) courseId: number) {
    return await this.sectionsService.findByCourse(courseId);
}
```

**Giải thích:**
- **Route**: `GET /courses/1/sections`
- **Public**: Không cần authentication (mọi người đều xem được)
- **Trả về**: Danh sách sections của course có `courseId = 1`

---

### **4. Tạo Lesson trong Section (Nested)**

```typescript
@Post(":courseId/sections/:sectionId/lessons")
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN)
async createLesson(
    @Param("sectionId", ParseIntPipe) sectionId: number,
    @Body() createLessonDto: Omit<CreateLessonDto, 'sectionId'>,
    @Req() req: any
) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return await this.lessonsService.create(
        { ...createLessonDto, sectionId },
        userId,
        userRole
    );
}
```

**Giải thích:**
- **Route**: `POST /courses/1/sections/2/lessons`
- **Nested 2 cấp**: Course → Section → Lesson
- **Tự động set `sectionId`**: Từ URL parameter, không cần gửi trong body

---

### **5. Thứ tự Routes (QUAN TRỌNG)**

```typescript
// ✅ ĐÚNG: Nested routes đặt TRƯỚC route /courses/:id
@Get(":courseId/sections")           // Route cụ thể
@Get(":courseId/sections/:sectionId")
@Get(":id")                          // Route generic (phải đặt SAU)
```

**Tại sao quan trọng?**

NestJS match routes theo **thứ tự từ trên xuống**. Nếu đặt `@Get(":id")` trước:

```typescript
// ❌ SAI: Route generic đặt TRƯỚC
@Get(":id")                          // Sẽ match /courses/1/sections
@Get(":courseId/sections")           // Không bao giờ được gọi
```

**Kết quả**: Request `GET /courses/1/sections` sẽ bị match vào `@Get(":id")` với `id = "1/sections"` → Lỗi!

---

## 🔄 WORKFLOW HOÀN CHỈNH

### **Workflow 1: Tạo Course với Sections và Lessons**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ADMIN tạo Category                                       │
│    POST /categories                                          │
│    → category_id = 1                                        │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. TEACHER tạo Course                                       │
│    POST /courses                                             │
│    Body: { title, categoryId: 1, ... }                     │
│    → course_id = 1                                          │
│    → isActive = false (chờ admin duyệt)                     │
│    → isPublished = false                                    │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ADMIN duyệt Course                                       │
│    PATCH /courses/1/approve                                  │
│    → isActive = true                                         │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. TEACHER tạo Section 1 (NESTED)                          │
│    POST /courses/1/sections                                 │
│    Body: { title: "Section 1", order: 1 }                   │
│    → section_id = 1                                          │
│    → courseId = 1 (tự động từ URL)                          │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. TEACHER tạo Lesson 1 trong Section 1 (NESTED)           │
│    POST /courses/1/sections/1/lessons                       │
│    Body: { title: "Lesson 1", type: "video", ... }          │
│    → lesson_id = 1                                          │
│    → sectionId = 1 (tự động từ URL)                        │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. TEACHER tạo thêm Lesson 2                                │
│    POST /courses/1/sections/1/lessons                       │
│    Body: { title: "Lesson 2", type: "article", ... }       │
│    → lesson_id = 2                                          │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. TEACHER tạo Section 2                                    │
│    POST /courses/1/sections                                 │
│    Body: { title: "Section 2", order: 2 }                   │
│    → section_id = 2                                          │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. TEACHER publish Course                                  │
│    PATCH /courses/1/publish                                  │
│    → isPublished = true                                      │
│    ⚠️ Lưu ý: Chỉ publish được nếu isActive = true          │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. STUDENT xem Course                                       │
│    GET /courses/1                                            │
│    → Trả về course với sections và lessons đầy đủ          │
└─────────────────────────────────────────────────────────────┘
```

---

### **Workflow 2: Xem Course với Sections và Lessons**

```
┌─────────────────────────────────────────────────────────────┐
│ STUDENT request: GET /courses/1                             │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ CoursesController.findOne(1)                                 │
│ → Gọi CoursesService.findOne(1)                             │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ CoursesService.findOne()                                     │
│ → Query database với relations: ['sections', 'sections.lessons']
│ → Trả về Course object với:                                 │
│   - Course info                                              │
│   - Sections[] (mỗi section có lessons[])                   │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ Response JSON:                                               │
│ {                                                            │
│   id: 1,                                                     │
│   title: "React Master Class",                              │
│   sections: [                                                │
│     {                                                        │
│       id: 1,                                                 │
│       title: "Section 1",                                    │
│       lessons: [                                             │
│         { id: 1, title: "Lesson 1", ... },                  │
│         { id: 2, title: "Lesson 2", ... }                    │
│       ]                                                      │
│     },                                                       │
│     {                                                        │
│       id: 2,                                                 │
│       title: "Section 2",                                    │
│       lessons: []                                            │
│     }                                                        │
│   ]                                                          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Ý NGHĨA CỦA THAY ĐỔI

### **1. RESTful API Design**

**TRƯỚC:**
```
POST /sections
Body: { title: "...", courseId: 1 }
```

**SAU:**
```
POST /courses/1/sections
Body: { title: "..." }
```

**Lợi ích:**
- ✅ URL rõ ràng hơn: `/courses/1/sections` → "Sections của course 1"
- ✅ Không cần gửi `courseId` trong body (tự động từ URL)
- ✅ Tuân thủ RESTful principles: Resource hierarchy

---

### **2. Bảo mật tốt hơn**

```typescript
// Service tự động validate courseId từ URL
async createSection(createSectionDto, userId, userRole) {
    // Kiểm tra course tồn tại
    const course = await this.coursesRepository.findOne({
        where: { id: createSectionDto.courseId }
    });
    
    // Kiểm tra quyền: chỉ owner hoặc ADMIN
    if (course.instructorId !== userId && userRole !== UserRole.ADMIN) {
        throw new ForbiddenException("You can only add sections to your own courses");
    }
}
```

**Lợi ích:**
- ✅ Validate `courseId` ngay từ URL
- ✅ Kiểm tra quyền sở hữu course
- ✅ Tránh lỗi gửi sai `courseId` trong body

---

### **3. Tương thích ngược (Backward Compatibility)**

**Vẫn giữ routes standalone:**
```
POST /sections              (vẫn hoạt động)
GET /sections/course/:id     (vẫn hoạt động)
POST /lessons               (vẫn hoạt động)
```

**Lợi ích:**
- ✅ Code cũ vẫn hoạt động
- ✅ Có thể migrate dần dần
- ✅ Linh hoạt trong việc sử dụng API

---

## 📊 SO SÁNH: Standalone vs Nested Routes

| Tiêu chí | Standalone | Nested |
|----------|-----------|--------|
| **URL** | `/sections` | `/courses/1/sections` |
| **Body** | Cần gửi `courseId` | Không cần (tự động từ URL) |
| **Rõ ràng** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **RESTful** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Bảo mật** | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Dễ hiểu** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🔐 QUYỀN TRUY CẬP (Permissions)

### **Sections:**

| Action | Route | Permission |
|--------|-------|------------|
| Tạo | `POST /courses/:id/sections` | TEACHER (owner) / ADMIN |
| Xem | `GET /courses/:id/sections` | PUBLIC |
| Cập nhật | `PATCH /courses/:id/sections/:id` | TEACHER (owner) / ADMIN |
| Xóa | `DELETE /courses/:id/sections/:id` | TEACHER (owner) / ADMIN |

### **Lessons:**

| Action | Route | Permission |
|--------|-------|------------|
| Tạo | `POST /courses/:id/sections/:id/lessons` | TEACHER (owner) / ADMIN |
| Xem | `GET /courses/:id/sections/:id/lessons` | PUBLIC |
| Cập nhật | `PATCH /courses/:id/sections/:id/lessons/:id` | TEACHER (owner) / ADMIN |
| Xóa | `DELETE /courses/:id/sections/:id/lessons/:id` | TEACHER (owner) / ADMIN |

---

## 🗂️ CẤU TRÚC DỮ LIỆU

```
Course (Khóa học)
├── id: number
├── title: string
├── instructorId: number (FK → User)
├── categoryId: number (FK → Category)
├── isActive: boolean (admin đã duyệt chưa)
├── isPublished: boolean (đã publish chưa)
└── sections: Section[] (OneToMany)
    └── Section (Chương)
        ├── id: number
        ├── title: string
        ├── courseId: number (FK → Course)
        ├── order: number
        └── lessons: Lesson[] (OneToMany)
            └── Lesson (Bài học)
                ├── id: number
                ├── title: string
                ├── sectionId: number (FK → Section)
                ├── type: "video" | "article" | "quiz"
                ├── time: string
                ├── preview: boolean
                ├── videoUrl?: string
                ├── content?: string
                └── order: number
```

---

## 🚀 CÁCH SỬ DỤNG

### **1. Tạo Section (Nested)**

```bash
POST http://localhost:3001/courses/1/sections
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "title": "Section 1: Introduction",
  "order": 1
}
```

### **2. Tạo Lesson (Nested)**

```bash
POST http://localhost:3001/courses/1/sections/1/lessons
Authorization: Bearer <teacher_token>
Content-Type: application/json

{
  "title": "Welcome to the Course",
  "type": "video",
  "time": "5:30",
  "preview": true,
  "videoUrl": "https://example.com/video1.mp4",
  "order": 1
}
```

### **3. Xem Course với Sections và Lessons**

```bash
GET http://localhost:3001/courses/1
```

**Response:**
```json
{
  "id": 1,
  "title": "React Master Class",
  "sections": [
    {
      "id": 1,
      "title": "Section 1: Introduction",
      "lessons": [
        {
          "id": 1,
          "title": "Welcome to the Course",
          "type": "video",
          "time": "5:30"
        }
      ]
    }
  ]
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Thứ tự routes**: Nested routes phải đặt TRƯỚC route `/:id`
2. **CASCADE Delete**: Xóa Course → Xóa Sections → Xóa Lessons
3. **Validation**: Service tự động validate quyền sở hữu
4. **Workflow**: Course phải được admin duyệt (`isActive = true`) trước khi publish

---

## 📝 TÓM TẮT

✅ **Đã tạo**: Sections và Lessons module hoàn chỉnh  
✅ **Đã thêm**: Nested routes trong CoursesController  
✅ **Đã giữ**: Standalone routes để tương thích  
✅ **Đã validate**: Quyền truy cập và ownership  
✅ **Đã test**: Workflow từ tạo course đến xem course với sections/lessons  

**Kết quả**: Hệ thống quản lý course với cấu trúc rõ ràng, RESTful, và bảo mật tốt! 🎉
