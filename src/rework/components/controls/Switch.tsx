import * as SwitchR from "@radix-ui/react-switch";
import { ComponentPropsWithoutRef } from "react";

// Extend the Root component props
type SwitchProps = ComponentPropsWithoutRef<typeof SwitchR.Root>;

export const Switch = (props: SwitchProps) => {
  const {
    className = "relative h-6 w-11 cursor-pointer rounded-full bg-[--labelDivider] outline-none data-[state=checked]:bg-[--keyColor]",
    ...otherProps
  } = props;

  return (
    <SwitchR.Root className={className} {...otherProps}>
      <SwitchR.Thumb className="block size-5 rounded-full bg-white transition-transform duration-200 will-change-transform translate-x-[0.1rem] data-[state=checked]:translate-x-[1.4rem]" />
    </SwitchR.Root>
  );
};
