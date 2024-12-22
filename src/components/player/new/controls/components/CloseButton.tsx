import { XMark } from "@/components/Icons/XMark";
import styles from "./CloseButton.module.css";

export const CloseButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      aria-label="Close"
      role="button"
      className={styles.closeButton}
      onClick={onClick}
    >
      {/* CloseButton */}
      <XMark className={styles.xmark} height="100%" width="100%" />
    </button>
  );
};
