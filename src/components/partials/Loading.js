import { ArrowPathIcon } from '@heroicons/react/24/outline';
import React from 'react';

const Loading = () => {
    return (
        <div className="flex items-center justify-center h-screen">
            <ArrowPathIcon className="animate-spin h-10 w-10 text-primary__color" />
        </div>
    );
};

export default Loading;