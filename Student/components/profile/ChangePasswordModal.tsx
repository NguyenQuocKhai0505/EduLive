"use client";

import { useState } from "react";
import { X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { changePassword } from "@/services/user.service";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export function ChangePasswordModal({isOpen,onClose}:ChangePasswordModalProps){
    const [currentPassword,setCurrentPassword] = useState("")
    const [newPassword,setNewPassword] = useState("")
    const [confirmPassword,setConfirmPassword] = useState("")
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState("")
    const [success,setSuccess] = useState("")
    
    const handleSubmit = async(e:React.FormEvent) =>{
        e.preventDefault()
        setError("")
        setSuccess("")

        //Validation
        if(newPassword.length < 6){
            setError("New password must be at least 6 characters")
            return
        }
        if(newPassword !== confirmPassword){
            setError("Passwords do not match")
            return
        }

        try{
            setLoading(true)
            await changePassword(currentPassword,newPassword)
            setSuccess("Password changed successfully")
            setTimeout(()=>{
                onClose()
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
                setSuccess("")
            },1500)
        }catch(err:any){
            setError(err.response?.data?.message || err.message || "An error occurred while changing password")
        }finally{
            setLoading(false)
        }
    }
    if(!isOpen) return null
    return(
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    <X size={20}/>
                </button>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400"/>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
                </div>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e)=>setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter your current password"
                        />
                    </div>
                    {/* New Password */}
                    <div>
                        <label
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                        New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e)=> setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Enter your new password"
                        >
                        </input>
                    </div>
                    {/* Confirm Password */}
                    <div>
                        <label
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e)=> setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Confirm your new password"
                        />
                    </div>
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                        {error}
                        </div>
                    )}
                    {/* Success Message */}
                    {success && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                        {success}
                        </div>
                    )}
                    {/* Button */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {loading ? "Changing..." : "Change Password"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}