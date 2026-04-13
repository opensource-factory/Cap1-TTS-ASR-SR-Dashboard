"use client";

import { Navbar } from "../../Navbar/Navbar";
import { Promptbar } from "../../Promptbar/promptbar";
import { Visual } from "../../Visual/visual";

export const DashboardLayout = ({ navbarProps, promptbarProps, conversation }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar {...navbarProps} />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-1 flex-col px-4 pb-12 pt-8 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16">
        <Visual conversation={conversation} />

        <div className="mt-auto">
          <Promptbar {...promptbarProps} />
        </div>
      </main>
    </div>
  );
};
