
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* FreelanceHub Ionic Theme */
import './styles/ionic-theme.css';

/* Existing theme variables */
import './styles/theme.css';

createRoot(document.getElementById("root")!).render(<App />);
  