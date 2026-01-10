"use client"

import {useState} from "react"
import {Globe,Check} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

//Language List
const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
    { code: "ko", name: "Korean", nativeName: "한국어" },
    { code: "ja", name: "Japanese", nativeName: "日本語" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
  ];
  export function LanguageModal()
  {
    const [open,setOpen] = useState(false)
    const [selectedLanguage,setSelectedLanguage] = useState("en")

    const currentLanguage = languages.find(
        (lang) => lang.code === selectedLanguage
      ) || languages[0]

      //Ham xu li chon ngon ngu
      const handleLanguageChange = (localeCode:string) =>{
        setSelectedLanguage(localeCode)
        //Logic 
        console.log("Selected Language: ",localeCode)
        setOpen(false)
      }
    return(
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="gap-2">
                    <Globe className="h-5 w-5"/>
                    <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w[500px]">
                <DialogHeader>
                    <DialogTitle>Choose a language</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
                {languages.map((language) => {
                    const isSelected = language.code === selectedLanguage;

                    return (
                    <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={cn(
                        "relative flex flex-col items-start p-4 rounded-lg border-2 transition-all",
                        "hover:bg-accent hover:border-primary",
                        isSelected
                            ? "border-purple-600 bg-purple-50 dark:bg-purple-950"
                            : "border-gray-200 dark:border-gray-700"
                        )}
                    >
                        {/* Check icon khi được chọn */}
                        {isSelected && (
                        <div className="absolute top-2 right-2">
                            <Check className="h-5 w-5 text-purple-600" />
                        </div>
                        )}

                        <span
                        className={cn(
                            "font-semibold text-sm",
                            isSelected ? "text-purple-600" : "text-foreground"
                        )}
                        >
                        {language.nativeName}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                        {language.name}
                        </span>
                    </button>
                    );
                })}
                </div>
            </DialogContent>
        </Dialog>
    )
  }