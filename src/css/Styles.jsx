// src/StylesContext.js

import React, { createContext, useContext } from 'react';

const styles = {
    input: 'focus:outline-none focus:shadow-2xl rounded focus:border-accent border-2 border-transparent bg-surface1 appearance-none hover:shadow-lg transition duration-300 shadow p-2 w-full',
    sectionHeader: 'text-2xl font-semibold m-4 text-left',
    sectionBlocks: 'p-10 rounded shadow-lg bg-surface0',
    page: 'container mx-auto w-10/12 text-text pb-20',
    label: 'ml-1 text-left block mb-2 font-bold',
    dropdown: 'w-full mx-auto relative',
    button: 'px-4 py-2 rounded bg-surface2 text-text hover:scale-105 hover:shadow-md hover:bg-accent hover:text-base transition duration-300'
};

const StylesContext = createContext(styles);

export const StylesProvider = ({ children }) => (
    <StylesContext.Provider value={styles}>{children}</StylesContext.Provider>
);

export const useStyles = () => useContext(StylesContext);
