declare global {
  declare module "@types/react" {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      begin?: string;
      end?: string;
      "ttm:role"?: string;
    }
  }
}
