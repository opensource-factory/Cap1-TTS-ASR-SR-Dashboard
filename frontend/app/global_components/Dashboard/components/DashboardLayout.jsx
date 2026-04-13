"use client";

import { Navbar } from "../../Navbar/Navbar";
import { Promptbar } from "../../Promptbar/promptbar";
import { Visual } from "../../Visual/visual";

export const DashboardLayout = ({ navbarProps, promptbarProps, conversation }) => {
  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <Navbar {...navbarProps} />

      <main className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 pt-8 sm:px-6 lg:px-8">
        <Visual conversation={conversation} />

        <div className="sticky bottom-0 z-10 border-t border-foreground/8 bg-background/95 py-4 backdrop-blur sm:py-5 lg:py-6">
          <Promptbar {...promptbarProps} />
        </div>
      </main>
    </div>
  );
};
