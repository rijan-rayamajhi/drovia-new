import { InputHTMLAttributes, useState } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value !== '' && props.value !== undefined;

  return (
    <div className="relative">
      {label && (
        <label
          className={`absolute left-5 transition-all duration-300 ease-out pointer-events-none ${
            hasValue || focused
              ? 'top-2 text-xs text-accent font-medium'
              : 'top-4 text-[15px] text-text-muted'
          }`}
        >
          {label}
        </label>
      )}
      <input
        className={`input-field ${label ? 'pt-7 pb-3' : ''} ${error ? 'border-error focus:ring-error' : ''} ${className}`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-error text-sm mt-2 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

