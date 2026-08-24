import React from "react";
import { PageLayout, AppBottomNav } from "@components/layout";
import AnnouncementListView from "@components/announcements/AnnouncementListView";

const AnnouncementListPage: React.FC = () => (
    <PageLayout
        id="announcement-list-page"
        title="Thông báo"
        bottomNav={<AppBottomNav />}
    >
        <AnnouncementListView />
    </PageLayout>
);

export default AnnouncementListPage;
