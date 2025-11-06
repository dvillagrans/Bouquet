"use client";
import React from "react";
import { WelcomeScreen } from "@/components/ui/welcome-screen";

interface WelcomeGateProps {
    children: React.ReactNode;
}

export function WelcomeGate({ children }: WelcomeGateProps) {
    const [showWelcome, setShowWelcome] = React.useState(true);

    return (
        <div className="min-h-screen bg-champagne relative">
            {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}
            <div className={`${showWelcome ? 'pointer-events-none select-none' : 'opacity-100'} transition-opacity duration-500`}>{children}</div>
        </div>
    );
}
