import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 24, className }) => (
    <Loader2 className={clsx("animate-spin text-primary-500", className)} size={size} />
);

export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={clsx("animate-pulse rounded-md bg-gray-200/80", className)}
            {...props}
        />
    );
};

export const CardSkeleton = () => (
    <div className="card p-6 space-y-4">
        <div className="flex justify-between">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-4">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
    </div>
);
