import react, { ChangeEvent } from 'react';
import '../globals.css';
interface InputTextboxProps {
  value?: string;
  name: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  type?: React.HTMLInputTypeAttribute;
  [key: string]: any;
}

const InputTextbox: React.FC<InputTextboxProps> = ({
  value,
  name,
  onChange,
  label,
  placeholder,
  className,
  id,
  type = 'text',
  ...restProps
}) => {
  return (
    <div>
      {label && (
        <label htmlFor={id || name} className="">
          {label}
        </label>
      )}
      <input
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={textbox || className}
        {...restProps}
      />
    </div>
  );
};
