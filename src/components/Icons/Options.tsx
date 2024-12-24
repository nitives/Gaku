export const Options = ({ className }: { className: string }) => {
  return (
    <div className="flex items-center justify-center gap-1">
      <svg
        width="24"
        height="24"
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle
          fill="var(--iconCircleFill, transparent)"
          cx="14"
          cy="14"
          r="14"
        ></circle>
        <path
          fill="var(--iconEllipsisFill, white)"
          d="M10.105 14c0-.87-.687-1.55-1.564-1.55-.862 0-1.557.695-1.557 1.55 0 .848.695 1.55 1.557 1.55.855 0 1.564-.702 1.564-1.55zm5.437 0c0-.87-.68-1.55-1.542-1.55A1.55 1.55 0 0012.45 14c0 .848.695 1.55 1.55 1.55.848 0 1.542-.702 1.542-1.55zm5.474 0c0-.87-.687-1.55-1.557-1.55-.87 0-1.564.695-1.564 1.55 0 .848.694 1.55 1.564 1.55.848 0 1.557-.702 1.557-1.55z"
        ></path>
      </svg>
      <span className="sr-only">Options</span>
    </div>
  );
};
