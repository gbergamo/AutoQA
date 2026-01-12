import React from 'react';

export interface AuthConfig {
  username?: string;
  password?: string;
  requiresAuth: boolean;
}

export interface TestConfig {
  url: string;
  auth: AuthConfig;
}

export enum TestStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface TestStep {
  id: string;
  action: string;
  selector: string;
  description: string;
  value?: string;
}

export interface TestResult {
  summary: string;
  playwrightCode: string;
  steps: TestStep[];
}

export interface ScreenshotPlaceholder {
  title: string;
  description: string;
  type: 'modal' | 'full-page' | 'component';
}

export interface TestReport {
  executiveSummary: string;
  coverage: string[];
  recommendations: string;
  screenshots: ScreenshotPlaceholder[];
}

export interface IOSCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export interface IOSTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}