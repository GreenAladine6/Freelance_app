import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonMenuButton, 
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonBadge,
  IonItem,
  IonList,
  IonLabel,
  IonChip,
  IonSegment,
  IonSegmentButton,
  useIonViewWillEnter
} from "@ionic/react";
import { 
  settingsOutline, 
  timeOutline, 
  briefcaseOutline, 
  storefrontOutline, 
  peopleOutline, 
  walletOutline, 
  warningOutline, 
  trendingUpOutline, 
  checkmarkCircleOutline 
} from "ionicons/icons";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { BottomNavigation } from "../components/BottomNavigation";
import { AdminDrawer } from "../components/AdminDrawer";
import { apiAdminStats, AdminStats } from "../api";
import { useRole } from "../context/RoleContext";

export function DashboardAdmin() {
  const history = useHistory();
  const { accessToken } = useRole();
  const [selectedSegment, setSelectedSegment] = useState("overview");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    apiAdminStats(accessToken).then(setStats).catch(() => {});
  }, [accessToken]);

  useIonViewWillEnter(() => {
    // Initialize any mobile-specific functionality
  });

  return (
    <>
      <AdminDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} menuId="admin-menu" />
      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonMenuButton menu="admin-menu" onClick={() => setIsDrawerOpen(true)} />
            </IonButtons>
            <IonTitle>Admin Dashboard</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear">
                <IonIcon slot="icon-only" icon={settingsOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {/* Quick Stats Segment */}
          <IonSegment 
            value={selectedSegment} 
            onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
          >
            <IonSegmentButton value="overview">
              <IonLabel>Overview</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="analytics">
              <IonLabel>Analytics</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="reports">
              <IonLabel>Reports</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {/* Pending Approvals Card */}
          <IonCard className="ion-margin-vertical">
            <IonCardHeader color="warning">
              <IonCardTitle className="flex items-center justify-between">
                <span>Pending Approvals</span>
                <IonIcon icon={timeOutline} />
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="4" className="text-center">
                    <IonText>
                      <h2 className="font-bold text-2xl m-0">{stats ? stats.pending_applications : "..."}</h2>
                      <p className="text-xs opacity-70 uppercase font-bold m-0">Pending Apps</p>
                    </IonText>
                  </IonCol>
                  <IonCol size="4" className="text-center">
                    <IonText>
                      <h2 className="font-bold text-2xl m-0">{stats ? stats.open_jobs : "..."}</h2>
                      <p className="text-xs opacity-70 uppercase font-bold m-0">Open Jobs</p>
                    </IonText>
                  </IonCol>
                  <IonCol size="4" className="text-center">
                    <IonText>
                      <h2 className="font-bold text-2xl m-0">{stats ? stats.total_users : "..."}</h2>
                      <p className="text-xs opacity-70 uppercase font-bold m-0">Users</p>
                    </IonText>
                  </IonCol>
                </IonRow>
              </IonGrid>
              <IonButton expand="block" color="warning" className="font-bold">
                Review Now
              </IonButton>
            </IonCardContent>
          </IonCard>

          {/* Platform Statistics Card */}
          <IonCard className="ion-margin-vertical">
            <IonCardHeader color="primary">
              <IonCardTitle className="flex items-center justify-between">
                <span>Platform Statistics</span>
                <IonIcon icon={trendingUpOutline} />
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="none">
                <IonItem>
                  <IonIcon icon={peopleOutline} slot="start" color="medium" />
                  <IonLabel>Total Users</IonLabel>
                  <IonBadge color="dark">{stats ? stats.total_users : "..."}</IonBadge>
                </IonItem>
                <IonItem>
                  <IonIcon icon={peopleOutline} slot="start" color="medium" />
                  <IonLabel>Freelancers</IonLabel>
                  <IonBadge color="dark">{stats ? stats.freelancers : "..."}</IonBadge>
                </IonItem>
                <IonItem>
                  <IonIcon icon={briefcaseOutline} slot="start" color="medium" />
                  <IonLabel>Open Jobs</IonLabel>
                  <IonBadge color="dark">{stats ? stats.open_jobs : "..."}</IonBadge>
                </IonItem>
                <IonItem>
                  <IonIcon icon={briefcaseOutline} slot="start" color="medium" />
                  <IonLabel>Total Jobs</IonLabel>
                  <IonBadge color="primary">{stats ? stats.total_jobs : "..."}</IonBadge>
                </IonItem>
                <IonItem>
                  <IonIcon icon={walletOutline} slot="start" color="medium" />
                  <IonLabel>Total Applications</IonLabel>
                  <IonBadge color="success">{stats ? stats.total_applications : "..."}</IonBadge>
                </IonItem>
              </IonList>
              
              {/* Simple chart representation */}
              <div className="h-16 bg-blue-50 rounded-lg flex items-end justify-around p-2 gap-1 mt-4">
                {[40, 60, 30, 80, 50, 90, 70].map((height, i) => (
                  <div 
                    key={i} 
                    className="bg-blue-500 w-full rounded-t-sm" 
                    style={{ height: `${height}%` }} 
                  />
                ))}
              </div>
            </IonCardContent>
          </IonCard>

          {/* Reports & Flags Card */}
          <IonCard className="ion-margin-vertical">
            <IonCardHeader color="danger">
              <IonCardTitle className="flex items-center justify-between">
                <span>Reports & Flags</span>
                <IonIcon icon={warningOutline} />
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="flex items-center justify-between">
                <div>
                  <IonText>
                    <h2 className="font-bold text-2xl text-red-600 m-0">5</h2>
                    <p className="text-xs opacity-70 uppercase font-bold m-0">Pending Reports</p>
                  </IonText>
                </div>
                <IonButton color="danger" size="small" className="font-bold">
                  Moderate
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Quick Actions */}
          <div className="ion-margin-vertical">
            <IonText color="medium">
              <h3 className="text-xs font-bold uppercase tracking-widest">System Actions</h3>
            </IonText>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {["Validate Profiles", "Review Gigs", "Manage Categories", "Analytics"].map((action, i) => (
                <IonChip 
                  key={i} 
                  color={i === 0 ? "primary" : "medium"}
                  className="whitespace-nowrap"
                >
                  <IonLabel className="font-bold text-xs">{action}</IonLabel>
                </IonChip>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="ion-margin-vertical">
            <IonText color="medium">
              <h3 className="text-xs font-bold uppercase tracking-widest">Admin Logs</h3>
            </IonText>
            <IonCard>
              <IonList>
                {[
                  { 
                    action: "Approved freelancer: John Doe", 
                    time: "5m ago", 
                    icon: checkmarkCircleOutline, 
                    color: "success" 
                  },
                  { 
                    action: "Deleted flagged product #892", 
                    time: "2h ago", 
                    icon: warningOutline, 
                    color: "danger" 
                  },
                  { 
                    action: "Updated Category: Design", 
                    time: "5h ago", 
                    icon: settingsOutline, 
                    color: "primary" 
                  },
                ].map((log, i) => (
                  <IonItem key={i}>
                    <IonIcon 
                      icon={log.icon} 
                      slot="start" 
                      color={log.color}
                    />
                    <IonLabel>
                      <h3 className="font-medium">{log.action}</h3>
                      <p className="text-xs opacity-70 font-bold">{log.time}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonCard>
          </div>
        </IonContent>

        <BottomNavigation />
      </IonPage>
    </>
  );
}
