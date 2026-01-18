import api from "@/lib/axios";
import type { CourseResponse } from "@/lib/types/api.types";

//Interface cho User Profile 
export interface UserProfile{
    id:number
    email: string
    name:string,
    role:string,
    avatar?:string,
}

/**
 * Lay thong tin profile cua user hien tai 
 * ENDPOINT: GET /auth/me
 */
export const getMyProfile = async():Promise<UserProfile> =>{
    const response = await api.get("/auth/me")
    return response.data
}
/**Doi mat khau
 * ENDPOINT: PATCH /users/me/password
 * Body: {currentPassword:string, newPassword:string}
 */
export const changePassword = async(
    currentPassword:string,
    newPassword:string
) =>{
    const response = await api.patch("/users/me/password",{currentPassword,newPassword})
    return response.data
}

/*Lay danh sach khoa hoc da dang ky cua user 
ENDPOINT: GET /enrollments/my
*/
export const getMyCourses = async():Promise<CourseResponse[]> =>{
    const response = await api.get("/enrollments/my")
    return response.data
}
/**
 * Dang ky khoa hoc 
 * ENDPOINT: POST /enrollments/:courseId
 */
export const enrollCourse = async(courseId:number) =>{
    const response = await api.post(`/enrollments/${courseId}`)
    return response.data
}