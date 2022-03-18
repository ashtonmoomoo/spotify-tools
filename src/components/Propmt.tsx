type PromptProps = {
  token: string;
};

function Prompt(props: PromptProps) {
  const { token } = props;

  return <p>Managed to get token :)</p>;
}

export default Prompt;
