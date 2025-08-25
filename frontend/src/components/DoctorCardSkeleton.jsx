
const DoctorCardSkeleton = () => (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex gap-6 ">
        <div className="w-32 h-32 rounded-full bg-gray-700 animate-pulse" />
        <div className="flex-grow flex flex-col gap-3 animate-pulse">
            <div className="flex items-start justify-between animate-pulse">
                <div className="flex flex-col gap-2 animate-pulse" >
                    <div className="h-7 w-40 bg-gray-700 rounded" />
                    <div className="h-5 w-24 bg-gray-700 rounded" />
                    <div className="h-4 w-20 bg-gray-700 rounded" />
                </div>
                <div className="flex flex-col gap-2 items-end animate-pulse">
                    <div className="h-6 w-28 bg-gray-700 rounded" />
                    <div className="h-4 w-20 bg-gray-700 rounded" />
                </div>
            </div>
            <div className="flex items-center gap-4 my-2 animate-pulse" >
                <div className="h-5 w-16 bg-gray-700 rounded-full" />
                <div className="h-5 w-24 bg-gray-700 rounded" />
            </div>
            <div className="h-6 w-32 bg-gray-700 rounded" />
        </div>
        <div className="flex items-center animate-pulse">
            <div className="h-12 w-32 bg-gray-700 rounded-lg" />
        </div>
    </div>
);

export default DoctorCardSkeleton;