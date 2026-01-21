import api from "@/lib/axios";

export interface CartItemResponse{
    id:number 
    userId:number 
    courseId:number 
    status:"IN_CART" | "PURCHASED"
    priceSnapshot:number 
    course:{
        id:number,
        title:string,
        thumbnail:string
        price:number
        instructor?:{name?:string}
    }
}

export const addToCart = async(courseId:number) =>{
    const response = await api.post("/cart",{ courseId })
    return response.data
}

export const getCartItems = async():Promise<CartItemResponse[]> =>{
    const response = await api.get("/cart")
    return response.data
}

export const removeFromCart = async(courseId:number) =>{
    const response = await api.delete(`/cart/${courseId}`)
    return response.data
}

export const getCartStatus = async(courseId:number) =>{
    const response = await api.get(`/cart/status/${courseId}`)
    return response.data  //{inCart,purchased}
}
export const checkout = async(idempotencyKey:string) =>{
    const response = await api.post("/cart/checkout",{idempotencyKey})
    return response.data
}