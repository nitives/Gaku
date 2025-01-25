import { USER } from "@/lib/constants";

export default function Home() {
  return <div>
    <h1>Home</h1>
    <p>Hello, {USER.name}</p>
  </div>;
}
