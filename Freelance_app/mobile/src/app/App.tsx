import * as React from "react";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { RoleProvider } from "./context/RoleContext";
import { SplashScreen } from "./screens/SplashScreen";
import { RoleSelectionScreen } from "./screens/RoleSelectionScreen";
import { InterestSelectionScreen } from "./screens/InterestSelectionScreen";
import { BrowseScreen } from "./screens/BrowseScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { DashboardClient } from "./screens/DashboardClient";
import { DashboardAdmin } from "./screens/DashboardAdmin";
import { FreelancerProfileScreen } from "./screens/FreelancerProfileScreen";
import { ProfileClient } from "./screens/ProfileClient";
import { ProfileAdmin } from "./screens/ProfileAdmin";
import { GigsListScreen } from "./screens/GigsListScreen";
import { CreateGigScreen } from "./screens/CreateGigScreen";
import { ConversationsListScreen } from "./screens/ConversationsListScreen";
import { ChatScreen } from "./screens/ChatScreen";
import { StoreScreen } from "./screens/StoreScreen";
import { NotFoundScreen } from "./screens/NotFoundScreen";

// Initialize Ionic React
setupIonicReact({
  mode: 'ios', // Use iOS mode for consistent styling across platforms
  rippleEffect: false,
  animated: true
});

export default function App() {
  return (
    <IonApp>
      <RoleProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/" component={SplashScreen} />
            <Route exact path="/role-selection" component={RoleSelectionScreen} />
            <Route exact path="/interests" component={InterestSelectionScreen} />
            <Route exact path="/browse" component={BrowseScreen} />
            <Route exact path="/signup" component={SignUpScreen} />
            <Route exact path="/login" component={LoginScreen} />
            
            {/* Role-based Dashboards */}
            <Route exact path="/dashboard" component={DashboardScreen} />
            <Route exact path="/dashboard-client" component={DashboardClient} />
            <Route exact path="/dashboard-admin" component={DashboardAdmin} />
            
            {/* Role-based Profiles */}
            <Route exact path="/profile" component={FreelancerProfileScreen} />
            <Route exact path="/profile-client" component={ProfileClient} />
            <Route exact path="/profile-admin" component={ProfileAdmin} />
            
            <Route exact path="/gigs" component={GigsListScreen} />
            <Route exact path="/create-gig" component={CreateGigScreen} />
            <Route exact path="/store" component={StoreScreen} />
            <Route exact path="/messages" component={ConversationsListScreen} />
            <Route exact path="/messages/:id" component={ChatScreen} />
            <Route render={() => <NotFoundScreen />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </RoleProvider>
    </IonApp>
  );
}
