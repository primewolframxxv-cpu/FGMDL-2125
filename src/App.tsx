/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StepId, CheckinAnswers } from './types/index.ts';
import {
  INITIAL_FORTUNE_COOKIES,
  INITIAL_SONG_DETAILS,
  INITIAL_FRED_LETTER,
} from './data/fortuneQuotes.ts';
import { FloralBackground } from './components/FloralBackground.tsx';
import { FloralHeader } from './components/FloralHeader.tsx';
import { GatekeeperPart } from './components/GatekeeperPart.tsx';
import { IntroPart } from './components/IntroPart.tsx';
import { QuestionsPart } from './components/QuestionsPart.tsx';
import { FortuneCookiesPart } from './components/FortuneCookiesPart.tsx';
import { PuzzlePart } from './components/PuzzlePart.tsx';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepId>(() => {
    const saved = localStorage.getItem('pumpkin_current_step');
    return (saved as StepId) || 'GATE';
  });

  const [unlockedSteps, setUnlockedSteps] = useState<Set<StepId>>(() => {
    const saved = localStorage.getItem('pumpkin_unlocked_steps');
    return saved ? new Set(JSON.parse(saved)) : new Set<StepId>(['GATE']);
  });

  const [checkinAnswers, setCheckinAnswers] = useState<CheckinAnswers>(() => {
    const saved = localStorage.getItem('pumpkin_checkin_answers');
    return saved
      ? JSON.parse(saved)
      : {
          mood: 7,
          moodNote: '',
          academics: 7,
          academicsNote: '',
          christmas: 8,
          christmasNote: '',
        };
  });

  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('pumpkin_current_step', currentStep);
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem(
      'pumpkin_unlocked_steps',
      JSON.stringify(Array.from(unlockedSteps))
    );
  }, [unlockedSteps]);

  useEffect(() => {
    localStorage.setItem('pumpkin_checkin_answers', JSON.stringify(checkinAnswers));
  }, [checkinAnswers]);

  const unlockNextStep = (nextStep: StepId) => {
    setUnlockedSteps((prev) => new Set([...prev, nextStep]));
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden pb-10">
      {/* Background with floral illustrations and floating petals */}
      <FloralBackground />

      {/* Header with simple PART I .. PART V links */}
      <FloralHeader
        currentStep={currentStep}
        unlockedSteps={unlockedSteps}
        onSelectStep={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isAudioMuted={isAudioMuted}
        onToggleMute={() => setIsAudioMuted((prev) => !prev)}
      />

      {/* Main Content Sections */}
      <main className="relative z-10 flex-1 flex flex-col justify-center">
        {currentStep === 'GATE' && (
          <GatekeeperPart
            onUnlock={() => unlockNextStep('INTRO')}
            isAudioMuted={isAudioMuted}
          />
        )}

        {currentStep === 'INTRO' && (
          <IntroPart onContinue={() => unlockNextStep('QUESTIONS')} />
        )}

        {currentStep === 'QUESTIONS' && (
          <QuestionsPart
            answers={checkinAnswers}
            onUpdateAnswers={setCheckinAnswers}
            onContinue={() => unlockNextStep('COOKIES')}
            isAudioMuted={isAudioMuted}
          />
        )}

        {currentStep === 'COOKIES' && (
          <FortuneCookiesPart
            cookies={INITIAL_FORTUNE_COOKIES}
            songDetails={INITIAL_SONG_DETAILS}
            onProceedToPuzzle={() => unlockNextStep('PUZZLE')}
            isAudioMuted={isAudioMuted}
          />
        )}

        {currentStep === 'PUZZLE' && (
          <PuzzlePart
            customMessage={INITIAL_FRED_LETTER}
            isAudioMuted={isAudioMuted}
          />
        )}
      </main>
    </div>
  );
}
