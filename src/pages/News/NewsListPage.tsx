import React from "react";
import { PageLayout, AppBottomNav } from "@components/layout";
import NewsListView from "@components/news/NewsListView";

const NewsListPage: React.FC = () => (
    <PageLayout id="news-list-page" title="Tin tức" bottomNav={<AppBottomNav />}>
        <NewsListView />
    </PageLayout>
);

export default NewsListPage;
