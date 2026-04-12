import { Navbar } from "./global_components/Navbar/Navbar";


export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center text-3xl">
        TTS DEMO
      </div>
    </div>
  );
}
