import api from "@/lib/api";

//GET ALL COURSES
export const getAllCourses = () => api.get("/courses")

//GET COURSE BY ID 
export const getCourseById = (id:number) => api.get(`/courses/${id}`)

//GET PENDING COURSES 
export const getPendingCourses = () => api.get("/courses/pending/approval")

//ACCEPT COURSE 
export const acceptCourse = (id:number) => api.patch(`/courses/${id}/approve`)

//REJECT COURSE 
export const rejectCourse =(id:number, reason?:string) => api.patch(`/courses/${id}/reject`, {reason})

//DELETE COURSE 
export const deleteCourse = (id:number) =>api.delete(`/courses/${id}`)

//GET COURSES SECTIONS 
export const getCourseSections = (courseId:number) => api.get(`/courses/${courseId}/sections`)

//GET SECTION LESSONS (đúng route backend: GET /lessons/section/:sectionId)
export const getSectionLessons = (sectionId: number) =>
  api.get(`/lessons/section/${sectionId}`);