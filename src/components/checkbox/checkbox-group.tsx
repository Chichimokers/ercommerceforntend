import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Checkbox = dynamic(() => import("./checkbox"));

interface CheckboxGroupProps {
  label: string;
  options: string[];
  onChange?: (selected: string[]) => void; // Hacemos onChange opcional
  selected?: string[]; // Hacemos selected opcional
  defaultSelected?: string[]; // Valores seleccionados por defecto (solo se usa si no es controlado)
  required?: boolean;
  errorCondition?: (selected: string[]) => boolean;
  className?: string;
}

const StyledGroupWrapper = styled.div<{ isInvalid: boolean }>`
  display: flex;
  flex-direction: column;
  ${(props) =>
    props.isInvalid &&
    `
    color: red;
  `}
`;

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  onChange,
  selected,
  defaultSelected = [],
  required = false,
  errorCondition,
  className,
}) => {
  // Estado local para un comportamiento no controlado (si no se pasan 'selected' ni 'onChange')
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultSelected);
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  // Si 'selected' y 'onChange' no se pasan, usamos el estado local
  const optionsToUse = selected ?? selectedOptions;
  const handleChange = onChange ?? setSelectedOptions;

  // Validación del grupo de checkboxes
  useEffect(() => {
    if (required && errorCondition) {
      setIsInvalid(errorCondition(optionsToUse));
    } else if (required) {
      setIsInvalid(optionsToUse.length === 0);
    }
  }, [optionsToUse, required, errorCondition]);

  const handleCheckboxChange = (option: string, isChecked: boolean) => {
    let updatedSelectedOptions = [...optionsToUse];

    if (isChecked) {
      updatedSelectedOptions.push(option);
    } else {
      updatedSelectedOptions = updatedSelectedOptions.filter(
        (item) => item !== option
      );
    }

    handleChange(updatedSelectedOptions); // Llamamos a onChange o setSelectedOptions
  };

  return (
    <StyledGroupWrapper isInvalid={isInvalid} className={className}>
      <h1 className={`font-bold px-2 mb-2 select-none`}>
        {label} {required && "*"}
      </h1>
      {options.map((option) => (
        <Checkbox
          key={option}
          label={option}
          checked={optionsToUse.includes(option)}
          onChange={(isChecked) => {
            handleCheckboxChange(option, isChecked);
          }}
        />
      ))}
      {isInvalid && (
        <span style={{ color: "red", fontSize: "0.9rem" }}>
          Debes seleccionar al menos una opción.
        </span>
      )}
    </StyledGroupWrapper>
  );
};

export default CheckboxGroup;
