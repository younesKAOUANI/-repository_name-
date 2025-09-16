# Customizable UI Components

This project includes highly customizable and reusable Input and Button components with comprehensive logic handling, error management, and multiple variants.

## 🎨 Components Overview

### Input Component
- **3 Variants**: `default`, `outlined`, `filled`
- **Built-in Validation**: Error display, success states
- **Advanced Features**: Password toggle, icons, hints
- **Accessibility**: Proper labeling, focus management

### Button Component  
- **6 Variants**: `primary`, `secondary`, `ghost`, `destructive`, `success`, `warning`
- **3 Sizes**: `sm`, `default`, `lg`, `icon`
- **Interactive States**: Loading, disabled, hover, active
- **Flexible**: Icons, full-width, custom content

## 📁 File Structure

```
src/
├── components/ui/
│   ├── input.tsx           # Input component with 3 variants
│   └── button.tsx          # Button component with 6 variants
├── hooks/
│   ├── useForm.ts          # Form handling hook
│   └── index.ts            # Hooks exports
├── app/
│   ├── components-demo/    # Component showcase
│   └── form-example/       # Practical form example
```

## 🚀 Input Component Usage

### Basic Usage

```tsx
import { Input } from '@/components/ui/input';

<Input
  variant="default"
  label="Email"
  placeholder="Enter your email"
  value={email}
  onValueChange={setEmail}
/>
```

### Variants

#### Default Variant
```tsx
<Input
  variant="default"
  label="Name"
  placeholder="Enter your name"
  leftIcon={<User className="h-4 w-4" />}
  hint="This will be displayed publicly"
/>
```

#### Outlined Variant
```tsx
<Input
  variant="outlined"
  label="Email"
  type="email"
  placeholder="your@email.com"
  leftIcon={<Mail className="h-4 w-4" />}
  error={emailError}
  success={isEmailValid}
/>
```

#### Filled Variant
```tsx
<Input
  variant="filled"
  label="Password"
  type="password"
  showPasswordToggle
  leftIcon={<Lock className="h-4 w-4" />}
/>
```

### Advanced Features

#### Password Input with Toggle
```tsx
<Input
  type="password"
  showPasswordToggle
  leftIcon={<Lock className="h-4 w-4" />}
  onValueChange={handlePasswordChange}
/>
```

#### Error and Success States
```tsx
<Input
  error="Invalid email format"
  // OR
  success={true}
  leftIcon={<Mail className="h-4 w-4" />}
/>
```

#### With Custom Icons
```tsx
<Input
  leftIcon={<Search className="h-4 w-4" />}
  rightIcon={<Filter className="h-4 w-4" />}
  placeholder="Search with filters..."
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'outlined' \| 'filled'` | `'default'` | Visual style variant |
| `error` | `string` | - | Error message to display |
| `success` | `boolean` | - | Show success state |
| `label` | `string` | - | Field label |
| `hint` | `string` | - | Helper text below input |
| `showPasswordToggle` | `boolean` | `false` | Show password visibility toggle |
| `leftIcon` | `ReactNode` | - | Icon on the left side |
| `rightIcon` | `ReactNode` | - | Icon on the right side |
| `onValueChange` | `(value: string) => void` | - | Value change handler |

## 🎯 Button Component Usage

### Basic Usage

```tsx
import { Button } from '@/components/ui/button';

<Button variant="primary" onClick={handleSubmit}>
  Submit
</Button>
```

### Variants

#### Primary (Default)
```tsx
<Button variant="primary">
  Save Changes
</Button>
```

#### Secondary
```tsx
<Button variant="secondary">
  Cancel
</Button>
```

#### Ghost
```tsx
<Button variant="ghost">
  Learn More
</Button>
```

#### Special Variants
```tsx
<Button variant="destructive">Delete</Button>
<Button variant="success">Approve</Button>
<Button variant="warning">Warning</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Search /></Button>
```

### Advanced Features

#### With Icons
```tsx
<Button 
  leftIcon={<Plus className="h-4 w-4" />}
  rightIcon={<ArrowRight className="h-4 w-4" />}
>
  Add New Item
</Button>
```

#### Loading State
```tsx
<Button loading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

#### Full Width
```tsx
<Button fullWidth variant="primary">
  Sign In
</Button>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive' \| 'success' \| 'warning'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'default' \| 'lg' \| 'icon'` | `'default'` | Button size |
| `loading` | `boolean` | `false` | Show loading spinner |
| `leftIcon` | `ReactNode` | - | Icon on the left |
| `rightIcon` | `ReactNode` | - | Icon on the right |
| `fullWidth` | `boolean` | `false` | Take full container width |
| `disabled` | `boolean` | `false` | Disable the button |

## 🎣 useForm Hook

A powerful hook for handling form state, validation, and submission.

### Basic Usage

```tsx
import { useForm } from '@/hooks/useForm';

const { values, errors, handleSubmit, getFieldProps } = useForm({
  initialValues: {
    email: '',
    password: '',
  },
  validationRules: {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      required: true,
      minLength: 8,
    },
  },
  onSubmit: async (data) => {
    await submitForm(data);
  },
});
```

### Validation Rules

```tsx
validationRules: {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value) => {
      if (value.includes('spam')) {
        return 'Spam emails not allowed';
      }
      return null;
    },
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 100,
  },
  confirmPassword: {
    required: true,
    match: 'password', // Must match password field
  },
}
```

### Integration with Components

```tsx
<Input
  label="Email"
  {...getFieldProps('email')}
  leftIcon={<Mail className="h-4 w-4" />}
/>

<Button
  type="submit"
  loading={isSubmitting}
  disabled={!isValid}
  onClick={handleSubmit}
>
  Submit
</Button>
```

## 🎨 Styling & Customization

### CSS Variables
Components use Tailwind CSS classes and can be customized through:

1. **Tailwind Config**: Modify colors, spacing, etc.
2. **CSS Variables**: Override component-specific styles
3. **Props**: Use className prop for custom styles

### Custom Variants
Add new variants by extending the `buttonVariants` or input variant objects:

```tsx
// In button.tsx
const buttonVariants = cva(
  // base styles
  {
    variants: {
      variant: {
        // existing variants...
        custom: "bg-purple-600 text-white hover:bg-purple-700",
      },
    },
  }
);
```

## 📱 Examples

### Sign Up Form
```tsx
import { useForm } from '@/hooks/useForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SignUpForm() {
  const form = useForm({
    initialValues: { name: '', email: '', password: '' },
    validationRules: {
      name: { required: true, minLength: 2 },
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      password: { required: true, minLength: 8 },
    },
    onSubmit: async (data) => {
      await createAccount(data);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <Input label="Name" {...form.getFieldProps('name')} />
      <Input label="Email" type="email" {...form.getFieldProps('email')} />
      <Input 
        label="Password" 
        type="password" 
        showPasswordToggle
        {...form.getFieldProps('password')} 
      />
      <Button 
        type="submit" 
        fullWidth 
        loading={form.isSubmitting}
        disabled={!form.isValid}
      >
        Create Account
      </Button>
    </form>
  );
}
```

## 🚀 Demo Pages

1. **Components Showcase**: `/components-demo` - See all variants and features
2. **Form Example**: `/form-example` - Complete sign-up form with validation

## 🎯 Key Features

✅ **Type Safe**: Full TypeScript support  
✅ **Accessible**: ARIA labels, keyboard navigation  
✅ **Customizable**: Multiple variants and props  
✅ **Reusable**: DRY principle with consistent API  
✅ **Performant**: Optimized re-renders  
✅ **Responsive**: Mobile-friendly design  
✅ **Error Handling**: Comprehensive validation  
✅ **Loading States**: Built-in loading indicators  

## 🔧 Development

The components are built with:
- **React 19** with hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Class Variance Authority** for variant handling

Start the demo:
```bash
npm run dev
# Visit /components-demo or /form-example
```

These components provide a solid foundation for any form-heavy application with consistent design, excellent UX, and maintainable code!
