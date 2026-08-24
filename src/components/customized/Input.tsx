import React, { forwardRef } from "react";
import {
    Input,
    TextArea as BaseTextArea,
    InputProps,
    TextAreaProps,
} from "@components/ui";

const AppInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
    <Input {...props} ref={ref} />
));
AppInput.displayName = "AppInput";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (props, ref) => <BaseTextArea {...props} ref={ref} />,
);
TextArea.displayName = "AppTextArea";

export default AppInput;
