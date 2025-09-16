# Framer Motion Animation Service

This animation service provides a comprehensive set of reusable animations for the Pharmapedia platform using Framer Motion.

## 🚀 Quick Start

```bash
npm install framer-motion  # Already installed
```

## 📁 File Structure

```
src/
├── lib/
│   └── animations.ts          # Animation variants and presets
└── components/
    └── ui/
        └── animated.tsx       # Pre-built animated components
```

## 🎯 Animation Variants

### Basic Animations

```tsx
import { fadeVariants, slideVariants, scaleVariants } from '@/lib/animations';

// Fade animation
<motion.div variants={fadeVariants} initial="hidden" animate="visible">
  Content
</motion.div>

// Slide animations (fromLeft, fromRight, fromTop, fromBottom)
<motion.div variants={slideVariants.fromLeft} initial="hidden" animate="visible">
  Content
</motion.div>

// Scale animation
<motion.div variants={scaleVariants} initial="hidden" animate="visible">
  Content
</motion.div>
```

### Interactive Animations

```tsx
import { bounceVariants, cardVariants } from '@/lib/animations';

// Button with hover/tap effects
<motion.button 
  variants={bounceVariants}
  initial="rest"
  whileHover="hover"
  whileTap="tap"
>
  Click me
</motion.button>

// Card with hover effects
<motion.div 
  variants={cardVariants}
  initial="rest"
  whileHover="hover"
>
  Card content
</motion.div>
```

### Quiz-Specific Animations

```tsx
import { quizQuestionVariants, answerOptionVariants } from '@/lib/animations';

// Animated quiz question
<motion.div variants={quizQuestionVariants} initial="hidden" animate="visible">
  What is the capital of France?
</motion.div>

// Animated answer options
<motion.div 
  variants={answerOptionVariants}
  animate={isCorrect ? "correct" : isSelected ? "selected" : "rest"}
>
  Paris
</motion.div>
```

### Stagger Animations

```tsx
import { staggerContainer, staggerItem } from '@/lib/animations';

<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  {items.map((item, index) => (
    <motion.div key={index} variants={staggerItem}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

## 🧩 Pre-built Components

### AnimatedContainer

Generic container with common animation types:

```tsx
import { AnimatedContainer } from '@/components/ui/animated';

<AnimatedContainer animationType="fade">
  Content that fades in
</AnimatedContainer>

<AnimatedContainer animationType="slideFromLeft">
  Content that slides from left
</AnimatedContainer>
```

Available animation types:
- `fade`
- `slideFromLeft`
- `slideFromRight` 
- `slideFromTop`
- `slideFromBottom`
- `scale`

### AnimatedButton

Button with built-in hover and tap animations:

```tsx
import { AnimatedButton } from '@/components/ui/animated';

<AnimatedButton variant="primary" onClick={() => {}}>
  Primary Button
</AnimatedButton>

<AnimatedButton variant="outline" disabled>
  Disabled Button
</AnimatedButton>
```

### AnimatedCard

Card component with hover effects:

```tsx
import { AnimatedCard } from '@/components/ui/animated';

<AnimatedCard hoverable>
  Card content with hover animation
</AnimatedCard>

<AnimatedCard hoverable={false}>
  Static card (just fades in)
</AnimatedCard>
```

### StaggerList

Automatically animates list items with stagger effect:

```tsx
import { StaggerList } from '@/components/ui/animated';

<StaggerList className="space-y-4" staggerDelay={0.1}>
  {items.map(item => (
    <div key={item.id}>{item.content}</div>
  ))}
</StaggerList>
```

### Quiz Components

Specialized components for quiz interfaces:

```tsx
import { QuizQuestion, QuizOption } from '@/components/ui/animated';

<QuizQuestion questionNumber={1}>
  <h3>What is the molecular formula for aspirin?</h3>
  
  {options.map(option => (
    <QuizOption
      key={option.id}
      isSelected={selectedId === option.id}
      isCorrect={showAnswer && option.correct}
      isIncorrect={showAnswer && selectedId === option.id && !option.correct}
      onClick={() => setSelectedId(option.id)}
    >
      {option.text}
    </QuizOption>
  ))}
</QuizQuestion>
```

### Loading Components

```tsx
import { LoadingSpinner, PulseLoader } from '@/components/ui/animated';

<LoadingSpinner size="lg" />

<PulseLoader>
  <div>Content that pulses</div>
</PulseLoader>
```

### Scroll-triggered Animations

```tsx
import { FadeInWhenVisible } from '@/components/ui/animated';

<FadeInWhenVisible threshold={0.1}>
  <div>Animates when 10% visible</div>
</FadeInWhenVisible>
```

### Page Transitions

```tsx
import { PageTransition } from '@/components/ui/animated';

export default function MyPage() {
  return (
    <PageTransition>
      <div>Page content with enter/exit animations</div>
    </PageTransition>
  );
}
```

## ⚡ Utility Functions

### Create Custom Stagger

```tsx
import { createStaggerAnimation } from '@/lib/animations';

const customStagger = createStaggerAnimation(0.2, 0.5); // delay, child delay

<motion.div variants={customStagger.container} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.div key={item.id} variants={customStagger.item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## 🎨 Animation Presets

Import all presets at once:

```tsx
import { animationPresets } from '@/lib/animations';

// Use any preset
<motion.div variants={animationPresets.fade} initial="hidden" animate="visible">
  Content
</motion.div>

<motion.button variants={animationPresets.button} initial="rest" whileHover="hover">
  Button
</motion.button>
```

Available presets:
- `animationPresets.card`
- `animationPresets.button` 
- `animationPresets.page`
- `animationPresets.quiz.question`
- `animationPresets.quiz.option`
- `animationPresets.loading.spinner`
- `animationPresets.loading.pulse`
- `animationPresets.fade`
- `animationPresets.scale`
- `animationPresets.slide.fromLeft` (and other directions)
- `animationPresets.stagger.container`
- `animationPresets.stagger.item`

## 🧪 Demo

Visit `/animation-demo` to see all animations in action.

## 🎯 Best Practices

1. **Performance**: Use `AnimatePresence` for exit animations
2. **Accessibility**: Respect `prefers-reduced-motion`
3. **Consistency**: Stick to the predefined animation durations and easings
4. **Semantic HTML**: Ensure animations don't break screen readers

## 🔧 Customization

You can extend the animation service by:

1. Adding new variants to `animations.ts`
2. Creating new animated components in `animated.tsx`
3. Modifying existing animations to match your design system

## 📝 Example Usage in Pharmapedia

```tsx
// Study module card
<AnimatedCard hoverable>
  <h3>Pharmacology Basics</h3>
  <p>Learn fundamental concepts...</p>
  <AnimatedButton>Start Module</AnimatedButton>
</AnimatedCard>

// Quiz interface
<QuizQuestion questionNumber={currentQuestion}>
  <h2>{question.text}</h2>
  {question.options.map(option => (
    <QuizOption
      key={option.id}
      isSelected={selectedAnswer === option.id}
      onClick={() => setSelectedAnswer(option.id)}
    >
      {option.text}
    </QuizOption>
  ))}
</QuizQuestion>

// Progress indicators
<StaggerList>
  {modules.map(module => (
    <AnimatedContainer key={module.id} animationType="slideFromLeft">
      <ModuleProgressCard module={module} />
    </AnimatedContainer>
  ))}
</StaggerList>
```

This animation service is designed specifically for the Pharmapedia educational platform, providing smooth, professional animations that enhance the learning experience.
