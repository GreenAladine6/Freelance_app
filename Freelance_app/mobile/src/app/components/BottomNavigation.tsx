import { 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel, 
  IonBadge,
  IonTabs,
  IonRouterOutlet
} from "@ionic/react";
import { 
  homeOutline, 
  home,
  briefcaseOutline,
  briefcase,
  chatbubbleOutline,
  chatbubble,
  storefrontOutline,
  storefront,
  personOutline,
  person,
  searchOutline,
  search,
  folderOutline,
  folder,
  shieldOutline,
  shield,
  pieChartOutline,
  pieChart,
  settingsOutline,
  settings
} from "ionicons/icons";
import { useHistory, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";

export function BottomNavigation() {
  const history = useHistory();
  const location = useLocation();
  const { role } = useRole();

  const getNavItems = () => {
    switch (role) {
      case "client":
        return [
          { 
            icon: homeOutline, 
            activeIcon: home,
            label: "Home", 
            path: "/dashboard-client",
            tab: "home"
          },
          { 
            icon: searchOutline, 
            activeIcon: search,
            label: "Browse", 
            path: "/browse",
            tab: "browse"
          },
          { 
            icon: folderOutline, 
            activeIcon: folder,
            label: "My Jobs", 
            path: "/gigs",
            tab: "projects"
          },
          { 
            icon: chatbubbleOutline, 
            activeIcon: chatbubble,
            label: "Messages", 
            path: "/messages",
            tab: "messages",
            badge: true
          },
          { 
            icon: personOutline, 
            activeIcon: person,
            label: "Profile", 
            path: "/profile-client",
            tab: "profile"
          },
        ];
      case "admin":
        return [
          { 
            icon: homeOutline, 
            activeIcon: home,
            label: "Dashboard", 
            path: "/dashboard-admin",
            tab: "dashboard"
          },
          { 
            icon: shieldOutline, 
            activeIcon: shield,
            label: "Moderate", 
            path: "/dashboard-admin",
            tab: "moderation",
            badge: true,
            badgeColor: "warning"
          },
          { 
            icon: pieChartOutline, 
            activeIcon: pieChart,
            label: "Analytics", 
            path: "/dashboard-admin",
            tab: "analytics"
          },
          { 
            icon: settingsOutline, 
            activeIcon: settings,
            label: "Settings", 
            path: "/profile-admin",
            tab: "settings"
          },
        ];
      default: // freelancer
        return [
          { 
            icon: homeOutline, 
            activeIcon: home,
            label: "Home", 
            path: "/dashboard",
            tab: "home"
          },
          { 
            icon: briefcaseOutline, 
            activeIcon: briefcase,
            label: "My Gigs", 
            path: "/gigs",
            tab: "gigs"
          },
          { 
            icon: chatbubbleOutline, 
            activeIcon: chatbubble,
            label: "Messages", 
            path: "/messages",
            tab: "messages",
            badge: true
          },
          { 
            icon: storefrontOutline, 
            activeIcon: storefront,
            label: "Store", 
            path: "/store",
            tab: "store"
          },
          { 
            icon: personOutline, 
            activeIcon: person,
            label: "Profile", 
            path: "/profile",
            tab: "profile"
          },
        ];
    }
  };

  const navItems = getNavItems();
  
  const getCurrentTab = () => {
    const currentItem = navItems.find(item => {
      if (item.path === "/messages") {
        return location.pathname.startsWith("/messages");
      }
      return location.pathname === item.path;
    });
    return currentItem?.tab || navItems[0]?.tab;
  };

  const handleTabChange = (selectedTab: string) => {
    const item = navItems.find(nav => nav.tab === selectedTab);
    if (item) {
      history.push(item.path);
    }
  };

  return (
    <IonTabBar 
      slot="bottom" 
      selectedTab={getCurrentTab()}
      onIonTabsWillChange={(e) => handleTabChange(e.detail.tab)}
    >
      {navItems.map((item) => {
        const isActive = getCurrentTab() === item.tab;
        
        return (
          <IonTabButton 
            key={item.tab} 
            tab={item.tab}
            onClick={() => history.push(item.path)}
          >
            <IonIcon 
              icon={isActive ? item.activeIcon : item.icon}
              color={isActive ? "primary" : "medium"}
            />
            <IonLabel color={isActive ? "primary" : "medium"}>
              {item.label}
            </IonLabel>
            {item.badge && (
              <IonBadge 
                color={item.badgeColor || "danger"}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  minWidth: '8px',
                  height: '8px',
                  borderRadius: '50%'
                }}
              />
            )}
          </IonTabButton>
        );
      })}
    </IonTabBar>
  );
}

