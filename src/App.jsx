// src/App.js
import React from 'react';
import DataDisplay from './components/DataDisplay';
import Theme from './features/theme/Theme';
import Accent from './features/accent/Accent';
import FontFamily from './features/font-family/FontFamily';
import { useStyles } from './css/Styles';
import EventsProvider from './components/events/EventsProvider';
import { useSelector } from 'react-redux';
import { StylesProvider } from './css/Styles';
import Settings from './components/Settings';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const styles = useStyles();
  const selectedLeague = useSelector((state) => state.league);

  return (
    <div className={`${styles.page}`}>
      <StylesProvider>
        <EventsProvider />
        <ToastContainer />
        <Theme />
        <Accent />
        <FontFamily />

        <Settings />
        <div className="fixed bottom-0 left-0 right-0">
          <DataDisplay identifier={selectedLeague} />
        </div>

      </StylesProvider>
    </div>
  );
}

export default App;
