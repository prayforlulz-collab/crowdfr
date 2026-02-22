
import React from 'react';

interface LogoProps {
    className?: string;
    showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Square icon removed per user request */}
            {showText && (
                <span className="text-xl font-black bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent tracking-tighter">
                    Crowdfr
                </span>
            )}
        </div>
    );
};
