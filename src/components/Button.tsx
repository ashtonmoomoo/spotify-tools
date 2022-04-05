type ButtonProps = {
  buttonProps?: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >;
  text: string;
};

function Button({ text, buttonProps }: ButtonProps) {
  return (
    <button className="form-button" {...buttonProps}>
      {text}
    </button>
  );
}

export default Button;
