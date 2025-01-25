import "./spinner.css";

export const Spinner = () => {
  return (
    <div className="loading-spinner" style={{ animationDelay: "1000ms" }}>
      <div className="pulse-spinner">
        <div className="pulse-spinner-container">
          <div className="pulse-spinner__nib pulse-spinner__nib--1"></div>{" "}
          <div className="pulse-spinner__nib pulse-spinner__nib--2"></div>{" "}
          <div className="pulse-spinner__nib pulse-spinner__nib--3"></div>{" "}
          <div className="pulse-spinner__nib pulse-spinner__nib--4"></div>{" "}
          <div className="pulse-spinner__nib pulse-spinner__nib--5"></div>{" "}
          <div className="pulse-spinner__nib pulse-spinner__nib--6"></div>{" "}
          <div className="pulse-spinner__nib pulse-spinner__nib--7"></div>{" "}
          <div className="pulse-spinner__nib pulse-spinner__nib--8"></div>
        </div>
      </div>
    </div>
  );
};
