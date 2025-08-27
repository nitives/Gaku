import style from "./Banner.module.css";

export const Banner = ({ query }: { query: string }) => {
  return (
    <div className={style.Banner}>
      Showing results for “<mark>{query}</mark>”
    </div>
  );
};
