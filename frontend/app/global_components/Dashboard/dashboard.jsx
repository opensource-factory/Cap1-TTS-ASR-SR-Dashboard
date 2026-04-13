"use client";

import { DashboardLayout } from "./components/DashboardLayout";
import { useDashboardState } from "./components/useDashboardState";

export const Dashboard = () => {
  const { navbarProps, promptbarProps, conversation } = useDashboardState();

  return (
    <DashboardLayout
      navbarProps={navbarProps}
      promptbarProps={promptbarProps}
      conversation={conversation}
    />
  );
};
