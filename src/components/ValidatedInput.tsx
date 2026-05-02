import React, { useState } from 'react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationFn: (value: string) => string | null;
  onValidChange: (isValid: boolean) => void;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({ validationFn, onValidChange, className, onChange, ...props }) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    }
    const valError = validationFn(e.target.value);
    setError(valError);
    onValidChange(valError === null);
  };

  return (
    <div className="flex flex-col w-full">
      <input
        {...props}
        onChange={handleChange}
        className={`${className} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'focus:border-emerald-500 focus:ring-emerald-500'}`}
        aria-invalid={!!error}
        aria-errormessage={error ? `${props.id}-error` : undefined}
      />
      {error && (
        <span id={`${props.id}-error`} className="text-red-400 text-xs mt-1 font-medium bg-red-500/10 px-2 py-1 rounded inline-block w-fit">
          {error}
        </span>
      )}
    </div>
  );
};
