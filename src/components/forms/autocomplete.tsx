import { Autocomplete, AutocompleteItem } from "@heroui/react";

const AutocompleteComponent = ({ places }: { places: string[] }) => {
  return (
    <div className="w-full flex flex-col gap-4 z-0">
      <div className="flex w-full flex-wrap md:flex-nowrap mb-6 md:mb-0 gap-4">
        <Autocomplete
          className="max-w-xs"
          defaultItems={places.map((place) => ({
            label: place,
            value: place,
          }))}
          label="Select an animal"
          variant="bordered"
        >
          {(item) => (
            <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>
          )}
        </Autocomplete>
      </div>
    </div>
  );
};

export default AutocompleteComponent;
