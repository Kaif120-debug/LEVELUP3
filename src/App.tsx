/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { UpdatePasswordPage } from './pages/UpdatePasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { FitnessPage } from './pages/FitnessPage';
import { FitnessPlanPage } from './pages/FitnessPlanPage';
import { NutritionPage } from './pages/NutritionPage';
import { CareerPage } from './pages/CareerPage';
import { CareerTrackerPage } from './pages/CareerTrackerPage';
import { PlannerPage } from './pages/PlannerPage';
import { StudentPage } from './pages/StudentPage';
import { CreatorCalendarPage } from './pages/CreatorCalendarPage';
import { CreatorBrandPage } from './pages/CreatorBrandPage';
import { CareerPortfolioPage } from './pages/CareerPortfolioPage';
import { CareerInterviewPrepPage } from './pages/CareerInterviewPrepPage';
import { PublicPortfolioPage } from './pages/PublicPortfolioPage';
import { FinancePage } from './pages/FinancePage';
import { BusinessPage } from './pages/BusinessPage';
import { AIModal } from './components/AIModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SettingsModal } from './components/SettingsModal';
import { UpgradeModal } from './components/UpgradeModal';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage initialMode="signup" />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/update-password" element={<UpdatePasswordPage />} />
            <Route path="/reset-password" element={<UpdatePasswordPage />} />
            <Route path="/p/:slug" element={<PublicPortfolioPage />} />
            <Route path="/portfolio-site/:id" element={<PublicPortfolioPage />} />

            {/* Protected Routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fitness"
              element={
                <ProtectedRoute>
                  <FitnessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fitness-plan"
              element={
                <ProtectedRoute>
                  <FitnessPlanPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/nutrition"
              element={
                <ProtectedRoute>
                  <NutritionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/diet-plan"
              element={
                <ProtectedRoute>
                  <NutritionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career"
              element={
                <ProtectedRoute>
                  <CareerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career/portfolio"
              element={
                <ProtectedRoute>
                  <CareerPortfolioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <CareerPortfolioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career-tracker"
              element={
                <ProtectedRoute>
                  <CareerTrackerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview-prep"
              element={
                <ProtectedRoute>
                  <CareerInterviewPrepPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/career/interview-prep"
              element={
                <ProtectedRoute>
                  <CareerInterviewPrepPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <PlannerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <StudentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator-calendar"
              element={
                <ProtectedRoute>
                  <CreatorCalendarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator-brand"
              element={
                <ProtectedRoute>
                  <CreatorBrandPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/business"
              element={
                <ProtectedRoute>
                  <BusinessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance"
              element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <AIModal />
          <NotificationsModal />
          <SettingsModal />
          <UpgradeModal />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
