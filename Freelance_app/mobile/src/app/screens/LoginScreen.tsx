import { useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonCard,
  IonCardContent,
  useIonViewWillEnter,
  IonSpinner,
} from "@ionic/react";
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logoGoogle,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { apiLogin } from "../api";

export function LoginScreen() {
  const history = useHistory();
  const { role, handleLoginSuccess } = useRole();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useIonViewWillEnter(() => {
    setError(null);
  });

  const navigateAfterLogin = (userRole: typeof role) => {
    if (userRole === "admin") history.push("/dashboard-admin");
    else if (userRole === "client") history.push("/dashboard-client");
    else history.push("/dashboard");
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await apiLogin(email, password);
      handleLoginSuccess(res);
      navigateAfterLogin(res.user.user_type);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="light">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Welcome Back</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="flex flex-col items-center mb-10 mt-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white text-3xl font-bold">FH</span>
          </div>
          <IonText>
            <h2 className="text-2xl font-bold text-center mb-2">Sign In</h2>
            <p className="text-center text-gray-500">
              Welcome back! Please enter your details.
            </p>
          </IonText>
        </div>

        <IonCard className="freelancehub-card">
          <IonCardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-6"
            >
              <div>
                <IonLabel
                  position="stacked"
                  color="medium"
                  className="freelancehub-label"
                >
                  Email
                </IonLabel>
                <IonItem fill="outline" className="rounded-xl">
                  <IonIcon icon={mailOutline} slot="start" color="medium" />
                  <IonInput
                    type="email"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value || "")}
                    placeholder="Enter your email"
                    clearInput
                  />
                </IonItem>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <IonLabel
                    position="stacked"
                    color="medium"
                    className="freelancehub-label"
                  >
                    Password
                  </IonLabel>
                  <IonButton fill="clear" size="small" color="primary">
                    <IonText className="text-xs font-bold">
                      Forgot Password?
                    </IonText>
                  </IonButton>
                </div>
                <IonItem fill="outline" className="rounded-xl">
                  <IonIcon
                    icon={lockClosedOutline}
                    slot="start"
                    color="medium"
                  />
                  <IonInput
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value || "")}
                    placeholder="••••••••"
                    clearInput
                  />
                  <IonButton
                    fill="clear"
                    slot="end"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <IonIcon
                      icon={showPassword ? eyeOffOutline : eyeOutline}
                      color="medium"
                    />
                  </IonButton>
                </IonItem>
              </div>

              {error && (
                <IonText color="danger">
                  <p className="text-xs mt-2">{error}</p>
                </IonText>
              )}

              <IonButton
                expand="block"
                shape="round"
                color="primary"
                size="large"
                className="freelancehub-primary font-bold mt-8"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? <IonSpinner name="crescent" /> : "Sign In"}
              </IonButton>
            </form>
          </IonCardContent>
        </IonCard>

        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <IonText color="medium">
            <span className="text-xs font-medium">OR</span>
          </IonText>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <IonButton
          expand="block"
          fill="outline"
          shape="round"
          size="large"
          color="medium"
          className="freelancehub-secondary"
        >
          <IonIcon icon={logoGoogle} slot="start" />
          Continue with Google
        </IonButton>

        <div className="mt-10 text-center">
          <IonText color="medium">
            <p>
              Don't have an account?{" "}
              <IonButton
                fill="clear"
                color="primary"
                size="small"
                onClick={() => history.push("/signup")}
                className="font-bold"
              >
                Sign Up
              </IonButton>
            </p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
}
