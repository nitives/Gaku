interface TryAgainProps {
  errorName: string;
  errorMessage: string;
  onTryAgain: () => void;
}

export const TryAgain = ({
  errorMessage,
  errorName,
  onTryAgain,
}: TryAgainProps) => {
  return (
    <div className="w-fit h-[95vh] flex flex-col items-center justify-center text-center m-auto">
      <p style={{ textAlign: "center", fontWeight: 600 }}>{errorName}</p>
      <p style={{ color: "var(--systemSecondary)", maxWidth: "10rem" }}>
        {errorMessage}
      </p>
      <button id="TryAgainSearchButton" onClick={onTryAgain}>
        Try again
      </button>
    </div>
  );
};
