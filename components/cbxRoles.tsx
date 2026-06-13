import { Role } from "@/convex/roles";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./ui/combobox";
import { ComboboxRoot } from "@base-ui/react";

interface ComboBoxProps {
  roles: Role[];
  value?: Role | null;
  onChanged?: (
    value: Role | null,
    eventDetails: ComboboxRoot.ChangeEventDetails,
  ) => void;
}

export default function CbxRoles({ roles, value, onChanged }: ComboBoxProps) {
  return (
    <Combobox
      items={roles}
      value={value}
      onValueChange={onChanged}
      itemToStringValue={(role) => role._id}
      itemToStringLabel={(role) => role.name}
    >
      <ComboboxInput placeholder="Select Role" showClear />
      <ComboboxContent
        onWheel={(e) => e.stopPropagation()}
        className="pointer-events-auto"
      >
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item._id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
