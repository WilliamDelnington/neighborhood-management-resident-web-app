import React, { Suspense, lazy } from "react";
import { Route, Routes as RouterRoutes } from "react-router-dom";
import { Spinner } from "@components/ui";

const HomePage = lazy(() => import("./Home/HomePage"));
const LoginPage = lazy(() => import("./Login/LoginPage"));
const AccountPage = lazy(() => import("./Account/AccountPage"));
const InteractionHistoryPage = lazy(
    () => import("./Account/InteractionHistoryPage"),
);
const EmergencyPage = lazy(() => import("./Emergency/EmergencyPage"));

const ComplaintCreatePage = lazy(
    () => import("./Complaints/ComplaintCreatePage"),
);
const ComplaintLookupPage = lazy(
    () => import("./Complaints/ComplaintLookupPage"),
);
const ComplaintDetailPage = lazy(
    () => import("./Complaints/ComplaintDetailPage"),
);
const IncidentShortcutPage = lazy(
    () => import("./Complaints/IncidentShortcutPage"),
);

const SupportPage = lazy(() => import("./Support/SupportPage"));
const SupportHowToUsePage = lazy(() => import("./Support/SupportHowToUsePage"));
const SupportTicketCreatePage = lazy(
    () => import("./Support/SupportTicketCreatePage"),
);
const SupportTicketDetailPage = lazy(
    () => import("./Support/SupportTicketDetailPage"),
);
const MySupportTicketsPage = lazy(
    () => import("./Support/MySupportTicketsPage"),
);

const AnnouncementListPage = lazy(
    () => import("./Announcements/AnnouncementListPage"),
);
const AnnouncementDetailPage = lazy(
    () => import("./Announcements/AnnouncementDetailPage"),
);

const CorrespondenceListPage = lazy(
    () => import("./Correspondences/CorrespondenceListPage"),
);
const CorrespondenceDetailPage = lazy(
    () => import("./Correspondences/CorrespondenceDetailPage"),
);
const CorrespondenceComposePage = lazy(
    () => import("./Correspondences/CorrespondenceComposePage"),
);
const MyChangeRequestsPage = lazy(
    () => import("./ChangeRequests/MyChangeRequestsPage"),
);
const MyRequestsPage = lazy(() => import("./Requests/MyRequestsPage"));
const InspectionCampaignListPage = lazy(
    () => import("./Inspections/InspectionCampaignListPage"),
);
const InspectionCampaignDetailPage = lazy(
    () => import("./Inspections/InspectionCampaignDetailPage"),
);
const InspectionFieldCheckPage = lazy(
    () => import("./Inspections/InspectionFieldCheckPage"),
);
const InspectionSelfDeclarationListPage = lazy(
    () => import("./Inspections/InspectionSelfDeclarationListPage"),
);
const InspectionSelfDeclarationPage = lazy(
    () => import("./Inspections/InspectionSelfDeclarationPage"),
);
const MyHousePage = lazy(() => import("./House/MyHousePage"));
const NeighborhoodInfoPage = lazy(
    () => import("./Neighborhood/NeighborhoodInfoPage"),
);

const NotificationsPage = lazy(
    () => import("./Notifications/NotificationsPage"),
);

const MeetingListPage = lazy(() => import("./Meetings/MeetingListPage"));
const MeetingDetailPage = lazy(() => import("./Meetings/MeetingDetailPage"));

const AppointmentServiceListPage = lazy(
    () => import("./Appointments/AppointmentServiceListPage"),
);
const AppointmentBookingPage = lazy(
    () => import("./Appointments/AppointmentBookingPage"),
);
const AppointmentDetailPage = lazy(
    () => import("./Appointments/AppointmentDetailPage"),
);
const MyAppointmentsPage = lazy(
    () => import("./Appointments/MyAppointmentsPage"),
);

const SurveyListPage = lazy(() => import("./Surveys/SurveyListPage"));
const SurveyDetailPage = lazy(() => import("./Surveys/SurveyDetailPage"));

const FilesPage = lazy(() => import("./Files/FilesPage"));

const AdminHomePage = lazy(() => import("./Admin/AdminHomePage"));
const HouseholdListPage = lazy(() => import("./Admin/HouseholdListPage"));
const HouseholdDetailPage = lazy(() => import("./Admin/HouseholdDetailPage"));
const CitizenListPage = lazy(() => import("./Admin/CitizenListPage"));
const CitizenDetailPage = lazy(() => import("./Admin/CitizenDetailPage"));
const HouseListPage = lazy(() => import("./Admin/HouseListPage"));
const HouseDetailPage = lazy(() => import("./Admin/HouseDetailPage"));
const BusinessTypeListPage = lazy(() => import("./Admin/BusinessTypeListPage"));
const BusinessListPage = lazy(() => import("./Admin/BusinessListPage"));
const BusinessDetailPage = lazy(() => import("./Admin/BusinessDetailPage"));

const RouteFallback = () => (
    <div className="flex items-center justify-center h-screen">
        <Spinner />
    </div>
);

const Routes: React.FC = () => (
    <Suspense fallback={<RouteFallback />}>
        <RouterRoutes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route
                path="/account/history"
                element={<InteractionHistoryPage />}
            />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />

            <Route
                path="/complaints/create"
                element={<ComplaintCreatePage />}
            />
            <Route
                path="/complaints/lookup"
                element={<ComplaintLookupPage />}
            />
            <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
            <Route
                path="/complaints/incident-shortcut"
                element={<IncidentShortcutPage />}
            />

            <Route path="/support" element={<SupportPage />} />
            <Route
                path="/support/how-to-use"
                element={<SupportHowToUsePage />}
            />
            <Route
                path="/support/household-assistance"
                element={<SupportTicketCreatePage type="ho_tro_ho_dan" />}
            />
            <Route
                path="/support/report-bug"
                element={<SupportTicketCreatePage type="bao_loi" />}
            />
            <Route
                path="/support/feedback"
                element={<SupportTicketCreatePage type="gop_y" />}
            />
            <Route
                path="/support/tickets/mine"
                element={<MySupportTicketsPage />}
            />
            <Route
                path="/support/tickets/:id"
                element={<SupportTicketDetailPage />}
            />

            <Route path="/announcements" element={<AnnouncementListPage />} />
            <Route
                path="/announcements/:id"
                element={<AnnouncementDetailPage />}
            />

            <Route
                path="/correspondences"
                element={<CorrespondenceListPage />}
            />
            <Route
                path="/correspondences/compose"
                element={<CorrespondenceComposePage />}
            />
            <Route
                path="/correspondences/:id"
                element={<CorrespondenceDetailPage />}
            />

            <Route
                path="/change-requests/mine"
                element={<MyChangeRequestsPage />}
            />
            <Route path="/requests/mine" element={<MyRequestsPage />} />
            <Route
                path="/inspections"
                element={<InspectionCampaignListPage />}
            />
            <Route
                path="/inspections/self-declarations"
                element={<InspectionSelfDeclarationListPage />}
            />
            <Route
                path="/inspections/self-declarations/:targetId"
                element={<InspectionSelfDeclarationPage />}
            />
            <Route
                path="/inspections/:id"
                element={<InspectionCampaignDetailPage />}
            />
            <Route
                path="/inspections/targets/:targetId"
                element={<InspectionFieldCheckPage />}
            />
            <Route path="/house/mine" element={<MyHousePage />} />
            <Route
                path="/neighborhood/mine"
                element={<NeighborhoodInfoPage />}
            />

            <Route path="/meetings" element={<MeetingListPage />} />
            <Route path="/meetings/:id" element={<MeetingDetailPage />} />

            <Route
                path="/appointments/services"
                element={<AppointmentServiceListPage />}
            />
            <Route
                path="/appointments/book/:serviceId"
                element={<AppointmentBookingPage />}
            />
            <Route path="/appointments/mine" element={<MyAppointmentsPage />} />
            <Route
                path="/appointments/:id"
                element={<AppointmentDetailPage />}
            />

            <Route path="/surveys" element={<SurveyListPage />} />
            <Route path="/surveys/:id" element={<SurveyDetailPage />} />

            <Route path="/files" element={<FilesPage />} />

            <Route path="/admin" element={<AdminHomePage />} />
            <Route path="/admin/households" element={<HouseholdListPage />} />
            <Route
                path="/admin/households/:id"
                element={<HouseholdDetailPage />}
            />
            <Route path="/admin/citizens" element={<CitizenListPage />} />
            <Route path="/admin/citizens/:id" element={<CitizenDetailPage />} />
            <Route path="/admin/houses" element={<HouseListPage />} />
            <Route path="/admin/houses/:id" element={<HouseDetailPage />} />
            <Route
                path="/admin/business-types"
                element={<BusinessTypeListPage />}
            />
            <Route path="/admin/businesses" element={<BusinessListPage />} />
            <Route
                path="/admin/businesses/:id"
                element={<BusinessDetailPage />}
            />
        </RouterRoutes>
    </Suspense>
);

export default Routes;
