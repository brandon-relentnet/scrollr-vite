// src/App.js
import React from 'react';
import DataDisplay from './components/DataDisplay';
import Theme from './features/theme/Theme';
import Accent from './features/accent/Accent';
import FontFamily from './features/font-family/FontFamily';
import { useStyles } from './css/Styles';

import { Provider } from 'react-redux';
import { store } from './store';
import { StylesProvider } from './css/Styles';
import Settings from './components/Settings';

function App() {
  const styles = useStyles();

  return (
    <div className={`${styles.page}`}>
      <Provider store={store}>
        <StylesProvider>
          <Theme />
          <Accent />
          <FontFamily />

          <Settings />
          <div className="fixed bottom-0 left-0 right-0">
            <DataDisplay />
          </div>

        </StylesProvider>
      </Provider >
    </div>
  );
}

export default App;
