import { 
  IonMenu, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonIcon, 
  IonLabel, 
  IonAvatar, 
  IonBadge,
  IonFooter,
  IonButton,
  IonText,
  IonChip
} from "@ionic/react";
import { 
  speedometerOutline, 
  peopleOutline, 
  flagOutline, 
  pricetagsOutline, 
  barChartOutline, 
  settingsOutline, 
  logOutOutline, 
  chevronForwardOutline 
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menuId?: string;
}

export function AdminDrawer({ isOpen, onClose, menuId = "admin-menu" }: AdminDrawerProps) {
  const history = useHistory();
  const location = useLocation();
  const { logout } = useRole();

  const menuItems = [
    { label: "Dashboard", icon: speedometerOutline, path: "/dashboard-admin", active: true },
    { 
      label: "User Management", 
      icon: peopleOutline, 
      subItems: ["Freelancers", "Clients", "Blocked Users"],
      badge: 0
    },
    { 
      label: "Content Moderation", 
      icon: flagOutline, 
      subItems: ["Pending Gigs", "Pending Products", "Reports"],
      badge: 12
    },
    { label: "Categories & Tags", icon: pricetagsOutline },
    { label: "Analytics", icon: barChartOutline },
    { label: "System Settings", icon: settingsOutline },
  ];

  const handleLogout = () => {
    logout();
    history.push("/login");
  };

  const handleNavigation = (path: string) => {
    if (path) {
      history.push(path);
      onClose();
    }
  };

  return (
    <IonMenu 
      side="start" 
      menuId={menuId} 
      contentId="main-content"
      type="overlay"
    >
      <IonHeader>
        <IonToolbar style={{ '--background': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}>
          <div className="flex items-center gap-4 p-4">
            <IonAvatar>
              <img src="https://i.pravatar.cc/150?u=admin" alt="Admin" />
            </IonAvatar>
            <div>
              <IonText color="light">
                <h3 className="text-lg font-bold m-0">Admin Sarah</h3>
              </IonText>
              <IonChip color="light" style={{ '--background': 'rgba(255,255,255,0.2)' }}>
                <IonLabel className="text-xs font-bold uppercase">System Administrator</IonLabel>
              </IonChip>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding-vertical">
        <IonList>
          {menuItems.map((item, i) => (
            <IonItem 
              key={i}
              button
              onClick={() => handleNavigation(item.path || '')}
              className={item.path === location.pathname ? 'ion-activated' : ''}
              color={item.path === location.pathname ? 'primary' : undefined}
            >
              <IonIcon icon={item.icon} slot="start" />
              <IonLabel>
                <h3 className="font-semibold">{item.label}</h3>
              </IonLabel>
              {item.badge ? (
                <IonBadge color="warning" slot="end">{item.badge}</IonBadge>
              ) : null}
              {item.subItems && (
                <IonIcon icon={chevronForwardOutline} slot="end" />
              )}
            </IonItem>
          ))}
        </IonList>
      </IonContent>

      <IonFooter className="ion-no-border">
        <IonToolbar>
          <div className="p-4">
            <IonText color="medium">
              <p className="text-xs font-bold uppercase tracking-widest m-0 mb-2">v1.0.0 Stable</p>
            </IonText>
            <IonButton 
              fill="clear" 
              size="small" 
              color="primary"
              className="font-bold"
            >
              Help & Support Center
            </IonButton>
            <IonButton
              fill="clear"
              color="danger"
              onClick={handleLogout}
              className="mt-2 font-bold"
            >
              <IonIcon icon={logOutOutline} slot="start" />
              Logout
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  );
}
