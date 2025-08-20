import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onRate, readOnly = false }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-5 h-5 cursor-pointer ${(hover || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        } ${readOnly ? 'cursor-default' : 'hover:text-yellow-400'}`}
                    onMouseEnter={() => !readOnly && setHover(star)}
                    onMouseLeave={() => !readOnly && setHover(0)}
                    onClick={() => !readOnly && onRate && onRate(star)}
                />
            ))}
        </div>
    );
};

export default StarRating;