/**
 * Animation Demo Page
 * Demonstrates how to use the animation service in your Pharmapedia app
 */

'use client';

import { 
  AnimatedContainer, 
  AnimatedButton, 
  AnimatedCard, 
  StaggerList, 
  QuizQuestion,
  QuizOption,
  LoadingSpinner,
  PulseLoader,
  FadeInWhenVisible 
} from "@/components/ui/animated";
import { useState } from "react";

export default function AnimationDemo() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const quizOptions = [
    { id: 1, text: "Acetaminophen", isCorrect: true },
    { id: 2, text: "Aspirin", isCorrect: false },
    { id: 3, text: "Ibuprofen", isCorrect: false },
    { id: 4, text: "Naproxen", isCorrect: false }
  ];

  const listItems = [
    "Study Year Management",
    "Module Organization", 
    "Quiz Creation",
    "Progress Tracking",
    "License Management"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <AnimatedContainer 
          animationType="slideFromTop"
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pharmapedia Animation Demo
          </h1>
          <p className="text-xl text-gray-600">
            Showcasing Framer Motion animations for our pharmacy education platform
          </p>
        </AnimatedContainer>

        {/* Basic Animations Section */}
        <section className="space-y-8">
          <AnimatedContainer animationType="slideFromLeft">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Basic Animations</h2>
          </AnimatedContainer>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatedContainer animationType="fade" className="delay-100">
              <AnimatedCard>
                <h3 className="font-semibold text-lg mb-2">Fade In</h3>
                <p className="text-gray-600">Smooth opacity transition</p>
              </AnimatedCard>
            </AnimatedContainer>

            <AnimatedContainer animationType="slideFromBottom" className="delay-200">
              <AnimatedCard>
                <h3 className="font-semibold text-lg mb-2">Slide Up</h3>
                <p className="text-gray-600">Slides in from bottom</p>
              </AnimatedCard>
            </AnimatedContainer>

            <AnimatedContainer animationType="scale" className="delay-300">
              <AnimatedCard>
                <h3 className="font-semibold text-lg mb-2">Scale</h3>
                <p className="text-gray-600">Scales up into view</p>
              </AnimatedCard>
            </AnimatedContainer>

            <AnimatedContainer animationType="slideFromRight" className="delay-400">
              <AnimatedCard>
                <h3 className="font-semibold text-lg mb-2">Slide Left</h3>
                <p className="text-gray-600">Slides in from right</p>
              </AnimatedCard>
            </AnimatedContainer>
          </div>
        </section>

        {/* Interactive Elements */}
        <section className="space-y-8">
          <AnimatedContainer animationType="slideFromLeft">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Interactive Elements</h2>
          </AnimatedContainer>

          <div className="flex flex-wrap gap-4">
            <AnimatedButton variant="primary">
              Primary Button
            </AnimatedButton>
            <AnimatedButton variant="secondary">
              Secondary Button  
            </AnimatedButton>
            <AnimatedButton variant="outline">
              Outline Button
            </AnimatedButton>
            <AnimatedButton disabled>
              Disabled Button
            </AnimatedButton>
          </div>
        </section>

        {/* Stagger Animation */}
        <section className="space-y-8">
          <AnimatedContainer animationType="slideFromLeft">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Stagger Animation</h2>
          </AnimatedContainer>

          <StaggerList className="space-y-4">
            {listItems.map((item, index) => (
              <AnimatedCard key={index} hoverable className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-800">{item}</span>
                </div>
              </AnimatedCard>
            ))}
          </StaggerList>
        </section>

        {/* Quiz Demo */}
        <section className="space-y-8">
          <AnimatedContainer animationType="slideFromLeft">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quiz Animation Demo</h2>
          </AnimatedContainer>

          <QuizQuestion className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">
              Which medication is commonly used to reduce fever?
            </h3>
            
            <div className="space-y-3">
              {quizOptions.map((option) => (
                <QuizOption
                  key={option.id}
                  isSelected={selectedOption === option.id}
                  isCorrect={showResult && option.isCorrect}
                  isIncorrect={showResult && selectedOption === option.id && !option.isCorrect}
                  onClick={() => setSelectedOption(option.id)}
                  className="w-full text-left"
                >
                  {option.text}
                </QuizOption>
              ))}
            </div>

            <div className="mt-6 flex gap-4">
              <AnimatedButton 
                onClick={() => setShowResult(true)}
                disabled={!selectedOption}
              >
                Submit Answer
              </AnimatedButton>
              <AnimatedButton 
                variant="outline"
                onClick={() => {
                  setSelectedOption(null);
                  setShowResult(false);
                }}
              >
                Reset
              </AnimatedButton>
            </div>
          </QuizQuestion>
        </section>

        {/* Loading States */}
        <section className="space-y-8">
          <AnimatedContainer animationType="slideFromLeft">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Loading Animations</h2>
          </AnimatedContainer>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCard className="text-center">
              <h3 className="font-semibold text-lg mb-4">Spinner</h3>
              <LoadingSpinner size="lg" className="mx-auto" />
            </AnimatedCard>

            <AnimatedCard className="text-center">
              <h3 className="font-semibold text-lg mb-4">Pulse Effect</h3>
              <PulseLoader>
                <div className="w-16 h-16 bg-blue-500 rounded-lg mx-auto"></div>
              </PulseLoader>
            </AnimatedCard>

            <AnimatedCard className="text-center">
              <h3 className="font-semibold text-lg mb-4">Loading Button</h3>
              <AnimatedButton className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Loading...</span>
              </AnimatedButton>
            </AnimatedCard>
          </div>
        </section>

        {/* Scroll-triggered Animation */}
        <section className="space-y-8">
          <AnimatedContainer animationType="slideFromLeft">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Scroll-triggered Animation</h2>
          </AnimatedContainer>

          <div className="space-y-8">
            {[1, 2, 3].map((item) => (
              <FadeInWhenVisible key={item}>
                <AnimatedCard className="h-32 flex items-center justify-center">
                  <h3 className="text-xl font-semibold">
                    This card animates when scrolled into view #{item}
                  </h3>
                </AnimatedCard>
              </FadeInWhenVisible>
            ))}
          </div>
        </section>

        {/* Footer */}
        <FadeInWhenVisible>
          <div className="text-center py-12">
            <p className="text-gray-600">
              These animations are powered by Framer Motion and ready to use in your Pharmapedia components!
            </p>
          </div>
        </FadeInWhenVisible>

      </div>
    </div>
  );
}
