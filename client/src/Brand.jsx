import logo from "./assets/logo.png";

export default function Brand() {
  return (
    <div className="brand">
      <img src={logo} alt="" />
      <span className="brand-name">
        SAJ<i>GHAR</i>
      </span>
    </div>
  );
}