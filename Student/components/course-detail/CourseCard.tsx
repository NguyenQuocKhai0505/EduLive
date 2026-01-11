import { Star } from "lucide-react";

interface CourseCardProps {
  item: any;
}

export default function CourseCard({ item }: CourseCardProps) {
  return (
    <div className="group cursor-pointer flex flex-col gap-2 h-full">
      {/* Thumbnail */}
      <div className="overflow-hidden rounded-lg aspect-video border border-slate-200 dark:border-slate-800 relative">
        <img 
          src={item.thumbnail} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Lớp phủ đen nhẹ khi hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white line-clamp-2 text-sm leading-snug group-hover:text-blue-600 transition-colors">
            {item.title}
          </h4>
          <p className="text-xs text-slate-500 mt-1">{item.instructor}</p>
          
          <div className="flex items-center gap-1 mt-1">
            <span className="font-bold text-sm text-amber-500">{item.rating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(item.rating) ? "fill-amber-500 text-amber-500" : "fill-slate-200 text-slate-200"}`}
                />
              ))}
            </div>
            {item.students && <span className="text-xs text-slate-400">({item.students.toLocaleString()})</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-slate-900 dark:text-white">{item.price}</span>
          {item.originalPrice && (
            <span className="text-xs text-slate-400 line-through">{item.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}