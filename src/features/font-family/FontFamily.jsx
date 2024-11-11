// src/features/counter/FontFamily.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

function FontFamily() {
    const currentFontFamily = useSelector((state) => state.fontFamily);
    console.log("Current font family in Redux:", currentFontFamily); // Log the current font family

    useEffect(() => {
        if (currentFontFamily) {
            console.log("Applying font family to CSS variable:", currentFontFamily); // Log when the variable updates
            document.body.style.setProperty('--fontFamily', `${currentFontFamily}, sans-serif`);
        }
    }, [currentFontFamily]);

    return null;
}


export default FontFamily;
