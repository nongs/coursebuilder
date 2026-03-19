import React from 'react';
import '@styles/components/_radio.scss';

export type RadioVariant = 'pill' | 'dot';

export interface RadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label?: string;
  variant?: RadioVariant;
}

const Radio: React.FC<RadioProps> = ({
  name,
  value,
  checked,
  onChange,
  label,
  variant = 'pill'
}) => {
  return (
    <label className={`cb-radio ${variant === 'dot' ? 'cb-radio--dot' : 'cb-radio--pill'}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span className="cb-radio__control" aria-hidden="true" />
      {label ? <span className="cb-radio__label">{label}</span> : null}
    </label>
  );
};

export default Radio;

