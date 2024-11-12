// src/pages/Home.jsx
import React from 'react';
import ThemeDropdown from '../features/theme/ThemeDropdown';
import AccentDropdown from '../features/accent/AccentDropdown';
import FontFamilyDropdown from '../features/font-family/FontFamilyDropdown';
import ModeDropdown from '../features/mode/SpeedDropdown';
import { useStyles } from '../css/Styles';
import PageHeaders from './PageHeaders';
import LeagueDropdown from '../features/league/LeagueDropdown';

function Settings() {
    const styles = useStyles();
    
    return (
        <div>
            <div className="max-w-3xl mx-auto text-center">
                <PageHeaders title="Settings" description="Fine tune to your liking." />

                <h2 className='text-2xl text-subtext1 font-semibold m-4 text-left'>Appearance</h2>
                {/* Centered grid with larger width */}
                <div className={`${styles.sectionBlocks} grid mb-4 grid-cols-1 md:grid-cols-2 gap-8`}>
                    <div className="text-left">
                        <label className={`${styles.label}`}>Theme:</label>
                        <ThemeDropdown />
                        <label className={`${styles.label}`}>Accent:</label>
                        <AccentDropdown />
                    </div>
                    <div className="text-left">
                        <label className={`${styles.label}`}>Font Family:</label>
                        <FontFamilyDropdown />
                        <label className={`${styles.label}`}>Speed:</label>
                        <ModeDropdown />
                    </div>
                    <div className="text-left">
                        <label className={`${styles.label}`}>League:</label>
                        <LeagueDropdown />
                    </div>
                </div>

                <h2 className='text-2xl text-subtext1 font-semibold m-4 text-left'>Accounts</h2>
                {/* Centered grid with larger width */}
                <div className={`${styles.sectionBlocks} grid mb-4 grid-cols-1 md:grid-cols-2 gap-8`}>
                    <div className="p-4 text-left">
                        <label className={`${styles.label}`}>Yahoo Sports:</label>
                    </div>
                    <div className="p-4 text-left">
                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
